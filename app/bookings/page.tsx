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
            <div className="flex flex-col items-center shadow-lg/20 text-center justify-center bg-green-100 rounded-xl p-6 text-center shadow">
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
              <div className="flex flex-col gap-1">
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
    <div className="w-full">

      {/* MAIN CARD */}
      

        {/* 🎟 TOP TICKET */}
        <div className="flex rounded-xl overflow-hidden relative mt-3 mb-2 shadow-sm">

          {/* LEFT GREEN */}
        <div className="bg-green-600 text-white pt-2 pl-2 pr-2 pb-0 flex-1 rounded-l-xl relative w-4/6 ">

          <div className="flex items-center justify-between">

            <div className="flex items-center ml-1">

              <img src="/icons/ground.png" className="h-5 " />
 
              <p className="text-sm font-sans pl-1">{booking.turfs?.name}</p>

            </div>

            <p className="text-base text-white font-sans font-semibold">₹{booking.price}</p>

          </div> 


            <p className="text-[11px] font-sans font-light text-white mt-1 opacity-90 ml-1">Time</p>
            <p className="text-sm text-white font-sans font-normal ml-1">
              {booking.start_time} - {booking.end_time} </p>


            <p className="text-[11px] font-sans font-light text-white mt-1 opacity-90 ml-1">Date</p>
            <p className="text-sm text-white font-sans font-normal ml-1">
              {booking.booking_date} </p>

            <div className="flex justify-end -mt-2.5 gap-1"> 
              <img src="/icons/location-white.png" className="h-4" />
              <p className=" text-sm/5 text-white font-sans font-normal">{booking.turfs?.locality}</p>
            </div>  

        </div>



{/* ✂️ PERFORATION */}
  <div className="relative flex flex-col justify-between items-center bg-white">

    {/* TOP CUT DOT */}
    <div className="w-3 h-3 bg-white rounded-full border border-green-600 -mt-1.5 z-10"></div>

    {/* DASHED LINE */}
    <div className="flex-1 border-l border-dashed border-gray-500"></div>

    {/* BOTTOM CUT DOT */}
    <div className="w-3 h-3 bg-white rounded-full border border-green-600 -mb-1.5 z-10"></div>

  </div>


          {/* RIGHT QR */}
          <div onClick={() => router.push(`/ticket/${booking.id}`)}
          className="bg-white border border-green-600 p-1 flex items-center justify-center rounded-r-xl w-2/6">
          <div className="relative">
            <img
              src="/icons/qrframe.png"
              className="w-120 blur-xs"
            />
            <p className="absolute top-[38%] left-[17%] font-medium font-sans text-lg text-black">Show QR</p>
            </div>
          </div>
        </div>

        </div>
  );
}