"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { useLocation } from "@/lib/locationContext";
import { useUser } from "@/lib/userContext";

import UserOnly from "@/components/UserOnly";


import Header from "@/components/Header";
import dynamic from "next/dynamic";

// MOBILE
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  const [search, setSearch] = useState("");
  const [showEditToast, setShowEditToast] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= LOGOUT =================
  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();

      setShowLogoutToast(true);

      setTimeout(() => {
        setShowLogoutToast(false);
        setLoggingOut(false);
      }, 1200);

    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <UserOnly>

    <div className="bg-white min-h-screen">

      {/* ================= MOBILE ================= */}
      <div className="md:hidden bg-white min-h-screen pt-2">

        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        {/* NOT LOGGED IN */}
        {!user && (
          <div className="flex flex-col items-center justify-center mt-20 px-6 text-center">
            <img src="/profile.png" className="w-37 h-37 mb-4" />

            <h2 className="text-lg font-semibold mb-2">
              Login to access your profile
            </h2>

            <p className="text-gray-600 text-sm mb-5">
              View bookings, favourites and manage your account
            </p>

            <button
              onClick={() => router.push("/login")}
              className="bg-green-500 text-white px-6 py-2 rounded-full"
            >
              Login
            </button>



            <div className="mt-6 flex flex-col gap-3 mb-10">
              <p className="text-lg font-semibold text-left font-sans text-black ">Our Policies</p>

              <PolicyMenuItem title="Terms & Conditions" onClick={() => router.push("/terms")} />
              <PolicyMenuItem title="Refund and Payment" onClick={() => router.push("/refund")} />
              <PolicyMenuItem title="Contact us" onClick={() => router.push("/contact")} />
            </div>

          </div>

          
        )}

        {/* LOGGED IN */}
        {user && (
          <div className="px-4 mt-4">

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg/20 p-5 flex items-center gap-4">
              <img
                src={profile?.avatar_url || "/profile.png"}
                onError={(e) => (e.currentTarget.src = "/profile.png")}
                className="w-16 h-16 rounded-full object-cover"
              />

              <div>
                <h2 className="font-semibold text-lg text-black font-sans">
                  {profile?.full_name || "User"}
                </h2>

                <p className="text-sm text-gray-500 font-sans">
                  {user.email}
                </p>
              </div>
            </div>

            {/* MENU */}
            <div className="mt-6 flex flex-col gap-3">
              <MenuItem title="Edit Profile" onClick={() => {
                setShowEditToast(true);
                setTimeout(() => setShowEditToast(false), 2000);
              }} />
              <MenuItem title="My Bookings" onClick={() => router.push("/bookings")} />
              <MenuItem title="Favourites" onClick={() => router.push("/favourites")} />
              <MenuItem title="Refund Policy" onClick={() => router.push("/refund")} />
              <MenuItem title="Terms & Conditions" onClick={() => router.push("/terms")} />
              <MenuItem title="Contact us" onClick={() => router.push("/contact")} />
            </div>

            {/* LOGOUT */}
            <button
              onClick={logout}
              disabled={loggingOut}
              className="w-full bg-red-500 text-white py-3 rounded-xl mt-8 flex items-center justify-center gap-2 font-sans"
            >
              {loggingOut ? "Logging out..." : "Logout Now"}
            </button>

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

          <div className="mt-10 flex flex-col gap-3">
            <p className="text-left font-semibold text-lg text-black">Our Policies</p>

            <button
              onClick={() => router.push("/terms")}
              className="bg-gray-100 p-3 rounded border border-gray-400 shadow-lg/20 shadow-gray-500"
            >
              Terms & Conditions
            </button>

            <button
              onClick={() => router.push("/refund")}
              className="bg-gray-100 p-3 rounded border border-gray-400 shadow-lg/20 shadow-gray-500"
            >
              Refund and Payment
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="bg-gray-100 p-3 rounded border border-gray-400 shadow-lg/20 shadow-gray-500"
            >
              Contact us
            </button>

          </div>


        </div>
        
      )}

      {/* ✅ LOGGED IN UI */}
      {user && (
        <div className="max-w-[600px] mx-auto mt-10 bg-white p-6 rounded-xl shadow">

          <div className="flex flex-col items-center">
            <img
              src={profile?.avatar_url || "/profile.png"}
              onError={(e) => (e.currentTarget.src = "/profile.png")}
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
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              Edit Profile
            </button>

            <button
              onClick={() => router.push("/bookings")}
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              My Bookings
            </button>

            <button
              onClick={() => router.push("/favourites")}
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              Favourites
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              Contact Help
            </button>

            <button
              onClick={() => router.push("/terms")}
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              Terms & Conditions
            </button>

            <button
              onClick={() => router.push("/refund")}
              className="bg-gray-100 p-3 rounded shadow-lg/10 border border-gray-300"
            >
              Payment and Refund
            </button>

            <button
  onClick={() => {
    if (!loggingOut) logout();
  }}
  disabled={loggingOut}
              className="bg-red-500 text-white p-3 rounded mt-20 shadow-lg/30"
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

      {/* TOASTS */}
      {showLogoutToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full font-sans">
          Logged out successfully ✅
        </div>
      )}

      {showEditToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full font-sans">
          Profile can be edited from the app 📱
        </div>
      )}

    </div>
    </UserOnly>
  );
}

function MenuItem({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 border border-gray-100 rounded-xl shadow-lg/20 flex justify-between items-center cursor-pointer text-black font-sans"
    >
      <span className="text-sm font-medium text-black font-sans">{title}</span>
      <span className="text-gray-400 text-black font-sans">›</span>
    </div>
  );
}

function PolicyMenuItem({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-3 px-20 border border-gray-400 rounded-xl shadow-lg/20 items-center cursor-pointer "
    >
      <span className="text-base font-medium text-center text-black font-sans ">{title}</span>
    </div>
  );
}