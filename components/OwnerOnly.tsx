"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (profile?.role !== "owner" || !profile?.owner_approved) {
      router.replace("/");
    }
  }, [user, profile, loading, router]);

  if (
    loading ||
    !user ||
    profile?.role !== "owner" ||
    !profile?.owner_approved
  ) {
    return null;
  }

  return <>{children}</>;
}