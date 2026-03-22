"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

// ✅ Turf type
type Turf = {
  id: number;
  name: string;
  location: string;
  price: number;
  image?: string;
};

export default function TurfDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // ✅ Time slots
  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00",
    "10:00", "11:00", "12:00",
    "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00"
  ];

  // ✅ Fetch turf data
  useEffect(() => {
    if (!id) return;

    const fetchTurf = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("turfs")
        .select("*")
        .eq("id", Number(id)) // 👉 change to id if UUID
        .single();

      if (error) {
        console.log("Fetch Error:", error.message);
      } else {
        setTurf(data);
      }

      setLoading(false);
    };

    fetchTurf();
  }, [id]);

  // ✅ Fetch booked slots
  useEffect(() => {
    if (!date || !id) return;

    const fetchBookedSlots = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("time")
        .eq("turf_id", Number(id))
        .eq("date", date);

      if (data) {
        setBookedSlots(data.map((b) => b.time));
      }
    };

    fetchBookedSlots();
  }, [date, id]);

  // ✅ Booking function
  const bookTurf = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first");
      return;
    }

    if (!date || !time) {
      alert("Select date & time");
      return;
    }

    // 🔴 Prevent double booking
    const { data: existing } = await supabase
      .from("bookings")
      .select("*")
      .eq("turf_id", turf?.id)
      .eq("date", date)
      .eq("time", time);

    if (existing && existing.length > 0) {
      alert("Slot already booked!");
      return;
    }

    // ✅ Insert booking
    const { error } = await supabase.from("bookings").insert({
      turf_id: turf?.id,
      user_id: userData.user.id,
      date,
      time,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("✅ Booking successful!");
      setTime("");
    }
  };

  // ✅ UI states
  if (loading) return <p className="p-6 text-center">Loading turf...</p>;
  if (!turf) return <p className="p-6 text-center">Turf not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* IMAGE */}
      <img
        src={turf.image || "/turf.jpg"}
        className="w-full h-64 object-cover rounded-xl"
      />

      {/* DETAILS */}
      <h1 className="text-2xl font-bold mt-4">{turf.name}</h1>
      <p className="text-gray-500">{turf.location}</p>
      <p className="font-bold mt-2 text-lg">₹{turf.price}/hour</p>

      {/* BOOKING */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-3">Book Slot</h2>

        {/* DATE */}
        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setDate(e.target.value)}
        />

        {/* TIME SLOTS */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {timeSlots.map((slot) => {
            const isBooked = bookedSlots.includes(slot);

            return (
              <button
                key={slot}
                disabled={isBooked}
                onClick={() => setTime(slot)}
                className={`p-2 rounded border ${
                  isBooked
                    ? "bg-gray-300 cursor-not-allowed"
                    : time === slot
                    ? "bg-green-600 text-white"
                    : "bg-white"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={bookTurf}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
