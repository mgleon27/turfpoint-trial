"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";

type Turf = {
  id: string;
  name: string;
  price: number;
  locality: string;
  is_active: boolean;
  image_url?: string;
};

type Booking = {
  turf_id: string;
  price: number;
};

const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

export default function OwnerTurfs() {
  const { user } = useUser();
  const router = useRouter();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Record<string, Booking[]>>({});

  const today = getToday();

  // 🔹 LOAD TURFS
  const loadTurfs = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("turfs")
      .select("*")
      .eq("owner_id", user.id);

    setTurfs(data || []);
  };

  // 🔹 LOAD BOOKINGS (TODAY)
  const loadBookings = async () => {
    if (!user) return;

    const { data,error } = await supabase
      .from("bookings")
      .select("turf_id, price")
      .eq("booking_date", today);

      if (error) {
        console.error(error);
        return;
      }

    const grouped: Record<string, Booking[]> = {};

    (data || []).forEach((b) => {
      if (!grouped[b.turf_id]) grouped[b.turf_id] = [];
      grouped[b.turf_id].push(b);
    });

    setBookingsMap(grouped);
  };

  useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    await loadTurfs();
    await loadBookings();
  };

  fetchData();
}, [user]);

  // 🔹 TOGGLE ACTIVE
  const toggleActive = async (turf: Turf) => {
    await supabase
      .from("turfs")
      .update({ is_active: !turf.is_active })
      .eq("id", turf.id);

    loadTurfs();
  };

  return (
    <div className="min-h-screen bg-white pt-3">

      <OwnerMobileHeader />
      <OwnerMobileNav />

      <div className="px-4">

        {/* HEADER */}
        <h1 className="text-[18px] text-black font-medium font-sans mb-4 pt-3">Turfs</h1>

        {/* ADD BUTTON */}
        <div
          onClick={() => router.push("/owner/add-turf")}
          className="mt-4 bg-gray-200 rounded-full py-2 flex items-center justify-center gap-2 shadow cursor-pointer"
        >
          <div className="w-5 h-5 border rounded-full flex items-center justify-center text-lg">
            +
          </div>
          <p className="font-medium font-sans text-black text-sm">Add New Turf</p>
        </div>

        {/* TURF LIST */}
        <div className="mt-6 space-y-5">

          {turfs.map((turf) => {
            const bookings = bookingsMap[turf.id] || [];

            const count = bookings.length;
            const revenue = bookings.reduce((s, b) => s + (b.price || 0), 0);

            return (
              <div
                key={turf.id}
                className="border rounded-2xl p-3 shadow bg-white"
              >

                {/* TOP */}
                <div className="flex gap-3">

                  {/* IMAGE */}
                  <img
  src={turf.image_url || "/icons/turf-placeholder.png"}
  onError={(e) => {
    (e.target as HTMLImageElement).src = "/icons/turf-placeholder.png";
  }}
  className="w-24 h-20 rounded-xl object-cover"
  alt="turf"
/>




                  {/* DETAILS */}
                  <div className="flex-1">

                    <div className="flex justify-between mt-1">
                      <p className="font-medium text-base font-sans text-black">{turf.name}</p>

                      <div
                        className={`text-sm px-4 rounded-xl text-white font-sans font-medium items-center pt-[1.5px] ${
                          turf.is_active ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {turf.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <p className="text-gray-900 text-sm mt-0.5 font-sans font-medium">
                      ₹{turf.price} /hr
                    </p>

                    <p className="text-gray-900 text-sm mt-0.5 font-sans font-medium">
                      Todays Bookings : {count} (₹{revenue})
                    </p>

                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-2">

                  <div
                    onClick={() => router.push(`/owner/bookings?turf_id=${turf.id}`)}
                    className="py-2 text-base cursor-pointer text-black font-sans font-medium ml-1"
                  >
                    View Bookings
                  </div>

                  <hr />

                  <div
                    onClick={() => router.push(`/owner/edit/${turf.id}`)}
                    className="py-2 text-base cursor-pointer text-black font-sans font-medium ml-1"
                  >
                    Edit Turf
                  </div>

                  <hr />

                  <div
                    onClick={() => toggleActive(turf)}
                    className="py-2 text-base cursor-pointer text-red-700 font-sans font-medium ml-1"
                  >
                    {turf.is_active ? "Disable Turf" : "Enable Turf"}
                  </div>

                </div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}