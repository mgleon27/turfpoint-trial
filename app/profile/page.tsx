"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { useLocation } from "@/lib/locationContext";
import { useUser } from "@/lib/userContext";

import Header from "@/components/Header";
import dynamic from "next/dynamic";

// ✅ MOBILE COMPONENTS
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";


const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
);

// ================= TYPES =================
type Profile = {
  full_name: string;
  avatar_url?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const { user, profile, loading } = useUser(); // ✅ GLOBAL AUTH

  const [search, setSearch] = useState("");

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= LOGOUT =================
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // optional redirect
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ================= NOT LOGGED IN =================
  if (!user) {
    return (
      <div className="bg-gray-100 min-h-screen">

        <Header
          search={search}
          setSearch={setSearch}
          setShowLocationModal={setShowLocationModal}
        />

        <div className="max-w-[600px] mx-auto mt-10 bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold mb-2">
            Please login to view profile
          </h2>

          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white px-5 py-2 rounded-full"
          >
            Login
          </button>
        </div>

      </div>
    );
  }

  // ================= LOGGED IN UI =================
  return (
  <div className="bg-gray-100 min-h-screen">

    {/* ================= MOBILE ================= */}
    <div className="md:hidden">
      <MobileHeader />
      <MobileNav />

      {/* ❌ NOT LOGGED IN */}
      {!user && (
        <div className="px-4 mt-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-lg font-semibold mb-3">
              Please login to view profile
            </h2>

            <button
              onClick={() => router.push("/login")}
              className="bg-green-500 text-white px-5 py-2 rounded-full"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* ✅ LOGGED IN */}
      {user && (
        <div className="px-4 mt-6">

          <div className="bg-white p-5 rounded-xl shadow">

            {/* PROFILE */}
            <div className="flex flex-col items-center">
              <img
                src={profile?.avatar_url || "/profile.png"}
                className="w-20 h-20 rounded-full object-cover border"
              />

              <h2 className="text-lg font-semibold mt-3">
                {profile?.full_name || "User"}
              </h2>

              <p className="text-gray-500 text-sm">
                {user.email}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-col gap-3">

              <button
                onClick={() => router.push("/profile")}
                className="bg-gray-100 p-3 rounded text-sm"
              >
                Edit Profile
              </button>

              <button
                onClick={() => router.push("/bookings")}
                className="bg-gray-100 p-3 rounded text-sm"
              >
                My Bookings
              </button>

              <button
                onClick={() => router.push("/favourites")}
                className="bg-gray-100 p-3 rounded text-sm"
              >
                Favourites
              </button>

              <button
                onClick={() => router.push("/help")}
                className="bg-gray-100 p-3 rounded text-sm"
              >
                Contact Help
              </button>

              <button
                onClick={() => router.push("/faq")}
                className="bg-gray-100 p-3 rounded text-sm"
              >
                FAQ(s)
              </button>

              <button
                onClick={logout}
                className="bg-red-500 text-white p-3 rounded mt-4"
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      )}
    </div>

    {/* ================= DESKTOP (UNCHANGED) ================= */}
    <div className="hidden md:block">

      <Header
        search={search}
        setSearch={setSearch}
        setShowLocationModal={setShowLocationModal}
      />

      {/* ❌ NOT LOGGED IN */}
      {!user && (
        <div className="max-w-[600px] mx-auto mt-10 bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold mb-2">
            Please login to view profile
          </h2>

          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white px-5 py-2 rounded-full"
          >
            Login
          </button>
        </div>
      )}

      {/* ✅ LOGGED IN UI */}
      {user && (
        <div className="max-w-[600px] mx-auto mt-10 bg-white p-6 rounded-xl shadow">

          <div className="flex flex-col items-center">
            <img
              src={profile?.avatar_url || "/profile.png"}
              className="w-24 h-24 rounded-full object-cover border"
            />

            <h2 className="text-xl font-semibold mt-4">
              {profile?.full_name || "User"}
            </h2>

            <p className="text-gray-500 text-sm">
              {user?.email}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3">

            <button
              onClick={() => router.push("/profile")}
              className="bg-gray-100 p-3 rounded"
            >
              Edit Profile
            </button>

            <button
              onClick={() => router.push("/bookings")}
              className="bg-gray-100 p-3 rounded"
            >
              My Bookings
            </button>

            <button
              onClick={() => router.push("/favourites")}
              className="bg-gray-100 p-3 rounded"
            >
              Favourites
            </button>

            <button
              onClick={() => router.push("/help")}
              className="bg-gray-100 p-3 rounded"
            >
              Contact Help
            </button>

            <button
              onClick={() => router.push("/faq")}
              className="bg-gray-100 p-3 rounded"
            >
              FAQ(s)
            </button>

            <button
              onClick={logout}
              className="bg-red-500 text-white p-3 rounded mt-20"
            >
              Logout
            </button>

          </div>
        </div>
      )}

    </div>

    {/* LOCATION MODAL (UNCHANGED) */}
    {showLocationModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-xl w-[400px]">

          <h2 className="font-semibold mb-3">Select Location</h2>

          <LocationPicker
            onSelect={(lat, lng) => {
              setLocationData({ lat, lng }, city);
            }}
          />

          <div className="flex justify-between mt-4">
            <button onClick={() => setShowLocationModal(false)}>
              Cancel
            </button>

            <button
              onClick={async () => {
                if (!location) return;

                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
                );
                const data = await res.json();

                const newCity =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "Selected Location";

                setLocationData(location, newCity);
                setShowLocationModal(false);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    )}

  </div>
);
}