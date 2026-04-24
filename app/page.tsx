"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import dynamic from "next/dynamic";
import { useLocation } from "@/lib/locationContext";
import Header from "@/components/Header";

import { useUser } from "@/lib/userContext";

import UserOnly from "@/components/UserOnly";

// ✅ MOBILE COMPONENTS
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import MobileTurfCard from "@/components/homeMobileTurfCard";


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


export default function Home() {
  const router = useRouter();
  const [banners, setBanners] = useState<
  { image_url: string; redirect_url?: string | null }[]
>([]);

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [pageLoading, setPageLoading] = useState(true);

  const { user, profile, loading } = useUser();
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(0);

  const { city, location, setLocationData } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [touchStart, setTouchStart] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const safeBanners =
  banners.length > 0
    ? banners
    : [{ image_url: "/banner1.jpg", redirect_url: null }];

  const nextSlide = () => {
  if (safeBanners.length === 0) return;
  setCurrent((prev) => (prev + 1) % safeBanners.length);
};

const prevSlide = () => {
  if (safeBanners.length === 0) return;
  setCurrent((prev) => (prev - 1 + safeBanners.length) % safeBanners.length);
};

  // ================= LOAD =================
  useEffect(() => {
  const loadData = async () => {
    setPageLoading(true);

    const [turfsRes, bookingsRes, bannersRes] = await Promise.all([
  supabase
    .from("turfs")
    .select(`
      id, name, locality, address, price, min_price, max_price,
      image_url, map_lat, map_lng,
      reviews ( rating ),
      turf_sports ( sports ( name ) )
    `)
    .returns<Turf[]>(),   // ✅ ADD THIS

  supabase.from("bookings").select("turf_id"),

  supabase
    .from("banners")
    .select("image_url, redirect_url")
    .eq("active", true)
    .order("display_order", { ascending: true }),
]);

    if (turfsRes.error) {
  console.error("Turfs error:", turfsRes.error);
} else {
  setTurfs(turfsRes.data || []);
}
    if (bannersRes.error) {
  console.error("Banners error:", bannersRes.error);
} else {
  setBanners(bannersRes.data || []);
}

    if (bookingsRes.data) {
      const counts: Record<string, number> = {};
      bookingsRes.data.forEach((b) => {
        counts[b.turf_id] = (counts[b.turf_id] || 0) + 1;
      });
      setBookingCounts(counts);
    }

    setPageLoading(false);
  };

  loadData();
}, []);

useEffect(() => {
  if (loading) return;
  if (!profile) return;

  if (profile.role === "owner" && profile.owner_approved) {
    router.replace("/owner"); // 🔥 BLOCK ACCESS
  }
}, [profile, loading, router]);

  // ================= FILTER =================
  const filteredTurfs = useMemo(() => {
    return turfs.filter((t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase())
    );
  }, [turfs, search]);

  const trendingTurfs = useMemo(() => {
  return [...filteredTurfs]
    .map((t) => {
      const bookings = bookingCounts[t.id] || 0;
      const rating =
        t.reviews?.length
          ? t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length
          : 0;

      const score = bookings * 0.7 + rating * 0.3;

      return { ...t, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}, [filteredTurfs, bookingCounts]);

  const nearbyTurfs = useMemo(() => {
  if (!location) return filteredTurfs;

  return filteredTurfs
    .map((t) => ({
      ...t,
      distance: getDistance(location.lat, location.lng, t.map_lat, t.map_lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}, [filteredTurfs, location]);

  const allTurfs = filteredTurfs.slice(0, 7);

  // ================= CAROUSEL =================
  useEffect(() => {
  if (safeBanners.length === 0) return;

const interval = setInterval(() => {
  setCurrent((prev) => (prev + 1) % safeBanners.length);
}, 3000);

  return () => clearInterval(interval);
}, [safeBanners.length]);

  if (!loading && profile?.role === "owner" && profile?.owner_approved) {
  return null; // ⛔ stop rendering completely
  }
  

  if (pageLoading) {
  return (
    <div className="md:hidden bg-white min-h-screen">
      <MobileHeader setShowLocationModal={setShowLocationModal} />
      <MobileNav />
      <div className="animate-pulse space-y-3 p-4">
  <div className="h-40 bg-gray-200 rounded-xl" />
  <div className="h-5 bg-gray-200 w-3/4 rounded" />
  <div className="h-5 bg-gray-200 w-1/2 rounded" />
</div>
    </div>
  );
}





  // ================= UI =================
  return (
    <UserOnly>
    <>
      {/* ================= 📱 MOBILE ================= */}
      <div className="md:hidden bg-white min-h-screen">

        <MobileHeader setShowLocationModal={setShowLocationModal} />
        <MobileNav />

        {/* 🔥 PREMIUM MOBILE CAROUSEL */}
<div className="px-4 mt-3 mb-5">

  <div
    className="relative overflow-hidden rounded-xl"
    onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
    onTouchEnd={(e) => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (diff > 50) nextSlide();
      if (diff < -50) prevSlide();
    }}
  >

    {/* SLIDER */}
    <div
      className="flex transition-transform duration-500"
      style={{
        transform: `translateX(-${current * 100}%)`,
      }}
    >
      {(safeBanners.length > 0 ? safeBanners : [{ image_url: "/banner1.jpg" }]
).map((b, i) => (
  <img
    key={i}
    src={b.image_url}
    onClick={() => {
  if (!b.redirect_url) return;

  if (b.redirect_url.startsWith("http")) {
    window.open(b.redirect_url, "_blank");
  } else {
    router.push(b.redirect_url);
  }
}}
    className="w-full h-40 object-cover flex-shrink-0 cursor-pointer"
  />
))}
    </div>

    {/* DOTS */}
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
  {(safeBanners.length > 0 ? safeBanners : [{ image_url: "/banner1.jpg" }]).map((_, i) => (
  <div
    key={i}
    className={`h-2 w-2 rounded-full ${
      i === current ? "bg-white" : "bg-white/50"
    }`}
  />
))}
</div>

  </div>
</div>

        {/* SECTIONS */}
        <MobileSection title="Todays Trending" turfs={trendingTurfs} router={router} loading={pageLoading} />
        <MobileSection title="Nearby Me" turfs={nearbyTurfs} router={router} loading={pageLoading} />
        <MobileSection title="All Turfs" turfs={allTurfs} router={router} loading={pageLoading} />

      </div>

      {/* ================= 💻 DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:block bg-white-100 min-h-screen">

        <Header
          search={search}
          setSearch={setSearch}
          setShowLocationModal={setShowLocationModal}
        />
{/* ================= 🔥 PREMIUM CAROUSEL ================= */}
      <div className="bg-white py-6">
        <div className="relative max-w-[1200px] mx-auto overflow-hidden">

          <div
            className={`flex ${isTransitioning ? "transition-transform duration-500" : ""}`}
            style={{ transform: `translateX(-${(current + 1) * 60}%)` }}
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const diff = touchStart - e.changedTouches[0].clientX;
              if (diff > 50) nextSlide();
              if (diff < -50) prevSlide();
            }}
          >
            {safeBanners.length >= 1 && (
  <>
    <Slide
  src={safeBanners[safeBanners.length - 1].image_url}
  isActive={false}
/>

    {safeBanners.map((b, i) => (
      <Slide
  key={i}
  src={b.image_url}
  isActive={i === current}
  onClick={() => {
  if (!b.redirect_url) return;

  if (b.redirect_url.startsWith("http")) {
    window.open(b.redirect_url, "_blank");
  } else {
    router.push(b.redirect_url);
  }
}}
/>
    ))}

    <Slide
  src={safeBanners[0].image_url}
  isActive={false}
/>
  </>
)}
          </div>

          <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow">
            ◀
          </button>

          <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow">
            ▶
          </button>
        </div>
      </div>

      {/* ================= TRENDING ================= */}
      <Section title="Trending Turfs">
  {pageLoading ? (
    [...Array(4)].map((_, i) => <TurfCardSkeleton key={i} />)
  ) : trendingTurfs.length === 0 ? (
    <div className="text-center py-10 col-span-full">
  <img src="/empty.png" className="w-28 mx-auto mb-3 opacity-70" />
  <p className="text-gray-400">No turfs found</p>
</div>
  ) : (
    trendingTurfs.map((t) => (
      <TurfCard key={t.id} turf={t} router={router} />
    ))
  )}
</Section>

      {/* ================= NEARBY ================= */}
      <Section title="Nearby Me">
  {pageLoading ? (
    [...Array(4)].map((_, i) => <TurfCardSkeleton key={i} />)
  ) : nearbyTurfs.length === 0 ? (
    <div className="text-center py-10 col-span-full">
  <img src="/empty.png" className="w-28 mx-auto mb-3 opacity-70" />
  <p className="text-gray-400">No turfs found</p>
</div>
  ) : (
    nearbyTurfs.map((t) => (
      <TurfCard key={t.id} turf={t} router={router} />
    ))
  )}
</Section>

      {/* ================= ALL ================= */}
      <Section title="All Turfs">
  {pageLoading ? (
    [...Array(4)].map((_, i) => <TurfCardSkeleton key={i} />)
  ) : allTurfs.length === 0 ? (
    <div className="text-center py-10 col-span-full">
  <img src="/empty.png" className="w-28 mx-auto mb-3 opacity-70" />
  <p className="text-gray-400">No turfs found</p>
</div>
  ) : (
    allTurfs.map((t) => (
      <TurfCard key={t.id} turf={t} router={router} />
    ))
  )}
</Section>


      
      </div>
      {showLocationModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <div className="bg-white p-5 rounded-xl w-[400px]">

      <h2 className="font-semibold text-black mb-3">Select Location</h2>

      <LocationPicker
        onSelect={(lat, lng) => {
          setLocationData({ lat, lng }, city); // temp
        }}
      />

      <div className="flex justify-between mt-4">
        <button onClick={() => setShowLocationModal(false)} className="text-black" >
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

            // 🔥 GLOBAL UPDATE
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
    </>
    </UserOnly>
  );
}



// ================= SLIDE =================
function Slide({
  src,
  isActive,
  onClick,
}: {
  src: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[60%] px-3 cursor-pointer"
    >
      <div
        className={`${
          isActive ? "scale-100" : "scale-90 opacity-60"
        } transition-all`}
      >
        <img
          src={src}
          className="w-full h-[200px] md:h-[350px] object-cover rounded-2xl"
        />
      </div>
    </div>
  );
}


// ================= MOBILE SECTION =================
function MobileSection({
  title,
  turfs,
  router,
  loading,
}: {
  title: string;
  turfs: Turf[];
  router: AppRouterInstance;
  loading: boolean;
}) {
  return (
    <div className="px-4 mt-1 ">
      <h2 className="font-medium text-lg font-sans text-black mb-3">{title}</h2>

      {loading ? (
  <div className="flex gap-4">
    {[1,2,3].map((i) => (
      <div key={i} className="w-40 animate-pulse">
        <div className="h-[120px] bg-gray-200 rounded-xl mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
) : turfs.length === 0 ? (
  <div className="text-center py-6 w-full">
    <img src="/empty.png" className="w-24 mx-auto mb-2 opacity-70" />
    <p className="text-gray-400 text-sm">No turfs found</p>
  </div>
) : (
  <div className="flex gap-4 overflow-x-auto pb-5 no-scrollbar snap-x snap-mandatory">
    {turfs.map((t) => (
      <MobileTurfCard key={t.id} turf={t} router={router} />
    ))}
  </div>
)}
    </div>
  );
}
//////////////////////////////////////////////////////////////
// SECTION (UNCHANGED)
//////////////////////////////////////////////////////////////

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 mb-10">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold font-sans">{title}</h2>
        {right}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  );
}


/// HOME PAGE TURF CARD


function TurfCard({ turf, router }: { turf: Turf; router: AppRouterInstance }) {
  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) / turf.reviews.length
      : 0;

const sports = turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()).filter(Boolean) || [];


  return (
    <div
      onClick={() => router.push(`/turf/${turf.id}`)}
      className="bg-white rounded-xl shadow-xl/30 cursor-pointer overflow-hidden p-2"
    >
      <img
  src={turf.image_url || "/turf.jpg"}
  alt={`${turf.name} turf in ${turf.locality}`}
  loading="lazy"
  onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
  className="w-full h-[180px] object-cover rounded-xl opacity-0 transition-opacity duration-500"
/>

      <div className="p-3">

        <div className="flex justify-between font-sans text-sm">
          <div>
            <span className="bg-yellow-500 text-white px-3 py-1.5 font-semibold rounded font-sans text-xs">{avg.toFixed(1)}</span>
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
  ₹{turf.min_price ?? turf.price}
  {(turf.min_price !== turf.max_price) &&
    ` - ₹${turf.max_price}`}
  <span className="text-gray-600 font-medium text-base font-sans"> /hr</span>
</p>
          <img src="/icons/open.png" className="h-7" />
        </div>
        
      </div>
    </div>
  );
}


function TurfCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-2 animate-pulse">
      <div className="h-[180px] w-full bg-gray-200 rounded-xl" />

      <div className="p-3 space-y-2">
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />

        <div className="flex gap-2 mt-2">
          <div className="h-5 w-5 bg-gray-200 rounded-full" />
          <div className="h-5 w-5 bg-gray-200 rounded-full" />
        </div>

        <div className="h-5 w-1/4 bg-gray-200 rounded mt-3" />
      </div>
    </div>
  );
}