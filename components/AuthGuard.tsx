"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loadingUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace("/login");
    }
  }, [user, loadingUser, router]);

  // ⏳ wait for auth
  if (loadingUser) {
    return <div className="p-5">Loading...</div>;
  }

  // 🔒 block UI until redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}