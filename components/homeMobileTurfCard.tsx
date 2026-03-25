"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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

  // 🏟️ SPORTS LIST
  const sports =
    turf.turf_sports
      ?.map((s) => s.sports?.name?.toLowerCase())
      .filter(Boolean) || [];

  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="min-w-[220px] bg-white rounded-xl border-1 border-gray-100 shadow-lg/20 p-3 cursor-pointer"
    >
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-32 w-full object-cover rounded-lg"
      />

      <div className="mt-2">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-black">{turf.name}</h2>

          {/* ⭐ DYNAMIC RATING */}
          <div className="flex justify-between items-center gap-1">
          <span className="bg-yellow-500 px-2 py-1 text-white text-xs rounded">
            {avg.toFixed(1)}
          </span>
          <p className="text-xs text-gray-500">
            {turf.reviews?.length || 0 } reviews
          </p>
          </div>
        </div>

        {/* 📍 LOCATION */}
        <p className="text-xs text-gray-700 mt-1">📍 {turf.locality}</p>

        {/* 🕒 TIME */}
        <p className="text-xs text-gray-700">
          🕒 {turf.is_24_7 ? "24/7 Available" : "Available"}
        </p>

        {/* 🏟️ SPORTS ICONS */}
        <div className="flex gap-4 mt-1 text-lg">
          {sports.includes("football") && "⚽"}
          {sports.includes("cricket") && "🏏"}
          {sports.includes("badminton") && "🏸"}
          {sports.includes("volleyball") && "🏐"}
        </div>

        {/* 💰 PRICE */}
        <div className="flex justify-between items-center mt-2">
          <p className="font-semibold text-black text-sm">₹{turf.price}
            <span className="text-gray-700 text-sm font-medium"
          > / hr</span></p>
          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">
            Book
          </button>
        </div>

      </div>
    </div>
  );
}