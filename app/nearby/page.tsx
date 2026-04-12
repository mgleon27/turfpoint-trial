"use client";

import { useEffect, useState, useRef,useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";
import { useUser } from "@/lib/userContext";


import UserOnly from "@/components/UserOnly";

// MOBILE
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

import NearbyMobileCard from "@/components/NearbyMobileCard";

import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

// ================= TYPES =================
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
  is_24_7: boolean;
  reviews?: { rating: number }[];
  turf_sports?: { sports?: { name?: string } }[];
};

// ================= DISTANCE =================
function getDistance(lat1:number, lon1:number, lat2:number, lon2:number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos((lat1*Math.PI)/180) *
    Math.cos((lat2*Math.PI)/180) *
    Math.sin(dLon/2)**2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function NearbyPage() {
  const router = useRouter();
  const { city, location, setLocationData } = useLocation();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("turfs")
        .select(`
          *,
          reviews ( rating ),
          turf_sports (
            sports ( name )
          )
        `);

      if (data) setTurfs(data as Turf[]);
    };
    load();
  }, []);

  // ================= SORT BY DISTANCE =================
  const sortedTurfs = useMemo(() => {
  if (!location) return turfs;

  return [...turfs].sort((a, b) => {
    const d1 = getDistance(location.lat, location.lng, a.map_lat, a.map_lng);
    const d2 = getDistance(location.lat, location.lng, b.map_lat, b.map_lng);
    return d1 - d2;
  });
}, [turfs, location]);


  return (
    <UserOnly>
    <div className="bg-white min-h-screen">

      {/* ================= 📱 MOBILE ================= */}
      <div className="md:hidden">

        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        <div className="px-4 mt-4">

          <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg text-black font-medium font-sans mb-3">
            Nearby Turfs
          </h2>
               <div  onClick={() => setShowLocationModal(true)}
               className="flex">
                <img src="/icons/locationtop.png" className="h-4 pr-0.5" />
                <p className="text-black font-sans font-medium text-sm/5"> {city || "loading..."} ›</p>
               </div>
          </div>

          <div className="space-y-4">

            {sortedTurfs.map((t) => {
  let distance: number | null = null;

  if (location) {
    distance = getDistance(
      location.lat,
      location.lng,
      t.map_lat,
      t.map_lng
    );
  }

  return (
    <NearbyMobileCard
      key={t.id}
      turf={t}
      router={router}
      distance={distance}
    />
  );
})}

          </div>
        </div>
      </div>

      {/* ================= 💻 DESKTOP ================= */}
      <div className="hidden md:block">

        <Header
          search=""
          setSearch={() => {}}
          setShowLocationModal={setShowLocationModal}
        />

        <div className="max-w-[1200px] mx-auto p-6">

          <h2 className="text-xl font-semibold mb-6">
            Nearby Turfs
          </h2>

          <div className="grid grid-cols-4 gap-6">
            {sortedTurfs.map((t) => {
              let distance: number | null = null;

              if (location) {
                distance = getDistance(
                  location.lat,
                  location.lng,
                  t.map_lat,
                  t.map_lng
                );
              }

              const avg =
    t.reviews?.length
      ? t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length
      : 0;

      const min = t.min_price ?? t.price;
      const max = t.max_price ?? t.price;

              

              return (
                <div key={t.id}
                onClick={() => router.push(`/turf/${t.id}`)}
                 className="bg-white rounded-xl shadow-xl/30 cursor-pointer overflow-hidden p-2">

                  

                  <img
                    src={t.image_url || "/turf.jpg"}
                    className="h-47 w-full object-cover rounded-xl"
                  />

                  <div className="p-3">

        <div className="flex justify-between text-sm font-sans">
          <div>
            <span className="bg-yellow-500 px-3 py-1 rounded text-white text-xs font-sans">{avg.toFixed(1)}</span>
            <span className="ml-2 font-sans text-gray-600">{t.reviews?.length || 0} reviews</span>
          </div>
          {distance && (
                    <div className="text-sm text-black font-sans flex items-center gap-2 border-2 border-gray-600 rounded-4xl px-2 py-0.5 ">
                      <img src="/icons/direction.png" className="h-3" /> 
                      {distance.toFixed(1)} km
                    </div>
                  )}
        </div>

        <h2 className="text-lg text-black font-semibold mt-1 font-sans">{t.name}</h2>

        <div className="text-sm text-gray-600 font-sans">
          {t.address.split(",").map((l, i) => (
            <div key={i}>{l.trim()}</div>
          ))}
        </div>

 
        <div className="flex justify-between items-center mt-3">

          <p className="text-black font-semibold text-lg font-sans">
  ₹{min}
  {min !== max && ` - ₹${max}`}
  <span className="text-gray-600 font-medium text-base font-sans"> /hr</span>
</p>

          <img src="/icons/open.png" className="h-7" />
        </div>
        
      </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-5 rounded-xl w-[400px]">

            <LocationPicker
  onSelect={(lat, lng) => {
    setLocationData({ lat, lng }, city); // temp set
  }}
/>

<div className="flex justify-between mt-4">
  <button onClick={() => setShowLocationModal(false)}>
    Cancel
  </button>

  <button
    onClick={async () => {
      if (!location) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
      );
      const data = await res.json();

      const newCity =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Selected Location";

      // ✅ IMPORTANT
      setLocationData(location, newCity);

      setShowLocationModal(false);
    }}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Confirm
  </button>
</div>

          </div>
        </div>
      )}
    </div>
    </UserOnly>
  );
}