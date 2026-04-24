"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";

import UserOnly from "@/components/UserOnly";

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

  min_price?: number;
  max_price?: number;

  image_url?: string;
  map_lat: number;
  map_lng: number;

  reviews?: { rating: number }[];
  turf_sports?: { sports?: { name?: string } }[];
};

export default function SportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [search, setSearch] = useState("");


  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);


  // ================= LOAD DATA =================


  // ================= SEARCH =================
  const filteredTurfs = useMemo(() => {
  if (!selectedSport && !search) return turfs;

  return turfs.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.address || "").toLowerCase().includes(search.toLowerCase());

    const matchesSport =
      !selectedSport ||
      t.turf_sports?.some(
        (sp) => sp.sports?.name?.toLowerCase() === selectedSport
      );

    return matchesSearch && matchesSport;
  });
}, [turfs, selectedSport, search]);



  
  // ================= FETCH =================
  useEffect(() => {
  const load = async () => {
    setLoading(true);

    const { data: sportsData } = await supabase.from("sports").select("*");

    const { data: turfData } = await supabase
      .from("turfs")
      .select(`
        *,
        reviews ( rating ),
        turf_sports ( sports ( name ) )
      `);

    if (turfData) {
      setTurfs(turfData);

      // ✅ STEP 1: Get all sports used in turfs
      const usedSports = new Set(
        turfData.flatMap((t) =>
          (t.turf_sports || [])
            .map((sp: { sports?: { name?: string } }) =>
  sp.sports?.name?.toLowerCase()
)
            .filter(Boolean)
        )
      );

      // ✅ STEP 2: Filter sports list
      if (sportsData) {
        const filtered = sportsData.filter((s) =>
          usedSports.has(s.name.toLowerCase())
        );

        setSports(filtered);
      }
    }

    setLoading(false);
  };

  load();
}, []);


  return (
    <UserOnly>
  <div className="bg-white min-h-screen">

    {/* ================= MOBILE UI ================= */}
    <div className="md:hidden bg-white">

      <MobileHeader setShowLocationModal={setShowLocationModal} />
      <MobileNav />

      <div className="px-4 mt-2 bg-white">

        <p className="text-black font-medium font-sans text-lg mb-3">Select Sports Category</p>
 
        {/* SPORTS SCROLL */}
        <div className="flex gap-3 overflow-x-auto pb-5 no-scrollbar">
          {loading ? (

  // 🔥 SHIMMER UI
  [...Array(5)].map((_, i) => (
    <div
      key={i}
      className="min-w-[110px] h-[150px] rounded-2xl bg-gray-200 animate-pulse"
    />
  ))

) : (

  // ✅ REAL DATA
  sports.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                const newSport =
                  selectedSport === s.name.toLowerCase()
                    ? null
                    : s.name.toLowerCase();

                setSelectedSport(newSport);

                
              }}
              className={`  ${
                selectedSport === s.name.toLowerCase()
                  ? "min-w-[115px] h-[157px] rounded-2xl shadow-md shadow-green-500/60 "
                  : "min-w-[110px] h-[150px] rounded-2xl border-2 border-gray-200"
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
          )))}
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


        <p className="text-gray-400 text-sm mt-1">
  {filteredTurfs.length} turfs found
</p>



        {/* TURF GRID (3 PER ROW) */}
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">

  {loading ? (
    [...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 bg-gray-200 w-3/4 rounded mb-1" />
        <div className="h-3 bg-gray-200 w-1/2 rounded" />
      </div>
    ))
  ) : filteredTurfs.length === 0 ? (
    <div className="col-span-full text-center py-6">
      <img src="/empty.png" className="w-24 mx-auto mb-2 opacity-70" />
      <p className="text-gray-400 text-sm">No turfs found</p>
    </div>
  ) : (
    filteredTurfs.map((t) => (
      <MobileTurfCard key={t.id} turf={t} router={router} />
    ))
  )}

</div>

      </div>
    </div>
    

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
            <h2 className="text-xl font-semibold font-sans text-black">Sports Categories</h2>
          </div>

          {/* DESKTOP SPORTS */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {loading ? (

  // 🔥 SHIMMER UI
  [...Array(5)].map((_, i) => (
    <div
      key={i}
      className="min-w-[110px] h-[150px] rounded-2xl bg-gray-200 animate-pulse"
    />
  ))

) : (

  // ✅ REAL DATA
  sports.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  const newSport =
                    selectedSport === s.name.toLowerCase()
                      ? null
                      : s.name.toLowerCase();

                  setSelectedSport(newSport);

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
                  <div className="absolute bottom-2 left-2 text-white text-sm font-semibold font-sans">
                    {s.name}
                  </div>
                </div>
              </div>
            )))}
          </div>

          {selectedSport && (
            <p className="mt-4 text-gray-500 text-sm font-sans">
              Showing turfs with{" "}
              <span className="text-black font-semibold font-sans">
                {selectedSport}
              </span>
            </p>
          )}

          {/* DESKTOP GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {loading ? (

  [...Array(8)].map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="h-40 bg-gray-200 rounded-xl mb-2" />
      <div className="h-4 bg-gray-200 w-1/2 rounded mb-1" />
      <div className="h-3 bg-gray-200 w-3/4 rounded" />
    </div>
  ))

) : filteredTurfs.length === 0 ? (

  <div className="col-span-full text-center py-10">
    <img src="/empty.png" className="w-28 mx-auto mb-3 opacity-70" />
    <p className="text-gray-400">No turfs found</p>
  </div>

) : (

  filteredTurfs.map((t) => (
    <TurfCard key={t.id} turf={t} router={router} />
  ))

)}
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
  </UserOnly>
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

const min = turf.min_price ?? turf.price;
const max = turf.max_price ?? turf.price;


  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="bg-white rounded-xl shadow-xl/30 cursor-pointer overflow-hidden p-2"
    >
      <img
        src={turf.image_url || "/turf.jpg"}
        className="h-[190px] w-full object-cover rounded-xl"
      />

      <div className="p-3">

        <div className="flex justify-between text-sm font-sans">
          <div>
            <span className="bg-yellow-500 px-3 py-2 rounded text-white text-xs font-sans">{avg.toFixed(1)}</span>
            <span className="ml-2 font-sans text-gray-600">{turf.reviews?.length || 0} reviews</span>
          </div>
          <span className="flex flex-row items-center gap-0.5 font-sans text-black text-sm">
            <img src="/icons/locationtop.png" className="h-4" /> 
          {turf.locality}
          </span>
        </div>

        <h2 className="text-lg text-black font-semibold mt-2 font-sans">{turf.name}</h2>

        <div className="text-sm text-gray-600 font-sans">
          {turf.address.split(",").map((l, i) => (
            <div key={i}>{l.trim()}</div>
          ))}
        </div>


        <div className="flex gap-2 mt-4">
          {sports.includes("football") && <img src="/icons/football.png" className="h-5 ml-2" /> }
          {sports.includes("cricket") && <img src="/icons/cricket.png" className="h-5 ml-2" /> }
          {sports.includes("badminton") && <img src="/icons/badminton.png" className="h-5 ml-2" /> }
          {sports.includes("volleyball") && <img src="/icons/volleyball.png" className="h-5 ml-2" /> }
        </div>
 
        <div className="flex justify-between items-center mt-3">

          <p className="text-black font-semibold text-lg font-sans">
  ₹{min}
  {min !== max && ` - ₹${max}`}
  <span className="text-gray-600 font-medium text-base font-sans">
    {" "} /hr
  </span>
</p>

          <img src="/icons/open.png" className="h-7" />
        </div>
        
      </div>
    </div>
  );
}