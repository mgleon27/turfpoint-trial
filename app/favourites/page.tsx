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
  const [search, setSearch] = useState("");

   const { user, loading } = useUser(); // ✅ GLOBAL AUTH

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating" | null>(null);

  const [removedTurf, setRemovedTurf] = useState<Turf | null>(null);

  // ================= LOAD =================

  useEffect(() => {
  if (loading) return;

  const load = async () => {
    if (!user) {
      setTurfs([]);
      return;
    }

    const { data: favs } = await supabase
      .from("favorites")
      .select("turf_id")
      .eq("user_id", user.id);

    if (!favs || favs.length === 0) {
      setTurfs([]);
      return;
    }

    const turfIds = favs.map((f) => f.turf_id);

    const { data: turfData } = await supabase
      .from("turfs")
      .select(`
        *,
        reviews ( rating ),
        turf_sports (
          sports ( name )
        )
      `)
      .in("id", turfIds);

    setTurfs((turfData as Turf[]) || []);
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

    setTurfs((prev) => prev.filter((t) => t.id !== turf.id));
    setRemovedTurf(turf);

    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("turf_id", turf.id);

    setTimeout(() => setRemovedTurf(null), 4000);
  };

  const handleUndo = async () => {
  if (!removedTurf || !user) return;

  setTurfs((prev) => [removedTurf, ...prev]);

  await supabase.from("favorites").insert({
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
          Favourites ❤️
        </h2>

        {/* ❌ NOT LOGGED IN */}
        {!user && (
          <div className=" flex flex-col items-center shadow-lg/20 text-center justify-center bg-gray-100 rounded-xl p-6 text-center shadow ">
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
            {sortedTurfs
  .filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.address.toLowerCase().includes(search.toLowerCase())
  )
  .map((t) => (
              <MobileFavCard
                key={t.id}
                turf={t}
                router={router}
                onRemove={() => handleRemove(t)}
              />
            ))}
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
            {sortedTurfs
  .filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.address.toLowerCase().includes(search.toLowerCase())
  )
  .map((t) => (
              <TurfCard
                key={t.id}
                turf={t}
                router={router}
                onRemove={() => handleRemove(t)}
              />
            ))}
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
}: {
  turf: Turf;
  router: AppRouterInstance;
  onRemove: () => void;
}) {
  return (
    <div className="relative">

      {/* CARD */}
      <MobileTurfCard turf={turf} router={router} />

      {/* ❤️ REMOVE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
      >
        ❤️
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
}: {
  turf: Turf;
  router: AppRouterInstance;
  onRemove: () => void;
}) {

  const [liked, setLiked] = useState(true);

  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;

      const sports = turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()).filter(Boolean) || [];

      
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">

      {/* IMAGE */}
      <div className="relative">
        <img
          src={turf.image_url || "/turf.jpg"}
          className="h-40 w-full object-cover cursor-pointer"
          onClick={() => router.push(`/turf/${turf.id}`)}
        />

        {/* ❤️ ANIMATED BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(false);
            onRemove();
          }}
          className={`absolute top-2 right-2 text-xl transition-transform ${
            liked ? "scale-100" : "scale-75"
          }`}
        >
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-3 cursor-pointer" onClick={() => router.push(`/turf/${turf.id}`)}>

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