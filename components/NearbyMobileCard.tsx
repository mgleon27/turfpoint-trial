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
  distance: number | null;
};

export default function NearbyMobileCard({ turf, router, distance }: Props) {
  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) /
        turf.reviews.length
      : 0;

  const sports =
    turf.turf_sports
      ?.map((s) => s.sports?.name?.toLowerCase())
      .filter(Boolean) || [];

  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="flex gap-3 bg-white rounded-2xl border border-gray-200 p-1 pr-2 shadow-sm cursor-pointer"
    >
      {/* IMAGE */}
      <img
        src={turf.image_url || "/turf.jpg"}
        className="w-[110px] h-[95px] object-cover rounded-xl"
      />

      {/* RIGHT CONTENT */}
      <div className="flex flex-col justify-between flex-1">

        {/* TOP */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center gap-1">
              ⭐ <span className="font-normal text-black font-sans">{avg.toFixed(1)}</span>
              <span className="font-normal text-black ml-1 font-sans">({turf.reviews?.length || 0})</span>
            </div>

            {distance && (
              <span className="border border-black px-2 py-0.5 rounded-full text-xs mt-1 font-sans font-medium text-black">
                📍 {distance.toFixed(1)} km
              </span>
            )}
          </div>

          {/* NAME */}
          <h2 className="font-semibold text-black text-base font-sans -mt-1">
            {turf.name}
          </h2>

          {/* LOCATION */}
          <p className="text-sm text-gray-600 flex -ml-1 font-sans">
            <img src="/icons/locationtop.png" className="h-4 pr-0.5" />{turf.locality}
          </p>

        </div>

        {/* BOTTOM */}
        <div className="flex justify-between items-center">
          <p className="font-medium text-black text-sm ml-0.5 font-sans">
            ₹{turf.price}
            <span className="text-gray-600 text-sm font-sans"> / hr</span>
          </p>

          <button className="bg-green-600 font-sans text-white px-2 py-0.5 rounded-full text-sm mb-1">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}