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
  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="w-full min-w-0 bg-white rounded-lg shadow-lg/30 p-2 cursor-pointer border-1 border-gray-100"
    >
      {/* IMAGE */}
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-32 w-full object-cover rounded-lg"
      />

      <div className="mt-2">

        {/* TITLE + RATING */}
        <div className="flex justify-between items-center gap-1">
          <h2 className="font-semibold text-black text-sm truncate">
            {turf.name}
          </h2>

          <span className="bg-yellow-400 px-2 py-1 mr-1 text-white text-[10px] rounded shrink-0">
            {turf.reviews?.length
              ? (
                  turf.reviews.reduce((s, r) => s + r.rating, 0) /
                  turf.reviews.length
                ).toFixed(1)
              : "0.0"}
          </span>

        </div>

        {/* LOCATION */}
        <p className="text-[11px] text-gray-700 mt-1 truncate">
          📍 {turf.locality}
        </p>

        {/* AVAILABILITY */}
        <p className="text-[11px] text-gray-700 ">
          🕒 {turf.is_24_7 ? "24/7 Available" : "Available"}
        </p>

        {/* SPORTS */}
        <div className="flex gap-4 mt-1 text-sm">
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "football") && "⚽"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "cricket") && "🏏"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "badminton") && "🏸"}
          {turf.turf_sports?.some(s => s.sports?.name?.toLowerCase() === "volleyball") && "🏐"}
        </div>

        {/* PRICE + BUTTON */}
        <div className="flex justify-between items-center mt-2">
          <p className="font-semibold text-black text-xs">
            ₹{turf.price}<span className="text-gray-700 text-sm font-medium"
          > / hr</span>
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/turf/${turf.id}`);
            }}
            className="bg-green-600 text-white px-2 py-1 rounded text-[10px]"
          >
            Book
          </button>
        </div>

      </div>
    </div>
  );
}