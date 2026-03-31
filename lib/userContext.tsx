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
  role?: string;
  owner_approved?: boolean;
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

  // ================= FETCH PROFILE =================
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role, owner_approved")
      .eq("id", userId)
      .single();

    setProfile(data || null);
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;

      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
        });

        await fetchProfile(currentUser.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  // ================= AUTH LISTENER (FIXED) =================
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {

      // 🔥 CRITICAL FIX: delay to prevent lock error
      setTimeout(async () => {
        const currentUser = session?.user;

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
          });

          await fetchProfile(currentUser.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
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