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
  const [loading, setLoading] = useState(true);
  const { city, location, setLocationData } = useLocation();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const load = async () => {
  setLoading(true);

  const { data, error } = await supabase
  .from("turfs")
  .select(`
    *,
    reviews ( rating ),
    turf_sports ( sports ( name ) )
  `);

if (error) {
  console.error(error);
} else if (data) {
  setTurfs(data as Turf[]);
}

  setLoading(false);
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

  {/* 🔥 NO LOCATION */}
  {!location && !loading && (
    <div
      onClick={() => setShowLocationModal(true)}
      className="text-center py-4 cursor-pointer"
    >
      <p className="text-gray-400 text-sm">
        Tap to select location 📍
      </p>
    </div>
  )}

  {/* 🔥 LOADING */}
  {loading ? (
    <div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <NearbyCardSkeleton key={i} />
  ))}
</div>
    
  ) : !location ? null : sortedTurfs.length === 0 ? (

    /* 🔥 EMPTY STATE */
    <div className="text-center py-6">
      <img src="/empty.png" className="w-24 mx-auto mb-2 opacity-70" />
      <p className="text-gray-400 text-sm">No turfs found nearby 
        (Try changing Your Location)
      </p>
    </div>

  ) : (

    /* 🔥 DATA */
    sortedTurfs.map((t) => {
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
    })

  )}
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

  {loading ? (

    /* 🔥 LOADING */
    [...Array(8)].map((_, i) => (
  <NearbyCardSkeleton key={i} />
))

  ) : !location ? (
  <div className="col-span-full text-center py-10 cursor-pointer"
       onClick={() => setShowLocationModal(true)}>
    <p className="text-gray-400">Select location to see nearby turfs 📍</p>
  </div>
) : sortedTurfs.length === 0 ? (

    /* 🔥 EMPTY */
    <div className="col-span-full text-center py-10">
      <img src="/empty.png" className="w-28 mx-auto mb-3 opacity-70" />
      <p className="text-gray-400">No turfs found Nearby 
        (Try changing Your Location)</p>
    </div>

  ) : (

    /* 🔥 DATA */
    sortedTurfs.map((t) => {
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
        <div
          key={t.id}
          onClick={() => router.push(`/turf/${t.id}`)}
          className="bg-white rounded-xl shadow-xl/30 cursor-pointer overflow-hidden p-2 
transition duration-200 hover:scale-[1.02] active:scale-95"
        >
          <img
            src={t.image_url || "/turf.jpg"}
            loading="lazy"
            className="h-[190px] w-full object-cover rounded-xl"
          />

          <div className="p-3">

            <div className="flex justify-between text-sm font-sans">
              <div>
                <span className="bg-yellow-500 px-3 py-1 rounded text-white text-xs">
                  {avg.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-600">
                  {t.reviews?.length || 0} reviews
                </span>
              </div>

              {/* ✅ FIXED DISTANCE BUG */}
              {distance !== null && (
  <div
    className={`text-sm flex items-center gap-2 px-2 py-0.5 rounded-full border ${
      distance < 3
        ? "border-green-500 text-green-600"
        : distance < 8
        ? "border-yellow-500 text-yellow-600"
        : "border-gray-400 text-gray-500"
    }`}
  >
    <img src="/icons/direction.png" className="h-3" />
    {distance.toFixed(1)} km
  </div>
)}
            </div>

            <h2 className="text-lg text-black font-semibold mt-1">
              {t.name}
            </h2>

            <div className="text-sm text-gray-600">
              {t.address.split(",").map((l, i) => (
                <div key={i}>{l.trim()}</div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-3">
              <p className="text-black font-semibold text-lg">
                ₹{min}
                {min !== max && ` - ₹${max}`}
                <span className="text-gray-600 text-base"> /hr</span>
              </p>

              <img src="/icons/open.png" className="h-7" />
            </div>

          </div>
        </div>
      );
    })

  )}
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


function NearbyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-2 animate-pulse shadow-sm">
      
      <div className="h-[120px] w-full bg-gray-200 rounded-xl mb-2" />

      <div className="space-y-2 px-1">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
      </div>

      <div className="flex justify-between items-center mt-3 px-1">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
      </div>

    </div>
  );
}