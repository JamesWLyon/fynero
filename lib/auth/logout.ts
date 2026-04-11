import { createClient } from "@/lib/supabase/client";

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}