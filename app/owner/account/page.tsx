"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";

type Profile = {
  full_name: string;
};

type Turf = {
  id: string;
  is_active: boolean;
};

type Booking = {
  price: number;
};

export default function OwnerAccount() {
  const router = useRouter();
  const { user } = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ================= LOAD =================
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // PROFILE
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // TURFS
      const { data: turfData } = await supabase
        .from("turfs")
        .select("id,is_active")
        .eq("owner_id", user.id);

      setTurfs(turfData || []);

      // BOOKINGS
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("price")
        .eq("owner_id", user.id); // ⚠️ if not exists, tell me

      setBookings(bookingData || []);
    };

    load();
  }, [user]);

  // ================= CALCULATIONS =================

  const totalTurfs = turfs.length;
  const activeTurfs = turfs.filter(t => t.is_active).length;

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((s, b) => s + (b.price || 0), 0);

  // ================= LOGOUT =================

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-white pt-3">

      <OwnerMobileHeader />
      <OwnerMobileNav />

      <div className="px-4 space-y-3">

        <p className="text-lg text-black font-sans font-medium mt-2">Account</p>

        {/* PROFILE */}
        <div className="border rounded-2xl px-4 py-3 flex items-center gap-4 border-gray-400 shadow-sm bg-green-50">

          <div className="w-15 h-15 bg-black rounded-full" />

          <div>
            <p className="text-xl font-medium font-sans text-black -mt-1">
              {profile?.full_name || "Owner Name"}
            </p>
            <p className="text-gray-500 text-sm/3 font-medium font-sans">
              {user?.email}
            </p>

             <p className="text-gray-500 text-sm/3 pt-2 font-medium font-sans">+91 9976334971</p>

          </div>

        </div>

        {/* BUSINESS DETAILS */}
        <div className="border rounded-2xl p-4 border-gray-400 shadow-sm bg-green-50">

          <p className="text-base text-black font-sans font-medium mb-3">
            Business Details
          </p>

          <div className="space-y-2 text-gray-700 font-sans font-normal">

            <p>Total Turfs : {totalTurfs}</p>
            <p>Active Turfs : {activeTurfs}</p>
            <p>Total Bookings : {totalBookings}</p>
            <p>Total Revenue : ₹{totalRevenue}</p>

          </div>

        </div>

        {/* PAYMENT DETAILS (STATIC) */}
        <div className="border rounded-2xl p-4 border-gray-400 shadow-sm bg-green-50">

          <p className="text-base text-black font-sans font-medium mb-3">
            Payment Details
          </p>

          <div className="space-y-2 text-gray-700 font-sans font-normal">

            <p>Bank Name : HDFC Bank</p>
            <p>UPI Id : owner@upi</p>
            <p>Payment Settled : Immediately</p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div onClick={() => router.push("/contact")}
        className="border rounded-xl px-4 py-3 text-base font-medium font-sans text-black border-gray-400 shadow-sm bg-green-50">
          <p>Edit Profile</p>
        </div>

        <div onClick={() => router.push("/refund")}
        className="border rounded-xl px-4 py-3 text-base font-medium font-sans text-black border-gray-400 shadow-sm bg-green-50">
          <p>Payment Details</p>
        </div>

        <div onClick={() => router.push("/contact")}
        className="border rounded-xl px-4 py-3 text-base font-medium font-sans text-black border-gray-400 shadow-sm bg-green-50">
          <p>Contact Support</p>
        </div>

        <div onClick={() => router.push("/refund")}
        className="border rounded-xl px-4 py-3 text-base font-medium font-sans text-black border-gray-400 shadow-sm bg-green-50">
          <p>Payment Policy</p>
        </div>

        <div onClick={() => router.push("/terms")}
        className="border rounded-xl px-4 py-3 text-base font-medium font-sans text-black border-gray-400 shadow-sm bg-green-50">
          <p>Terms & Conditions</p>
        </div>





        {/* LOGOUT */}
        <div
          onClick={logout}
          className="flex items-center gap-3 text-red-600 text-lg font-medium font-sans mt-7 cursor-pointer ml-3"
        >
          <span className="text-2xl">⏻</span>
          Log Out
        </div>

      </div>
    </div>
  );
}