"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Turf = {
  id: string;
  name: string;
  locality: string;
  address: string;
  price: number;

  min_price?: number;
  max_price?: number;

  image_url?: string;
  map_lat: number;
  map_lng: number;
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
      className="min-w-[160px] bg-white rounded-xl  p-1 cursor-pointer  border-1 border-gray-100 shadow-lg/10 snap-start"
    >
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-30 w-full object-cover rounded-lg"
        loading="lazy"
      />

      <div className="p-0.5" >

        
          

          {/* ⭐ DYNAMIC RATING */}
          <div className="flex justify-between items-center gap-11">

<div className="flex flex-row">
          <img src="/icons/star.png" className="h-3.5 pr-0.5" loading="lazy" /> 
          <p className=" text-black text-[12px] rounded font-sans">{avg.toFixed(1)}</p>
</div>          

          <p className="text-xs text-gray-500 font-sans">
            {turf.reviews?.length || 0 } reviews
          </p>

          </div>
        

        {/* Name */}
        <h2 className="font-medium font-sans text-[15px] text-black pl-1">{turf.name}</h2>

        {/* 📍 LOCATION */}
        <div className="flex flex-row mt-0.5">
        <img src="/icons/locationtop.png" className="h-4 pr-0.5" loading="lazy" />
        <p className="text-xs/4.5 font-normal font-sans text-gray-700">{turf.locality}</p>
        </div>  


        {/* 💰 PRICE */}
        <div className="flex justify-between items-center mt-4">


          <p className="font-sans font-semibold text-black text-xs pl-1 whitespace-nowrap">
           ₹{turf.min_price ?? turf.price}
          {(turf.min_price !== turf.max_price) &&
            ` - ₹${turf.max_price}`}
         <span className="text-gray-700 text-sm font-medium font-sans">
          {" "}/hr
        </span>
        </p>


          <img src="/icons/open.png" 
            className="h-8 pr-1 pb-1" loading="lazy" />
        </div>

      </div>
    </div>
  );
}