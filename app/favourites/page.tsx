"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";

import { useUser } from "@/lib/userContext";

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

export default function FavouritesPage() {
  const router = useRouter();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

   const { user, loading } = useUser(); // ✅ GLOBAL AUTH

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating" | null>(null);

  const [removedTurf, setRemovedTurf] = useState<Turf | null>(null);

  // ================= LOAD =================

  useEffect(() => {
  if (loading) return;

  const load = async () => {
    setPageLoading(true); // 🔥 START LOADING

    if (!user) {
      setTurfs([]);
      setPageLoading(false); // 🔥 STOP (important)
      return;
    }

    const { data: favs } = await supabase
      .from("favorites")
      .select("turf_id")
      .eq("user_id", user.id);

    if (!favs || favs.length === 0) {
      setTurfs([]);
      setPageLoading(false);
      return;
    }

    const turfIds = favs.map((f) => f.turf_id);

    const { data: turfData } = await supabase
      .from("turfs")
      .select(`
        *,
        reviews ( rating ),
        turf_sports ( sports ( name ) )
      `)
      .in("id", turfIds);

    setTurfs((turfData as Turf[]) || []);

    setPageLoading(false); // 🔥 END LOADING
  };

  load();
}, [user, loading]);
  
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

  // ================= SEARCH =================
  const filteredTurfs = turfs.filter((t) => {
    if (!search) return true;

    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ================= SORT =================
  const sortedTurfs = [...filteredTurfs].sort((a, b) => {
    if (!sortBy) return 0;

    if (sortBy === "distance" && location) {
      const d1 = getDistance(location.lat, location.lng, a.map_lat, a.map_lng);
      const d2 = getDistance(location.lat, location.lng, b.map_lat, b.map_lng);
      return d1 - d2;
    }

    if (sortBy === "price") return (a.price || 0) - (b.price || 0);

    if (sortBy === "rating") {
      const r1 = a.reviews?.length
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0;

      const r2 = b.reviews?.length
        ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length
        : 0;

      return r2 - r1;
    }

    return 0;
  });

  // ================= REMOVE =================
  const handleRemove = async (turf: Turf) => {
  if (!user) return;

  setRemovingId(turf.id); // 🔥 start animation

  setTimeout(async () => {
    // remove from UI
    setTurfs((prev) => prev.filter((t) => t.id !== turf.id));

    // store for undo
    setRemovedTurf(turf);

    // delete from DB
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("turf_id", turf.id);

    setRemovingId(null); // reset
  }, 300); // 🔥 animation duration
};

  const handleUndo = async () => {
  if (!removedTurf || !user) return;

  setTurfs((prev) => [removedTurf, ...prev]);

  await supabase
  .from("favorites")
  .upsert({
    user_id: user.id,
    turf_id: removedTurf.id,
  });

  setRemovedTurf(null);
};

  return (
    <UserOnly>
  <div className="bg-white min-h-screen">

    {/* ================= MOBILE ================= */}
    <div className="md:hidden">
      <MobileHeader setShowLocationModal={setShowLocationModal} />
      <MobileNav />

      <div className="px-4 mt-4">

        {/* TITLE */}
        <h2 className="text-base text-black font-medium font-sans mb-4">
          Favourites 
        </h2>

        {/* ❌ NOT LOGGED IN */}
        {!user && (
          <div className=" flex flex-col items-center shadow-lg/20 text-center justify-center bg-green-200 rounded-xl p-6 text-center shadow ">
            <img src="/favourites.png" className="w-37 h-37 mb-4" />
            <p className="mb-4 text-sm text-gray-700">
              Please Login to View Your Favourites...
            </p>

            <button
              onClick={() => router.push("/login")}
              className="bg-blue-500 text-white px-5 py-2 font-semibold rounded-lg"
            >
              Login Now
            </button>
          </div>
        )}

        {/* ✅ LOGGED IN */}
        {user && (
          <div className="grid grid-cols-2 gap-3">

  {pageLoading ? (
    [...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 bg-gray-200 w-3/4 rounded mb-1" />
      </div>
    ))
  ) : sortedTurfs.length === 0 ? (

    // ✅ EMPTY STATE INSIDE GRID
    <div className="col-span-2 text-center py-10">
      <img src="/empty.png" className="w-24 mx-auto mb-3 opacity-70" />
      <p className="text-gray-400 text-sm">
        No favourites yet
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-3 text-green-600 font-medium"
      >
        Explore Turfs
      </button>
    </div>

  ) : (
    sortedTurfs.map((t) => (
      <MobileFavCard
        key={t.id}
        turf={t}
        router={router}
        onRemove={() => handleRemove(t)}
        removingId={removingId}
      />
    ))
  )}

</div>
)}
      </div>

      {/* 🔥 TOAST */}
      {removedTurf && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full flex gap-4 items-center shadow-lg">
          Removed
          <button onClick={handleUndo} className="text-green-400">
            Undo
          </button>
        </div>
      )}
    </div>
    


    {/* ================= DESKTOP (UNCHANGED) ================= */}
    <div className="hidden md:block">
      {/* HEADER */}
      <Header
        search={search}
        setSearch={setSearch}
        setShowLocationModal={setShowLocationModal}
      />

      {/* 🔥 NOT LOGGED IN UI */}
      {!user && (
        <div className="max-w-[1200px] mx-auto px-6 mt-10">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-xl font-semibold mb-2">
              Please login to view favourites
            </h2>

            <p className="text-gray-500 mb-4">
              Save your favourite turfs and access them anytime
            </p>

            <button
              onClick={() => router.push("/login")}
              className="bg-green-500 text-white px-6 py-2 rounded-full"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* 🔥 LOGGED IN UI */}
      {user && (
        <div className="max-w-[1200px] mx-auto px-6 py-6">

          {/* SORT */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(["distance", "price", "rating"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-4 py-1 rounded-full text-sm ${
                  sortBy === type ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {type === "distance" && "📍 Distance"}
                {type === "price" && "💰 Price"}
                {type === "rating" && "⭐ Rating"}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

  {pageLoading ? (
    [...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 bg-gray-200 w-3/4 rounded mb-1" />
      </div>
    ))
  ) : sortedTurfs.length === 0 ? (

    // ✅ EMPTY STATE INSIDE GRID
    <div className="col-span-full text-center py-10">
      <img src="/empty.png" className="w-24 mx-auto mb-3 opacity-70" />
      <p className="text-gray-400 text-sm">
        No favourites yet
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-3 text-green-600 font-medium"
      >
        Explore Turfs
      </button>
    </div>

  ) : (
    sortedTurfs.map((t) => (
      <TurfCard
        key={t.id}
        turf={t}
        router={router}
        onRemove={() => handleRemove(t)}
        removingId={removingId}
      />
    ))
  )}

</div>
        </div>
      )}



      



      {/* TOAST */}
      {removedTurf && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-full flex gap-4 items-center shadow-lg">
          Removed from favourites
          <button onClick={handleUndo} className="text-green-400 font-semibold">
            Undo
          </button>
        </div>
      )}

    </div>
    </div>
    {/* LOCATION MODAL (unchanged) */}
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
    </UserOnly>
  );
}

function MobileFavCard({
  turf,
  router,
  onRemove,
  removingId,
}: {
  turf: Turf;
  router: AppRouterInstance;
  onRemove: () => void;
  removingId: string | null;
}) {
  return (
    <div
  className={`relative transition-all duration-300 ${
    removingId === turf.id
      ? "opacity-0 scale-90"
      : "opacity-100 scale-100"
  }`}
>

      {/* CARD */}
      <MobileTurfCard turf={turf} router={router} />

      {/* ❤️ REMOVE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-3 right-3 bg-white px-1 rounded-full p-1 shadow"
      >
        <img src="/icons/heart-filled.png" className="h-4.5" />
      </button>

    </div>
  );
}

      
//////////////////////////////////////////////////////////////
// TURF CARD
//////////////////////////////////////////////////////////////

function TurfCard({
  turf,
  router,
  onRemove,
  removingId,
}: {
  turf: Turf;
  router: AppRouterInstance;
  onRemove: () => void;
  removingId: string | null;
}) {

  const [liked, setLiked] = useState(true);

  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;

      const sports = turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()).filter(Boolean) || [];

      
  return (
    <div 
     onClick={() => router.push(`/turf/${turf.id}`)}
     className={`bg-white rounded-xl overflow-hidden shadow-xl/20 transition-all duration-300 ${
    removingId === turf.id
      ? "opacity-0 scale-90"
      : "opacity-100 scale-100"
  }`}
>

      {/* IMAGE */}
      <div className="relative">
        <img
        src={turf.image_url || "/turf.jpg"}
        className="h-47 w-full object-cover"
      />

        {/* ❤️ ANIMATED BUTTON */}
        <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-white px-2 rounded-full p-2 shadow"
      >
        <img src="/icons/heart-filled.png" className="h-5" />
      </button>
      </div>

      {/* CONTENT */}
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
          <p className="text-black font-semibold text-lg font-sans" >₹{turf.price}
            <span className="text-gray-600 font-medium text-base font-sans"> /hr</span>
            </p>
          <img src="/icons/open.png" className="h-7" />
        </div>
        
      </div>
    </div>
  );
}