"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Optional: wait briefly to ensure trigger has run
      await new Promise((res) => setTimeout(res, 300));

      router.replace("/");
    };

    handleLogin();
  }, []);

  return <p className="text-center mt-10">Logging you in...</p>;
}