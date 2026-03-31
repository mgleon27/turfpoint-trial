"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function UserOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (profile?.role === "owner" && profile?.owner_approved) {
      router.replace("/owner");
    }
  }, [profile, loading, router]);

  // 🔒 block UI
  if (!loading && profile?.role === "owner" && profile?.owner_approved) {
    return null;
  }

  return <>{children}</>;
}