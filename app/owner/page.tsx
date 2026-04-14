"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";

type Booking = {
  id: string;
  turf_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  booked_by: string;
  status: string;
 turfs: {
    name: string;
    owner_id: string;
    image_url?: string;
 };
};

type Turf = {
  id: string;
  name: string;
};

const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

export default function OwnerHome() {
  const { user } = useUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<string>("");

  const today = getToday();

  // ================= LOAD =================
  const load = async () => {
  if (!user) return;

  const { data: turfData } = await supabase
    .from("turfs")
    .select("id,name")
    .eq("owner_id", user.id);

  const turfsList = turfData || [];

  setTurfs(turfsList);

  // ✅ SET DEFAULT HERE (NO WARNING)
  if (turfsList.length > 0) {
    setSelectedTurf((prev) => prev || turfsList[0].id);
  }

  const { data: bookingData } = await supabase
    .from("bookings")
    .select(`
      *,
      turfs!inner(name, owner_id, image_url)
    `)
    .eq("turfs.owner_id", user.id);

  setBookings(bookingData || []);
};




  useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    await load();
  };

  fetchData();
}, [user]);

  // ================= CALCULATIONS =================

  const todayBookings = bookings.filter(
  (b) =>
    b.booking_date === today &&
    b.turf_id === selectedTurf
);

  const earnings = todayBookings.reduce((s, b) => s + (b.price || 0), 0);

  const upcoming = bookings
  .filter(
    (b) =>
      b.booking_date >= today &&
      b.turf_id === selectedTurf
  )
  .slice(0, 3);

  const bookingCount = todayBookings.length;

  const percentage = Math.round((bookingCount / 24) * 100);

  // ================= SLOT STATUS =================

  const hours = Array.from({ length: 24 }).map((_, i) => i);

  const slotStatus = hours.map((h) => {
    const key = `${String(h).padStart(2, "0")}:00:00`;

    const isBooked = todayBookings.some(
      (b) => b.start_time.slice(0,5) === key.slice(0,5) && b.turf_id === selectedTurf
    );

    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const slotMin = h * 60;

    if (isBooked) return "booked";
    if (slotMin < nowMin) return "timeout";
    return "available";
  });

  const availableCount = slotStatus.filter(s => s === "available").length;
  const bookedCount = slotStatus.filter(s => s === "booked").length;



  const selectedTurfName =
  turfs.find((t) => t.id === selectedTurf)?.name || "Turf";

  // ================= UI =================

  return (
    <div className="min-h-screen bg-white pt-3">

      <OwnerMobileHeader />
      <OwnerMobileNav />

      <div className="px-4">

        <p className="text-base text-black font-sans font-medium mt-2">Home</p>

        {/* TOP CARDS */}
        <div className="flex gap-3 mt-3">

          {/* Earnings */}
          <div className="flex-1 bg-green-100 rounded-lg p-4 shadow-md border border-gray-300">
            <p className="text-gray-600 text-sm font-sans font-medium">Todays Earnings</p>
            <p className="text-base font-semibold font-sans text-black mt-1 ">₹{earnings}</p>
            <p className="text-green-700 mt-2 text-sm font-sans font-medium">+4.6%</p>
          </div>

          {/* Bookings */}
          <div className="flex-1 bg-green-100 rounded-lg p-4 shadow-md border border-gray-300">
            <p className="text-gray-600 text-sm font-sans font-medium">Bookings Today</p>
            <p className="text-base font-medium font-sans text-black mt-1">
              {bookingCount} ({percentage}%)
            </p>
            <p className="text-green-700 mt-2 text-sm font-sans font-medium">+2</p>
          </div>

        </div>

        {/* UPCOMING */}
        <div className="mt-6 flex justify-between">
          <p className="text-base text-black font-sans font-medium">Upcoming Bookings</p>
          <div className="flex items-center gap-1">
          <p className="text-sm text-black font-sans font-medium">View All</p><img src="/icons/next.png" className="h-5" />
          </div>
        </div>

        <div className="mt-3 space-y-3">

  {upcoming.length === 0 ? (

    // 🔹 EMPTY STATE
    <div className="border border-dashed border-gray-500 rounded-lg p-6 text-center bg-gray-50">

  <img src="/empty.png" className="w-15 mx-auto mb-1 opacity-80" />


  <p className="text-sm text-gray-500 font-sans font-medium">
    No upcoming bookings today for
  </p>

  <p className="text-base font-medium font-sans text-black  mt-1">
    {selectedTurfName}
  </p>

</div>

  ) : (

    upcoming.map((b) => (
            <div key={b.id} className=" bg-white rounded-lg pl-2 pr-4 py-2 flex gap-3 border border-gray-300 shadow-lg/10">

              <img
  src={b.turfs?.image_url || "/icons/turf-placeholder.png"}
  onError={(e) => {
    (e.target as HTMLImageElement).src = "/icons/turf-placeholder.png";
  }}
  className="w-20 h-17 rounded-md object-cover"
  alt="turf"
/>

              <div className="flex-1">
                <p className="font-medium font-sans text-black text-base">{b.turfs?.name}</p>
                <p className="font-medium font-sans text-sm text-gray-700">{new Date(b.booking_date).toDateString()}</p>
                <p className="font-medium font-sans text-sm text-gray-700">{b.start_time} → {b.end_time}</p>
              </div>

              <div className="text-right">

                <div
             className={`text-white text-sm px-2 py-0 rounded-full  font-normal font-sans items-center gap-1 inline-flex ${
                b.booked_by === "online"
                        ? "bg-green-600"
                        : "bg-red-600"
                        }`} >


            <div className="w-2 h-2 rounded-full bg-white mt-0.5 " />
            
              <div className="-mt-[1px]">{b.booked_by}</div>

            </div>


                <p className="font-medium font-sans text-sm text-black mt-4.5 mr-2">₹{b.price}</p>
              </div>

            </div>
          )))}
        </div>

        {/* SLOT STATUS */}
        <div className="mt-6 border rounded-2xl p-4 mb-17">

          <div className="flex justify-between items-center">
            <p className="text-base text-black font-sans font-medium">Todays Slot Status</p>

            <select
              value={selectedTurf || ""}
              onChange={(e) => setSelectedTurf(e.target.value)}
              className="border rounded-full px-1 py-0 text-sm text-black font-sans font-medium"
            >
              {turfs.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-5 gap-2 mt-4">

            {hours.map((h, i) => {
              const formatHour = (h: number) => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${String(hour).padStart(2, "0")} ${ampm}`;
};

const label = formatHour(h);

              const status = slotStatus[i];

              return (
                <div
                  key={i}
                  className={`border rounded-md px-1.5 py-1 text-center border-gray-700 items-center ${
                    status === 
                      "booked" ? "bg-red-50 "
                     : status === 
                     "available" ? "bg-white"

                                : "bg-gray-50"
                  }`}
                >
                  <p className="text-xs font-sans font-medium text-black">{label}</p>
                  <p
                    className={`text-xs mt-0 font-sans font-medium text-center items-center ${
                      status === 
                      "booked" ? "text-red-700 "
                     : status === 
                     "available" ? "text-green-700"

                                : "text-gray-500"
                    }`}
                  >
                    {status}
                  </p>
                </div>
              );
            })}

          </div>

          {/* FOOTER */}
          <div className="flex gap-7 mt-4 ml-1">

            <p className="text-red-600 text-sm font-sans font-medium ">Booked : ({bookedCount})</p>
            <p className="text-green-700 text-sm font-sans font-medium">Available : ({availableCount})</p>
            
          </div>

        </div>

      </div>
    </div>
  );
} 