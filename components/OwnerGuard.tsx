"use client";

import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OwnerGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (profile?.role !== "owner") {
      router.replace("/");
      return;
    }
  }, [user, profile, loading]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!profile?.owner_approved) {
    return (
      <div className="p-6 text-center">
        ⏳ Your owner account is waiting for approval
      </div>
    );
  }

  return <>{children}</>;
}