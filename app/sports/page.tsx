"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";
import { useUser } from "@/lib/userContext";

import dynamic from "next/dynamic";

// ✅ MOBILE COMPONENTS
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import MobileTurfCard from "@/components/MobileTurfCard";


const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
);

// ================= TYPES =================
type Sport = {
  id: string;
  name: string;
  image_url?: string;
};

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

export default function SportsPage() {
  const router = useRouter();

  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [filtered, setFiltered] = useState<Turf[]>([]);
  const [search, setSearch] = useState("");

  const { user, loading } = useUser(); // ✅ GLOBAL AUTH

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);


  // ================= LOAD DATA =================


  // ================= SEARCH =================
  const filteredTurfs = turfs.filter((t) => {
    if (!search) return true;

    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase())
    );
  });



  
  // ================= FETCH =================
  useEffect(() => {
  const load = async () => {
    const { data: sportsData } = await supabase.from("sports").select("*");

    const { data: turfData } = await supabase
      .from("turfs")
      .select(`
        *,
        reviews ( rating ),
        turf_sports (
          sports ( name )
        )
      `);

    if (sportsData) setSports(sportsData);

    if (turfData) {
      setTurfs(turfData);
      setFiltered(turfData);
    }
  };

  load();
}, []);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}


  return (
  <div className="bg-white-100 min-h-screen">

    {/* ================= MOBILE UI ================= */}
    <div className="md:hidden bg-white">

      <MobileHeader setShowLocationModal={setShowLocationModal} />
      <MobileNav />

      <div className="px-4 mt-2 bg-white">

        {/* SPORTS SCROLL */}
        <div className="flex gap-3 overflow-x-auto pb-5 no-scrollbar">
          {sports.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                const newSport =
                  selectedSport === s.name.toLowerCase()
                    ? null
                    : s.name.toLowerCase();

                setSelectedSport(newSport);

                if (!newSport) {
                  setFiltered(turfs);
                  return;
                }

                const data = turfs.filter((t) =>
                  t.turf_sports?.some(
                    (sp) => sp.sports?.name?.toLowerCase() === newSport
                  )
                );

                setFiltered(data);
              }}
              className={`min-w-[110px] h-38 rounded-2xl border-2 ${
                selectedSport === s.name.toLowerCase()
                  ? "border-green-500 border-3"
                  : "border-gray-200"
              }`}
            >
              <div className="relative w-full h-full shadow-lg/20 overflow-hidden rounded-xl">
                <img
                  src={s.image_url || "/sport.jpg"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                  {s.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SELECTED TEXT */}
        {selectedSport && (
          <p className="mt-2 text-gray-600 font-medium text-sm pl-2">
            Showing turfs for{" "}
            <span className="text-black pl-1 text-sm font-medium">
              {selectedSport}
            </span>
          </p>
        )}

        {/* TURF GRID (3 PER ROW) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
          {filtered.map((t) => (
            <MobileTurfCard key={t.id} turf={t} router={router} />
          ))}
        </div>

      </div>
    </div>
    {/* LOCATION MODAL (UNCHANGED) */}
    {showLocationModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
        <div className="bg-white p-5 rounded-xl w-[400px]">
          <h2 className="font-semibold text-black mb-3">Select Location</h2>

          <LocationPicker
            onSelect={(lat, lng) => {
              setLocationData({ lat, lng }, city);
            }}
          />

          <div className="flex justify-between mt-4">
            <button onClick={() => setShowLocationModal(false)} className="text-black">
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

                setLocationData(location, newCity);
                setShowLocationModal(false);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ================= DESKTOP UI (UNCHANGED) ================= */}
    <div className="hidden md:block">

      {/* HEADER */}
      <Header
        search={search}
        setSearch={setSearch}
        setShowLocationModal={setShowLocationModal}
      />

      <div className="bg-white p-6">
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Sports Categories</h2>
          </div>

          {/* DESKTOP SPORTS */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {sports.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  const newSport =
                    selectedSport === s.name.toLowerCase()
                      ? null
                      : s.name.toLowerCase();

                  setSelectedSport(newSport);

                  if (!newSport) {
                    setFiltered(turfs);
                    return;
                  }

                  const data = turfs.filter((t) =>
                    t.turf_sports?.some(
                      (sp) => sp.sports?.name?.toLowerCase() === newSport
                    )
                  );

                  setFiltered(data);
                }}
                className={`w-30 h-40 rounded-xl border-2 ${
                  selectedSport === s.name.toLowerCase()
                    ? "border-green-500"
                    : "border-transparent"
                }`}
              >
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <img
                    src={s.image_url || "/sport.jpg"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-2 left-2 text-white text-sm font-semibold">
                    {s.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedSport && (
            <p className="mt-4 text-gray-500 text-sm">
              Showing turfs with{" "}
              <span className="text-black font-semibold">
                {selectedSport}
              </span>
            </p>
          )}

          {/* DESKTOP GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {filtered.map((t) => (
              <TurfCard key={t.id} turf={t} router={router} />
            ))}
          </div>

        </div>
      </div>
    </div>

    {/* LOCATION MODAL (UNCHANGED) */}
    {showLocationModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
        <div className="bg-white p-5 rounded-xl w-[400px]">
          <h2 className="font-semibold mb-3">Select Location</h2>

          <LocationPicker
            onSelect={(lat, lng) => {
              setLocationData({ lat, lng }, city);
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

                setLocationData(location, newCity);
                setShowLocationModal(false);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded"
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

//////////////////////////////////////////////////////////////
// TURF CARD
//////////////////////////////////////////////////////////////

function TurfCard({ 
  turf, 
  router 
}: { 
  turf: Turf; 
  router: AppRouterInstance 
}) {
  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;

const sports = turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()).filter(Boolean) || [];


  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="bg-white rounded-xl shadow cursor-pointer overflow-hidden"
    >
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-47 w-full object-cover"
      />

      <div className="p-3">

        <div className="flex justify-between text-sm">
          <div>
            <span className="bg-yellow-400 px-3 py-2 rounded text-xs">{avg.toFixed(1)}</span>
            <span className="ml-2 text-gray-500">{turf.reviews?.length || 0} reviews</span>
          </div>
          <span>📍 {turf.locality}</span>
        </div>

        <h2 className="text-lg font-semibold mt-2">{turf.name}</h2>

        <div className="text-sm text-gray-600">
          {turf.address.split(",").map((l, i) => (
            <div key={i}>{l.trim()}</div>
          ))}
        </div>

        {turf.is_24_7 && <p className="text-sm mt-1">🕒 24/7 Available</p>}

        <div className="flex gap-2 mt-2">
          {sports.includes("football") && "⚽"}
          {sports.includes("cricket") && "🏏"}
          {sports.includes("badminton") && "🏸"}
          {sports.includes("volleyball") && "🏐"}
        </div>
 
        <div className="flex justify-between items-center mt-3">
          <p className="text-black font-semibold" >₹{turf.price}/hr</p>
          <button className="bg-green-500 text-white px-4 py-1 rounded-full">Book Now</button>
        </div>
        
      </div>
    </div>
  );
}