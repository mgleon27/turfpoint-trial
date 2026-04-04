"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function UserOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (profile?.role === "owner") {
      if (profile.owner_approved) {
        router.replace("/owner");
      } else {
        router.replace("/owner-pending");
      }
    }
  }, [profile, loading, router]);

  if (!loading && profile?.role === "owner") {
    return null;
  }

  return <>{children}</>;
}