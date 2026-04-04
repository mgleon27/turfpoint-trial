"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser(); // ✅ FIXED
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}