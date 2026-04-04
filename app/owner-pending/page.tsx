"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OwnerPendingPage() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh(); // 🔄 reloads current page (checks approval again)
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // 🔒 redirect after logout
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">

      <div className="text-center max-w-md">

        <h1 className="text-2xl font-bold text-black mb-4">
          Approval Pending ⏳
        </h1>

        <p className="text-gray-600 mb-6">
          Your owner account is under review.  
          Please wait until admin approves your request.
        </p>

        {/* BUTTONS */}
        <div className="flex gap-3 justify-center">

          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}