"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

import UserOnly from "@/components/UserOnly";

import { useLocation } from "@/lib/locationContext";

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

export default function TurfsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [search, setSearch] = useState("");


  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);



  // ================= LOAD DATA =================


  // ================= SEARCH =================
  const filteredTurfs = turfs.filter((t) => {
    if (!search) return true;

    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.address || "").toLowerCase().includes(search.toLowerCase())
    );
  });


  // ================= FETCH =================
 useEffect(() => {
  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("turfs")
      .select(`
        *,
        reviews ( rating ),
        turf_sports (
          sports ( name )
        )
      `);

    if (error) {
      console.error("Error fetching turfs:", error);
    } else if (data) {
      setTurfs(data);
    }

    setLoading(false);
  };

  load();
}, []);



return (
  <UserOnly>
  <div className="bg-white-100 min-h-screen">

    {/* ================= MOBILE UI ================= */}
    <div className="md:hidden bg-white">

      <MobileHeader setShowLocationModal={setShowLocationModal} />
      <MobileNav />

      <div className="px-4 mt-4">

        <h2 className="text-lg text-black ml-2 font-medium font-sans mb-3">All Turfs</h2>


        <p className="text-gray-400 text-sm mt-2">
  {filteredTurfs.length} turfs found
</p>





{!location && !loading && (
  <div
    onClick={() => setShowLocationModal(true)}
    className="text-center py-3 cursor-pointer"
  >
    <p className="text-gray-400 text-sm">
      Select location for better results 📍
    </p>
  </div>
)}






        {/* ✅ 2 CARDS PER ROW (NO OVERLAP) */}
        <div className="grid grid-cols-2 gap-3">
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

          {/* TITLE */}
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">All Turfs</h2>
          </div>




          {!location && !loading && (
  <div
    onClick={() => setShowLocationModal(true)}
    className="text-center py-6 cursor-pointer"
  >
    <p className="text-gray-400">
      Select location to see nearby turfs 📍
    </p>
  </div>
)}














          {/* DESKTOP GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
// TURF CARD (UNCHANGED)
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