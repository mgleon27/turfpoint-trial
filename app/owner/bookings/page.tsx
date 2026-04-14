"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";


type Booking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  booked_by: string;
  turfs: {
    name: string;
    owner_id: string;
  }[];
};


const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

export default function OwnerBookings() {
  const { user } = useUser();

  const [date, setDate] = useState(getToday());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("upcoming");

  const loadBookings = async () => {
  if (!user) return;

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", date);

  if (!bookingsData) return;

  const turfIds = bookingsData.map(b => b.turf_id);

  const { data: turfs } = await supabase
    .from("turfs")
    .select("id, name, owner_id")
    .in("id", turfIds)
    .eq("owner_id", user.id);

  const merged = bookingsData.map(b => ({
    ...b,
    turfs: turfs?.filter(t => t.id === b.turf_id) || []
  }));

  setBookings(merged);
};

  useEffect(() => {
    if (!user) return;

  const fetchData = async () => {
    await loadBookings();
  };

  fetchData();
}, [user, date]);

  // ================= FILTER =================
  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return b.status === "confirmed";
    if (filter === "completed") return b.status === "completed";
    return true;
  });

  const totalBookings = bookings.length;

  const upcomingCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const revenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const slotFilled = Math.round((totalBookings / 24) * 100); // simple logic

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white pt-3">

        <OwnerMobileHeader />
        <OwnerMobileNav />

      {/* HEADER */}
      <div className="px-4">
      <div className="flex justify-between items-center mb-1.5">
        <h1 className="text-base text-black font-medium font-sans mb-4 pt-3">Bookings</h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-2 py-0.5 font-sans text-xs text-black mt-0.5 w-28"
        />
      </div>

      {/* STATS CARD */}
      <div className="bg-green-100 rounded-2xl shadow-sm/20 pl-1 pr-8 py-3 flex justify-around items-center">

        <div className=" flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <p className="text-gray-600 text-sm font-sans font-medium">Total Bookings :</p>
             <p className="font-medium text-sm font-sans text-black ">{totalBookings}</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
             <p className="text-gray-600 text-sm font-sans font-medium">Revenue :</p>
             <p className="font-medium text-sm font-sans text-black">₹{revenue}</p>
          </div>
        </div>

        <div className="border-l h-18 mx-2 "></div>

        <div className="  flex flex-col gap-3 ">
          <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm font-medium font-sans">Slot Filled</p>
              <p className="font-medium  text-sm font-sans text-black ">{slotFilled}%</p>
          </div>

          <p className="text-green-700 text-sm mt-2 font-sans font-medium">+7.27% </p>
        </div>

      </div>

      {/* FILTERS */}
      <div className="flex items-center justify-between mt-6">

        <div className="flex items-center gap-3">
          <p className="text-base text-black font-medium font-sans">Total Bookings</p>
          <span className="bg-gray-200 px-3 -py-1 rounded text-sm text-black font-medium font-sans">{totalBookings}</span>
        </div>

        <button
          onClick={() => setFilter("all")}
          className="border px-3 py-0 rounded-md  text-sm text-black font-medium font-sans"
        >
          All
        </button>
      </div>

      <div className="flex gap-4 mt-3">

        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-1 rounded-full text-sm text-black font-medium font-sans ${
            filter === "upcoming"
              ? "bg-green-600 border border-green-600 text-white"
              : "bg-gray-200 border-2 border-gray-300"
          }`}
        >
          Upcoming  ({upcomingCount})
        </button>

        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-1 rounded-full text-sm text-black font-medium font-sans ${
            filter === "completed"
              ? "bg-green-600 border border-green-600 text-white"
              : "bg-gray-200 border-2 border-gray-300"
          }`}
        >
          Completed  ({completedCount})
        </button>

      </div>

      {/* LIST */}
      <div className="mt-3 space-y-4">

        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl px-4 py-2 flex justify-between items-center border border-gray-200 shadow-lg/10"
          >

            {/* LEFT */}
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full -mb-1 ${
                    b.status === "completed" ? "bg-red-600" : "bg-green-500"
                  }`}
                />
                <p className="text-base text-black font-medium font-sans">Booking ID-{b.id.slice(0, 10)}</p>
              </div>

                <p className="text-gray-600 text-sm font-medium font-sans mt-1">
                   {new Date(b.booking_date).toDateString()}
                </p>

                <p className="text-gray-600 text-sm font-medium font-sans mt-0.5">
                   {b.start_time} - {b.end_time}
                </p>

            </div>

            {/* RIGHT */}
            <div className="text-right">
              <p className="font-semibold font-sans text-black text-[15px]">₹{b.price}</p>

            <div
             className={`text-white text-xs px-2 py-0.5 rounded-full  font-normal font-sans items-center gap-1 inline-flex ${
                b.booked_by === "online"
                        ? "bg-green-600"
                        : "bg-red-600"
                        }`} >


            <div className="w-2 h-2 rounded-full bg-white " />
            
              <div>{b.booked_by}</div>

            </div>


              <div className="bg-gray-300 text-xs px-2 py-0.5 rounded-sm mt-2 font-medium font-sans text-black">
                {b.turfs?.[0]?.name}
              </div>
            </div>

          </div>
        ))}

      </div>

    </div>
    </div>
  );
}