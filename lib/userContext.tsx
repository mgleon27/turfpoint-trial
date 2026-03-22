"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserType = {
  id: string;
  email?: string;
};

type ProfileType = {
  full_name?: string;
  avatar_url?: string;
};

type UserContextType = {
  user: UserType | null;
  profile: ProfileType | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD USER =================
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email || "",
    });

    // fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", data.user.id)
      .single();

    setProfile(profileData || null);
    setLoading(false);
  };

  // ================= EFFECT =================
  useEffect(() => {
    const init = async () => {
      await loadUser();
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      await loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// ================= HOOK =================
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};