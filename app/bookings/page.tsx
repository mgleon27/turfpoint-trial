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
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  const { user, loading } = useUser(); // ✅ GLOBAL AUTH

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= AUTH =================
  
useEffect(() => {
  const loadBookings = async () => {
  if (!user) {
  setPageLoading(false);
  return;
}

  setPageLoading(true); // 🔥 start loading

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

  setPageLoading(false); // 🔥 stop loading
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

  const upcoming = bookings
  .filter((b) => new Date(`${b.booking_date}T${b.start_time}`) >= now)
  .sort(
    (a, b) =>
      new Date(`${a.booking_date}T${a.start_time}`).getTime() -
      new Date(`${b.booking_date}T${b.start_time}`).getTime()
  );

const completed = bookings
  .filter((b) => new Date(`${b.booking_date}T${b.end_time}`) < now)
  .sort(
    (a, b) =>
      new Date(`${b.booking_date}T${b.end_time}`).getTime() -
      new Date(`${a.booking_date}T${a.end_time}`).getTime()
  );

  const dataToShow = activeTab === "upcoming" ? upcoming : completed;

  return (
    <UserOnly>
    <div className="bg-white min-h-screen">

      {/* ================= MOBILE ================= */}
      <div className="md:hidden">
        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        <div className="px-4 mt-4">

          <h2 className="text-lg text-black font-medium font-sans mb-4">Your Bookings</h2>

          {/* ❌ NOT LOGGED IN */}
          {!user && (
            <div className="flex flex-col items-center text-center justify-center p-6 text-center mt-7">
              <img src="/bookings.png" className="w-37 h-37 mb-4" />
              <p className="mb-4 text-gray-700 text-md font-sans font-medium">
                Please Login to View Your Bookings...
              </p>

              <button
                onClick={() => router.push("/login")}
                className="bg-blue-500 text-white px-4 font-medium py-1.5 rounded-md font-sans mt-5 shadow-md/30" 
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
                  className={`flex-1 py-1.5 rounded-full text-sm shadow-lg/20 border-1 border-green-400 ${
                    activeTab === "upcoming"
                      ? "bg-emerald-500 text-white font-sans font-medium"
                      : "bg-emerald-50 text-black font-sans font-normal"
                  }`}
                >
                  Upcoming
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex-1 py-2 rounded-full text-sm shadow-lg/20 border-1 border-green-400 ${
                    activeTab === "completed"
                      ? "bg-emerald-500 text-white font-sans font-medium"
                      : "bg-emerald-50 text-black font-sans font-normal"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* BOOKINGS */}
              <div className="flex flex-col gap-1">

  {pageLoading ? (
    [...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse mt-3">
        <div className="h-28 bg-gray-200 rounded-xl" />
      </div>
    ))
  ) : dataToShow.length === 0 ? (
    <div className="text-center py-6">
      <img src="/empty.png" className="w-24 mx-auto mb-2 opacity-70" />
      <p className="text-gray-400 text-sm">
        No {activeTab} bookings
      </p>
    </div>
  ) : (
    dataToShow.map((b) => (
      <MobileBookingCard key={b.id} booking={b} />
    ))
  )}

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

          {pageLoading ? (
  [...Array(4)].map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl mb-2" />
    </div>
  ))
) : dataToShow.length === 0 ? (
  <p className="text-gray-500">
    No {activeTab} bookings found
  </p>
) : (
  dataToShow.map((b) => (
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
          )))}

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

  const isUpcoming =
  new Date(`${booking.booking_date}T${booking.start_time}`) >= new Date();

  return (
    <div onClick={() => router.push(`/ticket/${booking.id}`)}
    className="w-full">

      {/* MAIN CARD */}
      

        {/* 🎟 TOP TICKET */}
        <div className="flex rounded-xl overflow-hidden relative mt-3 mb-0 shadow-sm active:scale-95 transition h-29">

          {/* LEFT GREEN */}
        <div className="bg-green-500 text-white pt-2 pl-2 pr-2 pb-0 flex-1 rounded-l-xl relative w-4/6 h-29 ">








          <div className="flex items-center justify-between">

            <div className="flex items-center ml-1">

              <img src="/icons/ground.png" className="h-5 " />
 
              <p className="text-sm font-sans pl-1">{booking.turfs?.name}</p>

            </div>

            <p className="text-[14px] text-white font-sans font-normal">₹{booking.price}</p>

          </div> 


            <p className="text-[11px] font-sans font-light text-white mt-1 opacity-90 ml-1">Time</p>
            <p className="text-sm text-white font-sans font-normal ml-1">
              {booking.start_time} - {booking.end_time} </p>


            <p className="text-[11px] font-sans font-light text-white mt-1 opacity-90 ml-1">Date</p>


<div className="flex justify-between">
            <p className="text-sm text-white font-sans font-normal ml-1">
              {new Date(booking.booking_date).toLocaleDateString()} </p>

            <div className="flex items-center gap-0.5"> 
              <img src="/icons/location-white.png" className="h-3.5 -mt-1" />
              <p className=" text-[12px]/5 text-white font-sans font-normal">{booking.turfs?.locality}</p>
            </div>  

</div>



            {!isUpcoming && (
  <button
  onClick={(e) => {
    e.stopPropagation(); // 🔥 important
    router.push(`/turf/${booking.turf_id}`);
  }}
  className="mt-2 text-xs bg-white text-green-600 px-3 py-1 rounded"
>
  Book Again
</button>
)}

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
          <div 
          className="bg-white border border-green-600 p-1 flex items-center justify-center rounded-r-xl w-2/6">
          <div className="relative">
            <img
              src="/icons/qrframe.png"
              className="w-120 blur-xs"
            />
            <p className="absolute top-[44%] left-[27%] font-normal font-sans text-[12px] text-black">Show QR</p>
            </div>
          </div>
        </div>

        </div>
  );
}