"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 🔥 This is the missing piece
      await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      router.replace("/");
    };

    handleAuth();
  }, []);

  return <p className="text-center mt-10">Logging you in...</p>;
}