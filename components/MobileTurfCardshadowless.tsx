"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ================= TYPES =================
type Turf = {
  id: string;
  name: string;
  locality: string;
  address: string;
  price: number;
  image_url?: string;
  map_lat: number;
  map_lng: number;
  is_24_7: boolean;
  reviews?: { rating: number }[];
  turf_sports?: { sports?: { name?: string } }[];
};

type Props = {
  turf: Turf;
  router: AppRouterInstance;
};

export default function MobileTurfCard({ turf, router }: Props) {

  // ⭐ CALCULATE RATING
  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;
  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="w-full min-w-0 bg-white rounded-lg p-2  cursor-pointer border-1 border-gray-100 shadow-lg/30"
    >
      {/* IMAGE */}
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-32 w-full object-cover rounded-lg"
      />

      <div>

        {/* ⭐ DYNAMIC RATING */}
          <div className="flex justify-between items-center gap-11">
          <span className=" text-black text-[12px] rounded">
            ⭐{avg.toFixed(1)}
          </span>
          <p className="text-xs text-gray-500">
            {turf.reviews?.length || 0 } reviews
          </p>
          </div>
        

        {/* Name */}
        <h2 className="font-semibold text-[15px] text-black mt-1 pl-1">{turf.name}</h2>

        {/* 📍 LOCATION */}
        <p className="text-xs font-extralight text-gray-700">📍 {turf.locality}</p>

        {/* SPORTS */}
        <div className="flex gap-3 text-base pt-1">
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "football") && "⚽"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "cricket") && "🏏"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "badminton") && "🏸"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "volleyball") && "🏐"}
        </div>

        {/* PRICE + BUTTON */}
        <div className="flex justify-between items-center mt-1">
          <p className="font-semibold text-black text-sm">₹{turf.price}
            <span className="text-gray-700 text-sm font-medium"
          > / hr</span></p>
          <button 
          onClick={(e) => {
              e.stopPropagation();
              router.push(`/turf/${turf.id}`);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs mr-1">
            Book
          </button>
        </div>

      </div>
    </div>
  );
}