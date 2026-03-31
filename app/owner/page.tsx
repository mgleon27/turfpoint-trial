"use client";

import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OwnerEntry() {
  const { user, profile, loading } = useUser();
  const router = useRouter();



  useEffect(() => {
  if (loading) return;

  if (!user) {
    router.push("/login");
    return;
  }

  if (profile?.role !== "owner" || !profile?.owner_approved) {
    router.push("/"); // 🚫 block non-owner
  }
}, [user, profile, loading]);






  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile?.role === "owner" && profile.owner_approved) {
      router.push("/owner/dashboard");
    }
  }, [user, profile, loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-4">Become a Turf Owner</h1>

      <p className="text-gray-600 mb-4">
        List your turf and start getting bookings
      </p>

      <button className="bg-green-500 text-white px-5 py-2 rounded">
        Request Access
      </button>
    </div>
  );
}