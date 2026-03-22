"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ✅ REUSE SAME TYPE (copy or import if shared)
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

// ✅ PROPER PROPS TYPE
type Props = {
  turf: Turf;
  router: AppRouterInstance;
};

export default function MobileTurfCard({ turf, router }: Props) {
  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="min-w-[220px] bg-white rounded-xl shadow p-3 cursor-pointer"
    >
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-32 w-full object-cover rounded-lg"
      />

      <div className="mt-2">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{turf.name}</h2>
          <span className="bg-yellow-400 px-2 py-1 text-xs rounded">
            4.0
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-1">📍 {turf.locality}</p>
        <p className="text-xs">🕒 {turf.is_24_7 ? "24/7 Available" : "Available"}</p>

        <div className="flex gap-2 mt-1 text-lg">
          ⚽ 🏏 🏸
        </div>

        <div className="flex justify-between items-center mt-2">
          <p className="font-semibold text-sm">₹{turf.price}/hr</p>
          <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">
            Book
          </button>
        </div>

      </div>
    </div>
  );
}