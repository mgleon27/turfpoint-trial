"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ❌ Not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // ❌ Not owner
    if (profile?.role !== "owner") {
      router.replace("/");
      return;
    }

    // ⏳ Owner but not approved
    if (!profile?.owner_approved) {
      router.replace("/owner-pending"); // 🔥 NEW
      return;
    }

  }, [user, profile, loading, router]);

  // 🔥 Better loading UX
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Block render until valid
  if (profile.role !== "owner" || !profile.owner_approved) {
    return null;
  }

  // ✅ Allowed
  return <>{children}</>;
}