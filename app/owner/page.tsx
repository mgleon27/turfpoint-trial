"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";

// ================= TYPES =================
type Turf = {
  id: string;
  name: string;
};

type Booking = {
  turf_id: string;
  start_time: string;
  end_time: string;
  booking_date: string;
  price: number;
  booked_by: string;
};

// ================= HELPERS =================
const getDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);

  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);

  return local.toISOString().split("T")[0];
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const formatLabel = (hour: number) => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

// ================= PAGE =================
export default function OwnerHome() {
  const { user ,profile } = useUser();
  const router = useRouter();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  const [earnings, setEarnings] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  const [yesterdayEarnings, setYesterdayEarnings] = useState(0);
  const [yesterdayBookings, setYesterdayBookings] = useState(0);

  const [earningChange, setEarningChange] = useState(0);
  const [bookingChange, setBookingChange] = useState(0);

  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

  const [showDropdown, setShowDropdown] = useState(false);

  const channelRef = useRef<any>(null);

  const today = getDate(0);
  const yesterday = getDate(-1);

  // ================= LOAD =================
  const loadDashboard = async () => {
    if (!user) return;

    // 🔹 TURFS
    const { data: turfData } = await supabase
      .from("turfs")
      .select("id,name")
      .eq("owner_id", user.id);

    if (!turfData || turfData.length === 0) return;

    setTurfs(turfData);
    setSelectedTurf((prev) => prev || turfData[0]);

    const turfIds = turfData.map((t) => t.id);

    // 🔹 TODAY BOOKINGS
    const { data: todayData } = await supabase
      .from("bookings")
      .select("*")
      .in("turf_id", turfIds)
      .eq("booking_date", today)
      .eq("status", "confirmed");

    const todayBookingsData = todayData || [];

    setTodayBookings(todayBookingsData);
    setBookingsCount(todayBookingsData.length);

    const todayTotal = todayBookingsData.reduce(
      (sum, b) => sum + (b.price || 0),
      0
    );

    setEarnings(todayTotal);

    // 🔹 YESTERDAY BOOKINGS
    const { data: yData } = await supabase
      .from("bookings")
      .select("*")
      .in("turf_id", turfIds)
      .eq("booking_date", yesterday)
      .eq("status", "confirmed");

    const yBookings = yData || [];

    setYesterdayBookings(yBookings.length);

    const yTotal = yBookings.reduce(
      (sum, b) => sum + (b.price || 0),
      0
    );

    setYesterdayEarnings(yTotal);

    // 🔹 CALCULATE %
    if (yTotal > 0) {
      setEarningChange(((todayTotal - yTotal) / yTotal) * 100);
    } else {
      setEarningChange(0);
    }

    if (yBookings.length > 0) {
      setBookingChange(
        ((todayBookingsData.length - yBookings.length) /
          yBookings.length) *
          100
      );
    } else {
      setBookingChange(0);
    }

    // 🔹 UPCOMING
    const nowMin =
      new Date().getHours() * 60 + new Date().getMinutes();

    const upcomingFiltered = todayBookingsData
      .filter((b) => timeToMinutes(b.start_time) > nowMin)
      .sort(
        (a, b) =>
          timeToMinutes(a.start_time) -
          timeToMinutes(b.start_time)
      )
      .slice(0, 2);

    setUpcoming(upcomingFiltered);
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  // ================= REALTIME =================
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("owner-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async () => {
          console.log("Realtime update ⚡");
          await loadDashboard();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  // ================= SLOT GRID =================
  const buildSlots = () => {
  const arr = [];

  const nowMin =
    new Date().getHours() * 60 + new Date().getMinutes();

  for (let i = 0; i < 24; i++) {
    const start = i * 60;

    const isBooked = todayBookings.some(
      (b) =>
        timeToMinutes(b.start_time) === start &&
        b.turf_id === selectedTurf?.id
    );

    const isTimeout = start <= nowMin;

    let status = "available";

    if (isBooked) {
      status = "booked"; // ✅ FIRST PRIORITY
    } else if (isTimeout) {
      status = "timeout"; // ✅ SECOND
    }

    arr.push({
      label: formatLabel(i),
      status,
    });
  }

  return arr;
};

  const slots = buildSlots();

  const availableCount = slots.filter(
    (s) => s.status === "available"
  ).length;

  const bookedCount = slots.filter(
    (s) => s.status === "booked"
  ).length;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white p-3">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 px-2 py-2">
        <div className="flex gap-3 items-center">

          <img
                src={profile?.avatar_url || "/profile.png"}
                onError={(e) => (e.currentTarget.src = "/profile.png")}
                className="w-13 h-13 rounded-full object-cover border border-gray-400"
              />

          <div>
            <p className="text-sm font-sans text-gray-500 -mt-1.5">Welcome</p>
            <p className="font-medium text-black font-sans text-lg/4">
              {profile?.full_name}
            </p>
          </div>
        </div>
        <div className="border border-black rounded-full p-1.5">
          <img src="/icons/bell.png" className="h-4.5" />
        </div>
      </div>


      {/* STATS */}
      <div className="flex gap-4 mb-6">

        {/* EARNINGS */}
        <div className="flex-1 bg-green-100 px-4 py-3 rounded-2xl shadow-lg/10 border border-gray-300">
          <p className="text-sm text-gray-600 font-sans mb-1">Todays Earnings</p>
          <p className="text-xl font-semibold font-sans">₹{earnings}</p>
          <p className="text-green-700 text-sm font-sans">
            {earningChange >= 0 ? "+" : ""}
            {earningChange.toFixed(1)}%
          </p>
        </div>

        {/* BOOKINGS */}
        <div className="flex-1 bg-green-100 px-4 py-3 rounded-2xl shadow-lg/10 border border-gray-300">
          <p className="text-sm text-gray-600 font-sans mb-1">Bookings Today</p>
          <p className="text-xl font-semibold font-sans">{bookingsCount}</p>
          <p className="text-green-700 text-sm font-sans">
            {bookingChange >= 0 ? "+" : ""}
            {bookingChange.toFixed(0)}%
          </p>
        </div>
      </div>




      {/* Actions */}
      <p className="text-black font-sans font-medium text-lg mb-3"> Quick Actions</p>
      <div className="flex flex-row items-center mb-3 justify-between px-2.5">
        <div className="h-27 w-27 rounded-xl border border-gray-500 bg-green-400 shadow-lg/20">
          <img src="/icons/add-booking.png" className=" p-4.5" />
        </div>

        <div className="h-27 w-27 rounded-xl border border-gray-500 bg-lime-300 shadow-lg/20"><img src="/icons/water.png" className=" p-8" /></div>

        <div className="h-27 w-27 rounded-xl border border-gray-500 bg-rose-400 shadow-lg/20"><img src="/icons/water.png" className=" p-8" /></div>

      </div>















      {/* UPCOMING */}
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold text-lg font-sans">Upcoming Bookings</h2>
          <button
            onClick={() => router.push("/owner/bookings")}
            className="text-sm text-gray-500 font-sans"
          >
            View All →
          </button>
        </div>

        {upcoming.length === 0 && (
          <p className="text-gray-500 text-sm">No upcoming bookings Today</p>
        )}

        {upcoming.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border p-3 rounded-2xl mb-3"
          >
            <div className="w-14 h-14 bg-purple-400 rounded-xl" />

            <div className="flex-1">
              <p className="font-medium">
                {turfs.find((t) => t.id === b.turf_id)?.name}
              </p>
              <p className="text-sm text-gray-500">
                {b.booking_date}
              </p>
              <p className="text-sm">
                {b.start_time} → {b.end_time}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                ({b.booked_by})
              </p>
              <p className="font-medium">₹{b.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SLOT STATUS */}
      <div className="border p-4 rounded-xl">

        <div className="flex justify-between mb-4">
          <h2 className="font-medium text-black text-lg font-sans">
            Todays Slot Status
          </h2>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="border px-2 py-0.5 rounded-full text-sm text-gray-800 font-sans shadow-sm border-gray-500 flex flex-row items-center"
            >
              {selectedTurf?.name} <img src="/icons/down.png" className="h-4 ml-1" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow p-2">
                {turfs.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTurf(t);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-5 gap-2">
          {slots.map((s, i) => (
            <div
              key={i}
              className={`border border-gray-700 rounded-xl text-center py-1.5 text-xs font-sans font-medium shadow-md
                ${s.status === "timeout" && "bg-gray-200"}
                ${s.status === "booked" && "bg-gray-200"}
                ${s.status === "available" && "bg-white"}
                 `}
            >
              <p>{s.label}</p>
              <p
                className={`
                ${s.status === "timeout" && "text-gray-500 font-sans"}
                ${s.status === "booked" && "text-red-600 font-sans"}
                ${s.status === "available" && "text-green-700 font-sans font-medium"}
              `}
              >
                {s.status}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-sm px-15">
          <p className="text-green-600 font-sans text-medium">
            Available: ({availableCount})
          </p>
          <p className="text-red-500 font-sans text-medium">
            Booked: ({bookedCount})
          </p>
        </div>
      </div>
    </div>
  );
}