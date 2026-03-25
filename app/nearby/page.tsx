"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";
import { useUser } from "@/lib/userContext";

// ✅ MOBILE COMPONENTS
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

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
  const [search, setSearch] = useState("");
  const { user, loading } = useUser();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);

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

  // ================= SORT =================
  const filtered = [...turfs].sort((a, b) => {
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

        {/* STICKY HEADER */}
          <MobileHeader setShowLocationModal={setShowLocationModal} />
          <MobileNav />


          <div className="px-4 mt-4">

          {/* TITLE */}
          <h2 className="text-lg text-black font-semibold mb-3">
            Select Turf by Your Location
          </h2>

          {/* MAP */}
          <div className="w-full h-[250px] rounded-xl overflow-hidden">
            <MapView
              turfs={filtered}
              center={location}
              selectedTurfId={selectedTurfId}
              onMarkerClick={(id: string) => setSelectedTurfId(id)}
            />
          </div>

          {/* TURF LIST */}
          <div className="mt-5 space-y-4 ">

            {filtered.map((t) => {
              const avg =
                t.reviews?.length
                  ? t.reviews.reduce((s, r) => s + r.rating, 0) /
                    t.reviews.length
                  : 0;

              const sports =
                t.turf_sports
                  ?.map((s) => s.sports?.name?.toLowerCase())
                  .filter(Boolean) || [];

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
                  onClick={() => setSelectedTurfId(t.id)}
                  className={`bg-white rounded-xl shadow-lg/30 overflow-hidden ${
                    selectedTurfId === t.id ? "ring-2 ring-green-500" : ""
                  }`}
                >

                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={t.image_url || "/turf.jpg"}
                      className="w-full h-36 object-cover"
                    />

                    {/* DISTANCE */}
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
                        <span className="bg-yellow-500 text-white font-semibold px-2 py-1 rounded text-xs">
                          {avg.toFixed(1)}
                        </span>
                        <span className="ml-2 text-gray-700 text-base">
                          {t.reviews?.length || 0}
                        </span>
                      </div>
                      <span className="text-sm text-black">📍 {t.locality}</span>
                    </div>

                    <h2 className="text-lg text-black font-semibold mt-1">{t.name}</h2>

                    <div className="flex gap-10 mt-1 text-sm">
                      {sports.includes("football") && "⚽"}
                      {sports.includes("cricket") && "🏏"}
                      {sports.includes("badminton") && "🏸"}
                      {sports.includes("volleyball") && "🏐"}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-base text-gray-800 font-semibold">
                        ₹{t.price}<span className="text-gray-700 font-medium"> / hr </span>
                      </p>
                      <button className="bg-green-600 font-semibold text-white px-3 py-1 rounded text-xs">
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

      {/* ================= 💻 DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:block">

        <Header
          search={search}
          setSearch={setSearch}
          setShowLocationModal={setShowLocationModal}
        />

        <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6">

          <div className="flex justify-between">
            <p className="text-xl font-semibold">
              Select Turf by Your Location
            </p>
          </div>

          <div className="w-[full] md:w-[1000px] h-[350px] md:h-[400px] rounded-2xl overflow-hidden m-auto">
            <MapView
              turfs={filtered}
              center={location}
              selectedTurfId={selectedTurfId}
              onMarkerClick={(id: string) => setSelectedTurfId(id)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {filtered.map((t) => (
              <TurfCard
                key={t.id}
                turf={t}
                router={router}
                location={location}
                isSelected={selectedTurfId === t.id}
                setSelectedTurfId={setSelectedTurfId}
              />
            ))}
          </div>

        </div>
      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-5 rounded-xl w-[400px]">

            <LocationPicker
              onSelect={(lat, lng) => {
                setLocationData({ lat, lng }, city);
              }}
            />

            <button
              onClick={() => setShowLocationModal(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Confirm
            </button>

          </div>
        </div>
      )}
    </div>
  );
}


/// NEARBY PAGE TURF CARD


function TurfCard({
  turf,
  router,
  location,
  isSelected,
  setSelectedTurfId,
}: {
  turf: Turf;
  router: ReturnType<typeof useRouter>;
  location: { lat: number; lng: number } | null;
  isSelected: boolean;
  setSelectedTurfId: (id: string) => void;
}) {

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isSelected]);

  // ⭐ SAME AS HOME CARD
  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;

  const sports =
    turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()).filter(Boolean) || [];

  // 📍 DISTANCE
  let distance: number | null = null;
  if (location) {
    distance = getDistance(
      location.lat,
      location.lng,
      turf.map_lat,
      turf.map_lng
    );
  }

  return (
    <div
      ref={ref}
      onClick={() => setSelectedTurfId(turf.id)}
      className={`cursor-pointer rounded-xl overflow-hidden transition-all
        ${isSelected ? "ring-2 ring-green-500 scale-[1.02]" : "bg-white shadow"}
      `}
    >

      {/* IMAGE */}
      <div className="relative">
        <img
          src={turf.image_url || "/turf.jpg"}
          className="h-47 w-full object-cover"
        />

        {/* 🔥 DISTANCE BADGE */}
        {distance && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs shadow">
            📍 {distance.toFixed(1)} km
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3">

        {/* ⭐ RATING + LOCATION */}
        <div className="flex justify-between text-sm">
          <div>
            <span className="bg-yellow-400 px-3 py-2 rounded text-xs">
              {avg.toFixed(1)}
            </span>
            <span className="ml-2 text-gray-500">
              {turf.reviews?.length || 0} reviews
            </span>
          </div>
          <span>📍 {turf.locality}</span>
        </div>

        {/* NAME */}
        <h2 className="text-lg font-semibold mt-2">{turf.name}</h2>

        {/* ADDRESS */}
        <div className="text-sm text-gray-600">
          {turf.address.split(",").map((l, i) => (
            <div key={i}>{l.trim()}</div>
          ))}
        </div>

        {/* 24/7 */}
        {turf.is_24_7 && <p className="text-sm mt-1">🕒 24/7 Available</p>}

        {/* SPORTS */}
        <div className="flex gap-2 mt-2">
          {sports.includes("football") && "⚽"}
          {sports.includes("cricket") && "🏏"}
          {sports.includes("badminton") && "🏸"}
          {sports.includes("volleyball") && "🏐"}
        </div>

        {/* PRICE + BUTTON */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-black font-semibold">₹{turf.price}/hr</p>
          <button className="bg-green-500 text-white px-4 py-1 rounded-full">
            Book Now
          </button>
        </div>

      </div>
    </div>
  );
}