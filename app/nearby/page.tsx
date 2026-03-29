"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";
import { useUser } from "@/lib/userContext";

// MOBILE
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

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
  const { user, loading } = useUser();

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
  const sortedTurfs = [...turfs].sort((a, b) => {
    if (!location) return 0;

    const d1 = getDistance(location.lat, location.lng, a.map_lat, a.map_lng);
    const d2 = getDistance(location.lat, location.lng, b.map_lat, b.map_lng);

    return d1 - d2;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ================= 📱 MOBILE ================= */}
      <div className="md:hidden">

        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        <div className="px-4 mt-4">

          <h2 className="text-lg text-black font-semibold mb-3">
            Nearby Turfs
          </h2>

          <div className="space-y-4">

            {sortedTurfs.map((t) => {
              const avg =
                t.reviews?.length
                  ? t.reviews.reduce((s, r) => s + r.rating, 0) /
                    t.reviews.length
                  : 0;

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
                <div
                  key={t.id}
                  className="bg-white rounded-xl shadow-lg/30 overflow-hidden"
                >

                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={t.image_url || "/turf.jpg"}
                      className="w-full h-36 object-cover"
                    />

                    {/* DISTANCE BADGE */}
                    {distance && (
                      <div className="absolute top-2 left-2 bg-white text-black font-semibold px-2 py-1 rounded-full text-xs shadow">
                        📍 {distance.toFixed(1)} km
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-3">

                    <div className="flex justify-between">
                      <div>
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          {avg.toFixed(1)}
                        </span>
                        <span className="ml-2 text-gray-700 text-base">
                          {t.reviews?.length || 0}
                        </span>
                      </div>
                      <span className="text-sm text-black">📍 {t.locality}</span>
                    </div>

                    <h2 className="text-lg text-black font-semibold mt-1">
                      {t.name}
                    </h2>

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-base text-gray-800 font-semibold">
                        ₹{t.price} / hr
                      </p>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">
                        Book
                      </button>
                    </div>

                  </div>
                </div>
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

              return (
                <div key={t.id} className="bg-white rounded-xl shadow p-3">

                  <img
                    src={t.image_url || "/turf.jpg"}
                    className="w-full h-40 object-cover rounded"
                  />

                  <h2 className="mt-2 font-semibold">{t.name}</h2>

                  {distance && (
                    <p className="text-sm text-gray-500">
                      📍 {distance.toFixed(1)} km away
                    </p>
                  )}

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
  );
}