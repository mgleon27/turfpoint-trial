"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";
import dynamic from "next/dynamic";
import { useUser } from "@/lib/userContext";

import UserOnly from "@/components/UserOnly";

// ✅ MOBILE COMPONENTS
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
);

// ================= TYPES =================
type Booking = {
  id: string;
  turf_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;

  turfs?: {
    name: string;
    locality: string;
    image_url?: string;
  };
};

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  const { user, loading } = useUser(); // ✅ GLOBAL AUTH

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= AUTH =================
  
useEffect(() => {
  const loadBookings = async () => {
    if (!user) return;

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        turfs (
          name,
          locality,
          image_url
        )
      `)
      .eq("user_id", user.id)
      .order("booking_date", { ascending: true });

    if (bookingsData) setBookings(bookingsData);
  };

  loadBookings();
}, [user]);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

  // ================= FILTER =================
  const now = new Date();

  const upcoming = bookings.filter((b) => {
    return new Date(`${b.booking_date}T${b.start_time}`) >= now;
  });

  const completed = bookings.filter((b) => {
    return new Date(`${b.booking_date}T${b.end_time}`) < now;
  });

  const dataToShow = activeTab === "upcoming" ? upcoming : completed;

  return (
    <UserOnly>
    <div className="bg-white min-h-screen">

      {/* ================= MOBILE ================= */}
      <div className="md:hidden">
        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        <div className="px-4 mt-4">

          <h2 className="text-base text-black font-medium font-sans mb-4">Your Bookings</h2>

          {/* ❌ NOT LOGGED IN */}
          {!user && (
            <div className="flex flex-col items-center shadow-lg/20 text-center justify-center bg-gray-100 rounded-xl p-6 text-center shadow">
              <img src="/bookings.png" className="w-37 h-37 mb-4" />
              <p className="mb-4 text-gray-700 text-sm">
                Please Login to View Your Bookings...
              </p>

              <button
                onClick={() => router.push("/login")}
                className="bg-blue-500 text-white px-5 font-semibold py-2 rounded-lg"
              >
                Login Now
              </button>
            </div>
          )}

          {/* ✅ LOGGED IN */}
          {user && (
            <>
              {/* TABS */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`flex-1 py-2 rounded-full text-sm shadow-lg/20 border-1 border-green-400 ${
                    activeTab === "upcoming"
                      ? "bg-green-500 text-white font-sans"
                      : "bg-emerald-50 text-black font-sans"
                  }`}
                >
                  Upcoming
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex-1 py-2 rounded-full text-sm shadow-lg/20 border-1 border-green-400 ${
                    activeTab === "completed"
                      ? "bg-green-500 text-white font-sans"
                      : "bg-emerald-50 text-black font-sans"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* BOOKINGS */}
              <div className="flex flex-col gap-4">
                {dataToShow.map((b) => (
                  <MobileBookingCard key={b.id} booking={b} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      

      {/* ================= DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:block">
        <Header
          search={search}
          setSearch={setSearch}
          setShowLocationModal={setShowLocationModal}
        />

        {/* 🔥 NOT LOGGED IN UI (BELOW HEADER) */}
    {!user && (
      <div className="max-w-[1200px] mx-auto px-6 mt-10">

        <div className="bg-white p-6 rounded-xl shadow text-center">

          <h2 className="text-xl font-semibold mb-2">
            Please login to view bookings
          </h2>

          <p className="text-gray-500 mb-4">
            You need to login to access your bookings
          </p>

          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white px-6 py-2 rounded-full"
          >
            Login
          </button>

        </div>
      </div>
    )}

    {/* 🔥 LOGGED IN UI */}
    {user && (
      <>
        {/* TABS */}
        <div className="max-w-[1200px] mx-auto px-6 mt-6 flex gap-4 ">
          
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-12 py-2 rounded-full border border-gray-300 shadow-lg/30 ${
              activeTab === "upcoming"
                ? "bg-green-600 text-white font-sans"
                : "bg-white text-black font-sans"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-12 py-2 rounded-full border border-gray-300 shadow-lg/30 ${
              activeTab === "completed"
                ? "bg-green-600 text-white font-sans"
                : "bg-white text-black font-sans"
            }`}
          >
            Completed
          </button>
        </div>

        {/* BOOKINGS */}
        <div className="max-w-[1200px] mx-auto px-6 mt-6 grid gap-4">

          {dataToShow.length === 0 && (
            <p className="text-gray-500">
              No {activeTab} bookings found
            </p>
          )}

          {dataToShow.map((b) => (
            <div
              key={b.id}
              onClick={() => router.push(`/ticket/${b.id}`)}
              className="bg-white rounded-xl shadow-lg/20 flex overflow-hidden border border-gray-300"
            >

              {/* IMAGE */}
              <div className="p-3">
                <img
                  src={b.turfs?.image_url || "/turf.jpg"}
                  className="w-40 h-32 object-cover rounded-lg"
                />
              </div>

              {/* DETAILS */}
              <div className="p-4 flex flex-col justify-between w-full">

                <div>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold font-sans text-black">
                      {b.turfs?.name}
                    </h2>

                    <span className="text-sm text-gray-700 flex flex-row font-sans">
                      <img src="/icons/locationtop.png" className="h-4 mr-1 " /> {b.turfs?.locality}
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-1">
                    <img src="/icons/calendar.png" className="h-4 mr-1 " /><p className="text-sm font-sans text-black"> {b.booking_date}</p>
                  </div> 


                  <div className="flex flex-row items-center mt-1">
                    <img src="/icons/clock.png" className="h-4 mr-1 " /><p className="text-sm font-sans text-black"> {b.start_time} - {b.end_time}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 mb-2">
                  <p className="font-semibold font-sans text-black text-base">₹{b.price} 
                    <span className="font-medium font-sans text-gray-600 text-base"> / hr</span>
                  </p>

                  <div className=" bg-green-500 px-3 py-0.5 text-white text-base font-sans font-medium rounded-full text-center">
          View Ticket
        </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      </>
    )}
      </div>

      {/* LOCATION MODAL */}
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
    </div>
    </UserOnly>
  );
}

//////////////////////////////////////////////////////////////
// 📱 MOBILE BOOKING CARD
//////////////////////////////////////////////////////////////

function MobileBookingCard({ booking }: { booking: Booking }) {

  const router = useRouter();

  return (
    <div onClick={() => router.push(`/ticket/${booking.id}`)}
    className="flex gap-3 bg-white rounded-xl p-3 shadow-lg/20">

      {/* IMAGE */}
      <img
        src={booking.turfs?.image_url || "/turf.jpg"}
        className="w-25 h-25 rounded-lg object-cover"
      />

      {/* DETAILS */}
      <div className="flex flex-col justify-between w-full">

        <div>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-base text-black font-sans">
              {booking.turfs?.name}
            </h2>

            <span className="text-sm text-black font-sans flex flex-row">
              <img src="/icons/locationtop.png" className="h-4 pr-0.5" />{booking.turfs?.locality}
            </span>
          </div>

          <p className="text-sm text-black mt-1 font-sans font-medium flex flex-row items-center text-center">
            <img src="/icons/calendar.png" className="h-4 pr-0.5" />
           {booking.booking_date}</p>
          <p className="text-sm text-black font-sans font-medium flex flex-row items-center text-center">
            <img src="/icons/clock.png" className="h-4 pr-0.5" />
             {booking.start_time} - {booking.end_time}
          </p>
        </div>

<div className="flex flex-rows justify-between items-center">
        <p className="font-semibold text-base text-black mt-1 font-sans ">
          ₹{booking.price} <span className="font-medium text-sm text-gray-700 font-sans"> /hr</span>
        </p>
        <div className=" bg-green-500 px-3 py-0.5 text-white text-sm font-sans font-medium rounded-full text-center">
          View Ticket
        </div>
</div>        

      </div>
    </div>
  );
}