"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Turf = {
  name: string;
  locality: string;
  address: string;
  map_lat: number;
  map_lng: number;
};

type Profile = {
  full_name: string;
};

type BookingType = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  turfs: Turf;
  profile: Profile;
};

export default function TicketPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          turfs ( name, locality, address, map_lat, map_lng )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.log(error);
        setLoading(false);
        return;
      }

      // fetch user
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user_id)
        .single();

      setBooking({ ...data, profile });
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading || !booking) {
    return <div className="p-5">Loading...</div>;
  }

  const turf = Array.isArray(booking.turfs)
  ? booking.turfs[0]
  : booking.turfs;

  const user = booking?.profile;

  const openMap = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${turf.map_lat},${turf.map_lng}`
    );
  };

  const formatTime = (t: string) => {
    const [h] = t.split(":").map(Number);
    const am = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:00 ${am}`;
  };



  if (loading || !booking || !booking.turfs) {
  return <div className="p-5">Loading...</div>;
}




  return (
    <div className="min-h-screen bg-white p-3">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <img
          src="/icons/back.png"
          className="w-4 h-4"
          onClick={() => router.back()}
        />
        <h1 className="text-lg font-medium">Booking Details</h1>
      </div>

      {/* MAIN CARD */}
      <div className="bg-green-100 rounded-3xl p-4 shadow-md">

        {/* 🎟 TOP TICKET */}
        <div className="flex items-stretch rounded-xl overflow-hidden relative mt-3 mb-2">

          {/* LEFT GREEN */}
          <div className="bg-green-600 text-white p-4 flex-1 rounded-l-xl relative  ">


            <div className="flex items-center">

            <img src="/icons/ticket-new.png" className="h-5" />

            <p className="text-sm font-sans pl-1">{turf.name}</p>

            </div>


            <p className="text-[11px] font-sans font-light text-white mt-2 opacity-90">Name</p>
            <p className="text-base text-white font-sans font-semibold">
              {user?.full_name || "User"}
            </p>

            <p className="text-[11px] font-sans font-light text-white mt-2 opacity-90">Booking ID</p>
            <p className="text-sm text-white font-sans font-normal tracking-widest">
              {booking.id.slice(0, 10)}
            </p>

          </div>



{/* ✂️ PERFORATION */}
  <div className="relative flex flex-col justify-between items-center bg-white">

    {/* TOP CUT DOT */}
    <div className="w-3 h-3 bg-green-100 rounded-full border border-green-600 -mt-1.5 z-10"></div>

    {/* DASHED LINE */}
    <div className="flex-1 border-l border-dashed border-gray-500"></div>

    {/* BOTTOM CUT DOT */}
    <div className="w-3 h-3 bg-green-100 rounded-full border border-green-600 -mb-1.5 z-10"></div>

  </div>


          {/* RIGHT QR */}
          <div className="bg-white border border-green-600 p-3 flex items-center justify-center rounded-r-xl ">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.id}`}
              className="w-[110px] h-[110px]"
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-5 space-y-5">

          {/* DATE + AMOUNT */}
          <div className="flex justify-between">
            <div className="ml-3">
              <p className="text-gray-500 text-sm font-sans font-normal ">Date</p>
              <p className="font-medium text-base text-black font-sans">
                {new Date(booking.booking_date).toDateString()}
              </p>
            </div>

            <div className="mr-10">
              <p className="text-gray-500 text-sm font-sans font-normal ">Amount</p>
              <p className="font-medium text-base text-black font-sans">₹{booking.price}</p>
            </div>
          </div>

          {/* TIME */}
          <div className="text-center mt-5 mb-7 ml-1.5 mr-1.5">
            <p className="text-sm text-gray-500 "> ( 1 Hour )</p>

            <div className="flex items-center justify-between -mt-1 text-sm text-black font-sans font-medium">
              <span>{formatTime(booking.start_time)}</span>

              <div className="flex-1 mx-4 border-t border-dashed border-gray-700"></div>

              <span>{formatTime(booking.end_time)}</span>
            </div>
          </div>

          {/* DASH LINE */}
          <div className="border-t border-dashed border-gray-500"></div>

          {/* PLACE + STATUS */}
          <div className="flex justify-between">
            <div className="ml-3">
              <p className="text-gray-500 text-sm font-sans font-normal">Place</p>

              <div className="flex items-center gap-0.5 -ml-1">
              <img src="/icons/locationtop.png" className="h-3.5" />
              <p className="font-medium text-base text-black font-sans">{turf.locality}</p>
              </div>
            </div>

            <div className="mr-5">
              <p className="text-gray-500 text-sm font-sans font-normal">Status</p>
              <p className="font-medium text-base text-black font-sans">
                {booking.status}
              </p>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="mb-3 ml-2">
            <p className="text-gray-500 text-sm font-sans font-normal">Address</p>


            <div className="font-medium text-base text-black font-sans ml-1">
  {turf.address.split(",").map((line: string, i: number) => (
    <div key={i}>{line.trim()}</div>
  ))}
</div>


          </div>

          {/* BUTTONS */}
          <div className="flex gap-7 mt-4 mb-3 ">
            <button
              onClick={openMap}
              className="px-3 bg-green-600 text-white py-1 rounded-md font-medium font-sans text-base"
            >
              Get Direction
            </button>

            <button className="px-5 bg-white text-green-700 py-1 rounded-md font-medium font-sans text-base border border-green-300">
              Show QR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}