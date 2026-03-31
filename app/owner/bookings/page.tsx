"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OwnerGuard from "@/components/OwnerGuard";
import { useUser } from "@/lib/userContext";

type Booking = {
  id: string;
  turf_id: string;
  date: string;
};

export default function OwnerBookings() {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*");

      if (data) setBookings(data);
    };

    load();
  }, []);

  return (
    <OwnerGuard>
      <div className="p-6">

        <h1 className="text-xl font-semibold mb-4">Bookings</h1>

        {bookings.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-xl shadow mb-3">
            <p>Turf ID: {b.turf_id}</p>
            <p>Date: {b.date}</p>
          </div>
        ))}

      </div>
    </OwnerGuard>
  );
}