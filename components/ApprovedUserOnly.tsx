"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function ApprovedUserOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ✅ NOT LOGGED IN → ALLOW
    if (!user) return;

    // 🔥 OWNER LOGIC
    if (profile?.role === "owner") {
      if (profile.owner_approved) {
        router.replace("/owner"); // ✅ approved owner
      } else {
        router.replace("/owner-pending"); // ⏳ waiting approval
      }
    }

    // ✅ USER ROLE → ALLOW
  }, [user, profile, loading, router]);

  // ⏳ Prevent flicker while loading
  if (loading) return null;

  // 🔁 While redirecting owner → prevent rendering
  if (user && profile?.role === "owner") return null;

  return <>{children}</>;
}