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

  const [showEditToast, setShowEditToast] = useState(false); //Edit profile

  const [showLogoutToast, setShowLogoutToast] = useState(false); // Logout

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= LOGOUT =================
  const logout = async () => {
  await supabase.auth.signOut();

  setShowLogoutToast(true);

  setTimeout(() => {
    router.refresh();
  }, 1000);
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


  // ================= LOGGED IN UI =================
  return (
  <div className="bg-gray-100 min-h-screen">

    {/* ================= MOBILE ================= */}
    <div className="md:hidden bg-gray-100 min-h-screen pt-2">

  <MobileHeader setShowLocationModal={setShowLocationModal} />
  <MobileNav />

  {/* ❌ NOT LOGGED IN */}
  {!user && (
    <div className="flex flex-col items-center justify-center mt-20 px-6 text-center">

      <img src="/profile.png" className="w-37 h-37 mb-4" />

      <h2 className="text-lg text-black font-semibold mb-2">
        Login to access your profile
      </h2>

      <p className="text-gray-600 text-sm mb-5">
        View bookings, favourites and manage your account
      </p>

      <button
        onClick={() => router.push("/login")}
        className="bg-green-500 text-white font-semibold px-6 py-2 rounded-full"
      >
        Login
      </button>
    </div>
  )}

  {/* ✅ LOGGED IN */}
  {user && (
    <div className="px-4 mt-4">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">

        <img
          src={profile?.avatar_url || "/profile.png"}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>
          <h2 className="font-semibold text-lg">
            {profile?.full_name || "User"}
          </h2>

          <p className="text-sm text-gray-500">
            {user.email}
          </p>
        </div>
      </div>

      {/* MENU LIST */}
      <div className="mt-6 flex flex-col gap-3">

        <MenuItem
  title="Edit Profile"
  onClick={() => {
    setShowEditToast(true);

    setTimeout(() => {
      setShowEditToast(false);
    }, 2000);
  }}
/>
        <MenuItem title="My Bookings" onClick={() => router.push("/bookings")} />
        <MenuItem title="Favourites" onClick={() => router.push("/favourites")} />
        <MenuItem title="Contact Help" onClick={() => router.push("/help")} />
        <MenuItem title="FAQ(s)" onClick={() => router.push("/faq")} />

      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="w-full bg-red-500 text-white py-3 rounded-xl mt-8"
      >
        Logout
      </button>

    </div>
  )}
</div>

{/* LOCATION MODAL (UNCHANGED) */}
    {showLocationModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
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

    {showLogoutToast && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full shadow-lg animate-fadeIn">
    Logged out successfully ✅
  </div>
)}


    {showEditToast && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full shadow-lg text-sm">
    Profile can be edited from the application 📱
  </div>
)}

  </div>

  

  
);
}
function MenuItem({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition"
    >
      <span className="text-sm font-medium">{title}</span>
      <span className="text-gray-400">›</span>
    </div>
  );
}