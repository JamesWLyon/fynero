import { createClient } from "@/lib/supabase/client";

// Types
export interface Profile {
  id: string;
  email: string;      // only visible to the owning user (RLS protected)
  username: string;   // publicly visible
  created_at: string;
  updated_at: string;
  // Future columns — add here + in the DB:
  // display_name?: string;
  // avatar_url?: string;
  // bio?: string;
}

// Public-safe subset — what anyone can see (no email)
export interface PublicProfile {
  id: string;
  username: string;
}

export type ProfileResult =
  | { data: Profile; error: null }
  | { data: null; error: string };

// Helper: resolve username → user id
export async function resolveUsernameToId(
  username: string
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles_public")   // public view — only id + username
    .select("id")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data.id;
}

// Helper: resolve username → email (for login flow only)
export async function resolveUsernameToEmail(
  username: string
): Promise<string | null> {
  const supabase = createClient();
  // Resolve id from public view first
  const id = await resolveUsernameToId(username);
  if (!id) return null;

  // Now fetch the email — only works if auth.uid() === id (RLS enforced)
  // At login time the user isn't authed yet, so we use a Postgres function
  // that runs as security definer to safely return only their own email.
  const { data, error } = await supabase
    .rpc("get_email_by_username", { p_username: username });

  if (error || !data) return null;
  return data as string;
}

// Helper: check username availability
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles_public")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  return data === null;
}

export async function getUserProfile(
  identifier?: string
): Promise<ProfileResult> {
  const supabase = createClient();

  try {
    // Always query the full profiles table — RLS enforces ownership
    let query = supabase.from("profiles").select("*");

    if (!identifier) {
      // No arg → current session user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { data: null, error: "No authenticated user found." };
      }

      query = query.eq("id", user.id);

    } else if (identifier.startsWith("@")) {
      // @username → resolve to id first via public view, then fetch full profile
      const id = await resolveUsernameToId(identifier.slice(1));
      if (!id) return { data: null, error: "Username not found." };
      query = query.eq("id", id);

    } else {
      // UUID
      query = query.eq("id", identifier);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return { data: null, error: error?.message ?? "Profile not found." };
    }

    return { data: data as Profile, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}

// updateUserProfile
export async function updateUserProfile(
  updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
): Promise<ProfileResult> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "No authenticated user found." };
  }

  // If updating username, check availability first
  if (updates.username) {
    const available = await isUsernameAvailable(updates.username);
    if (!available) {
      return { data: null, error: "Username is already taken." };
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Update failed." };
  }

  return { data: data as Profile, error: null };
}