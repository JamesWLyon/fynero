import { createClient } from "@/lib/supabase/client";

// Types
export interface Profile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  // display_name?: string;
  // avatar_url?: string;
  // bio?: string;
}

// Public-safe subset
export interface PublicProfile {
  id: string;
  username: string;
}

export type ProfileResult =
  | { data: Profile; error: null }
  | { data: null; error: string };

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

// Helper: resolve username → user id
export async function resolveUsernameToId(
  username: string
): Promise<string | null> {
  const supabase = createClient();
  const normalizedUsername = normalizeUsername(username);

  const { data, error } = await supabase
    .from("profiles_public")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

// Helper: resolve username → email (for login flow only)
export async function resolveUsernameToEmail(
  username: string
): Promise<string | null> {
  const supabase = createClient();
  const normalizedUsername = normalizeUsername(username);

  const { data, error } = await supabase.rpc("get_email_by_username", {
    p_username: normalizedUsername,
  });

  if (error || !data) return null;
  return data as string;
}

// Helper: check username availability
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || normalizedUsername.length < 3) return false;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles_public")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle();

  if (error) return false;
  return data === null;
}

export async function getUserProfile(
  identifier?: string
): Promise<ProfileResult> {
  const supabase = createClient();

  try {
    let query = supabase.from("profiles").select("*");

    if (!identifier) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { data: null, error: "No authenticated user found." };
      }

      query = query.eq("id", user.id);
    } else if (identifier.startsWith("@")) {
      const id = await resolveUsernameToId(identifier.slice(1));

      if (!id) {
        return { data: null, error: "Username not found." };
      }

      query = query.eq("id", id);
    } else {
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

  const normalizedUpdates = { ...updates };

  if (normalizedUpdates.username) {
    normalizedUpdates.username = normalizeUsername(normalizedUpdates.username);

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const currentUsername = currentProfile?.username
      ? normalizeUsername(currentProfile.username)
      : null;

    if (normalizedUpdates.username !== currentUsername) {
      const available = await isUsernameAvailable(normalizedUpdates.username);

      if (!available) {
        return { data: null, error: "Username is already taken." };
      }
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(normalizedUpdates)
    .eq("id", user.id)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Update failed." };
  }

  return { data: data as Profile, error: null };
}