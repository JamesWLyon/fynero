"use client";

import { useEffect, useState } from "react";
import { getUserProfile, type Profile } from "@/lib/supabase/profiles";

export default function UsernameDisplay() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getUserProfile().then(({ data }) => setProfile(data));
  }, []);

  if (!profile) return null;

  return (
    <span>{profile.username}!</span>
  );
}