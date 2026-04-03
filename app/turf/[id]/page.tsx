"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";

import {useUser} from "@/lib/userContext";

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

  opening_time?: string;
  closing_time?: string;
  area_sqm?: number;

  parking?: boolean;
  water?: boolean;
  restroom?: boolean;
  other_features?: string | null;
  other_sports?: string | null;

  reviews?: { rating: number }[];
  turf_sports?: { sports?: { name?: string } }[];
};

type TurfImage = {
  image_url: string;
  position: number;
};

type Amenity = {
  label: string;
  icon: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  image_urls: string[] | null;
  profiles?: {
    full_name?: string;
  };
};

export default function TurfDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [turf, setTurf] = useState<Turf | null>(null);
  const [images, setImages] = useState<TurfImage[]>([]);
  const [activeImg, setActiveImg] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const { user } = useUser();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("turfs")
        .select(`
          *,
          reviews ( rating ),
          turf_sports ( sports ( name ) )
        `)
        .eq("id", id)
        .single();

      if (data) setTurf(data);

      const { data: imgs } = await supabase
        .from("turf_images")
        .select("*")
        .eq("turf_id", id)
        .order("position", { ascending: true });

      if (imgs && imgs.length > 0) {
        setImages(imgs);
        setActiveImg(imgs[0].image_url);
      } else if (data?.image_url) {
        setActiveImg(data.image_url);
      }

      const { data: reviewData } = await supabase
        .from("reviews")
        .select(`*, profiles ( full_name )`)
        .eq("turf_id", id)
        .limit(7);

      if (reviewData) setReviews(reviewData);
    };

    load();
  }, [id]);

  if (!turf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const openMap = () => {
  const url = `https://www.google.com/maps/search/?api=1&query=${turf.map_lat},${turf.map_lng}`;
  window.open(url, "_blank");
};

const getDirections = () => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${turf.map_lat},${turf.map_lng}`;
  window.open(url, "_blank");
};


  const avg =
    turf.reviews?.length
      ? turf.reviews.reduce((s, r) => s + r.rating, 0) /
        turf.reviews.length
      : 0;

  const sports = [
    ...(turf.turf_sports?.map((s) => s.sports?.name?.toLowerCase()) || []),
    ...(turf.other_sports
      ? turf.other_sports.toLowerCase().split(",")
      : []),
  ];

  const amenities: Amenity[] = [
    turf.parking && { label: "Parking", icon: "/icons/parking.png" },
    turf.water && { label: "Water", icon: "/icons/water.png" },
    turf.restroom && { label: "Restroom", icon: "/icons/restroom.png" },
    turf.other_features && {
      label: turf.other_features,
      icon: "/icons/feature.png",
    },
  ].filter(Boolean) as Amenity[];

  return (
    <div className="bg-white min-h-screen">

      {/* ================= MOBILE ================= */}
      <div className="md:hidden bg-white">

        
        <div className="px-4 py-4 bg-white">

          {/* BACK */}
          <div  className="flex gap-3 mb-4 items-center">
            <img src="/icons/back.png" className="w-4 h-4"
            onClick={() => router.back()} />
            <span className="text-xl text-black">Turf Details</span>
          </div>

          {/* IMAGE */}
          <img src={activeImg || "/turf.jpg"} className="w-full h-[200px] rounded-xl object-cover" />

          <div className="flex gap-2 mt-2 overflow-x-auto ">
            {images.map((img, i) => (
              <img key={i} src={img.image_url} onClick={() => setActiveImg(img.image_url)}
                className="w-16 h-14 rounded object-cover" />
            ))}
          </div>

          {/* NAME + RATING */}
          <div className="relative mt-4">

              {/* CENTER NAME */}
              <h1 className="text-xl text-black font-semibold text-center">
                 {turf.name}
              </h1>

              {/* RIGHT SIDE RATING */}
              <div className="absolute right-0 top-0 text-sm flex items-center gap-2 mr-2">
                  <span className="bg-yellow-300 text-black rounded-md pl-2 pr-3 py-1">
                  ⭐ {avg.toFixed(1)}
                  </span>
                 <span className="text-lg text-center text-black">({turf.reviews?.length || 0})</span>
              </div>

</div>

          <div className="flex justify-center mt-3">
          <p className="text-sm text-gray-800">{turf.address}</p>
          </div>

          <div className="flex justify-center mt-2">
          <h2 className="text-lg text-black font-semibold mt-2">₹{turf.price}<span className=" text-gray-800 font-medium">/ 60 minutes</span></h2>
          </div>




          <div className="flex justify-center gap-4">

          <button onClick={openMap}
           className="bg-white border-2 border-green-700 px-5 py-1 text-lg text-green-900 font-medium font-sans rounded-full mt-3 mb-1">
            Locate on Map
          </button>


          <button onClick={getDirections} 
          className="bg-green-600 px-7 py-1 text-lg text-white font-medium rounded-full mt-3 mb-1">
            Get Direction
          </button>

          </div>




          {/* DETAILS */}
          <div className="mt-4 space-y-2 text-sm">

            <div className="flex justify-between pt-1">
                 <div className="flex gap-3 text-base text-black font-medium ml-2">
                   <img src="/icons/timing.png" className="w-5 h-5" />
                   {turf.is_24_7 ? "24/7  Available" : `${turf.opening_time} - ${turf.closing_time}`}
                 </div>


                  <div className="flex gap-2 text-base text-black font-medium pr-6">
                   <img src="/icons/location.png" className="w-5 h-5" />
                   {turf.locality}
                 </div>
            </div>


                 {turf.area_sqm && (
            <div className="flex gap-3 text-base text-black font-medium items-center mt-4 ml-2">
                <img src="/icons/area.png" className="w-4 h-4" />
                {turf.area_sqm} sq.m
            </div>
            )}
          </div>

          <hr className="my-4" />

          {/* SPORTS */}
          <h2 className="font-semibold text-black text-xl pb-6 pt-1">
            Sports Provided
          </h2>

          <div className="grid grid-cols-2 gap-5 ml-5">
            
            {sports.map((s, i) => (
              <div key={i} className="flex gap-2 items-center text-black text-base">
                <img src={`/icons/${s}.png`} className="w-6 h-6" />
                {s}
              </div>
            ))}
          </div>

          <hr className="my-4 mt-7" />

          {/* AMENITIES */}
          <h2 className="font-semibold text-black text-xl pb-6 pt-1">
            Amenities
          </h2>

          <div className="grid grid-cols-4 gap-4 mb-10">
            {amenities.map((a, i) => (
              <div key={i} className="text-center ">
                <img src={a.icon} className="w-8 h-8 mx-auto" />
                <p className="text-base text-black pt-2">{a.label}</p>
              </div>
            ))}
          </div>

          {/* REVIEWS */}
<div className="flex justify-between items-center mt-6">
  <h2 className="font-semibold text-black text-xl">Reviews</h2>

  <p className="items-center">
    <span className="bg-yellow-300 rounded-md pl-2 pr-3 py-1 mr-2 text-black">
      ⭐ {avg.toFixed(1)}
    </span>
    <span className="text-lg text-black">
      ({turf.reviews?.length || 0})</span>
  </p>
</div>

{/* HORIZONTAL SCROLL */}
<div className="flex gap-4 overflow-x-auto mt-4 no-scrollbar">

  {reviews.slice(0, 7).map((r, i) => {
    const imgs = r.image_urls || [];

    return (
      <div
        key={i}
        className="min-w-[200px] h-[200px] border rounded-xl p-3 flex flex-col justify-between"
      >
        {/* NAME */}
        <p className="text-sm text-black font-semibold">
          {r.profiles?.full_name || "User"}
        </p>

        {/* IMAGES */}
        {imgs.length > 0 && (
          <div className="flex gap-2 mt-2">
            {imgs.slice(0, 2).map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="w-14 h-14 object-cover rounded"
              />
            ))}

            {imgs.length > 2 && (
              <div className="w-14 h-14 flex items-center justify-center text-black text-xs bg-gray-200 rounded">
                +{imgs.length - 2}
              </div>
            )}
          </div>
        )}

        {/* COMMENT */}
        <p className="text-xs text-gray-700 line-clamp-3 mt-2">
          {r.comment || "No review"}
        </p>

        {/* VIEW MORE */}
        <div className="text-right text-xs text-gray-400">
          
        </div>
      </div>
    );
  })}

  {/* VIEW ALL CARD */}
  <div className="min-w-[80px] flex items-center justify-center text-black text-xl">
    →
  </div>

</div>

          <button className="w-full bg-green-600 text-lg text-white py-3 rounded-full mt-5"
          onClick={() => {
  if (!user) {
    setShowLoginPopup(true);
  } else {
    router.push(`/turf/${turf.id}/book`);
  }
}}>
            Book Slot Now
          </button>

        </div>
      </div>

      {/* ================= DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:block">
        {/* ✅ YOUR ORIGINAL DESKTOP CODE — NO CHANGES */}
        <div className="bg-white min-h-screen">

      <Header
        search=""
        setSearch={() => {}}
        setShowLocationModal={() => {}}
      />

      <div className="max-w-[1200px] mx-auto px-6 py-6 h-[calc(100vh-140px)]">

        {/* BACK */}
        <div
          className=" mb-6 text-xl font-semibold flex items-center gap-5"
        >
        <img src="/icons/back.png" className="w-4 h-4 cursor-pointer" 
        onClick={() => router.back()}/>Turf Details
        </div>

        <div className="flex gap-10 h-full">

          {/* LEFT IMAGE */}
          <div className="w-[45%] h-full">

            <img
              src={activeImg || "/turf.jpg"}
              className="w-full h-[320px] object-cover rounded-xl"
            />

            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url}
                  onClick={() => setActiveImg(img.image_url)}
                  className="w-20 h-16 object-cover rounded cursor-pointer border"
                />
              ))}
            </div>

          </div>

          {/* RIGHT CONTENT */}
          <div className="w-[55%] h-full overflow-y-auto pr-2 space-y-6 pb-20 no-scrollbar">

            {/* NAME */}
            <div className="flex justify-between items-start">

              <div className="flex justify-between items-center gap-5">

                <h1 className="text-2xl font-semibold">{turf.name}</h1>
                <p className="text-gray-500">
                  ⭐ {avg.toFixed(1)} ({turf.reviews?.length || 0})
                </p>
              </div>

              <div className="text-sm">📍 {turf.locality}</div>
            </div>

            {/* ADDRESS */}
            <div className="text-gray-600">
              {turf.address}
            </div>

            {/* TIME */}
            <div className="flex items-center gap-2 text-sm">
  <img src="/icons/timing.png" className="w-4 h-4" />

  {turf.is_24_7
    ? "24/7 Available"
    : `${turf.opening_time} - ${turf.closing_time}`}
</div>

            {/* AREA */}
            {turf.area_sqm && (
  <div className="flex items-center gap-2 text-sm">
    <img src="/icons/area.png" className="w-4 h-4" />
    {turf.area_sqm} sq.m
  </div>
)}

            {/* PRICE */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                ₹{turf.price} <span className="text-base font-medium text-gray-600">/ 60 minutes</span>
              </h2>

              <button className="bg-green-500 px-5 py-2 rounded-full text-white border-2 border-green-700"
              onClick={() => {
  if (!user) {
    setShowLoginPopup(true);
  } else {
    router.push(`/turf/${turf.id}/book`);
  }
}}>
                Check Slot Availability
              </button>
            </div>

            {/* SPORTS */}
            <div>
              <h1 className="text-xl font-semibold mb-7">
                Sports
              </h1>

              <div className="flex gap-15 flex-wrap">
  {sports.map((s, i) => {
    const sport = (s || "").toLowerCase(); // ✅ FIX

    const iconMap: Record<string, string> = {
      football: "/icons/football.png",
      cricket: "/icons/cricket.png",
      badminton: "/icons/badminton.png",
      volleyball: "/icons/volleyball.png",
    };

    return (
      <div key={i} className="text-center">
        <img
          src={iconMap[sport] || "/icons/sport.png"}
          className="w-8 h-8 mx-auto"
        />
        <p className="text-sm mt-1 capitalize">{sport}</p>
      </div>
    );
  })}
</div>
            </div>

            {/* AMENITIES */}
            <div>
              <h2 className="text-xl font-semibold mb-7">
                Amenities
              </h2>

              <div className="flex gap-15 flex-wrap">
                {amenities.map((a , i) => (
                  <div key={i} className="text-center">
                    <img
                      src={a.icon}
                      className="w-8 h-8 mx-auto"
                    />
                    <p className="text-sm mt-1">{a.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= REVIEWS (UPDATED) ================= */}
            <div>
              <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-3 ">
                Reviews  
              </h2>
              <p className=" pr-7"><span className="bg-yellow-200 rounded-xl pl-2 pr-3 py-1 mr-1">⭐  {avg.toFixed(1)}</span>  ({turf.reviews?.length || 0})</p>
              </div>

              <div className="flex gap-4 overflow-x-auto">

                {reviews.map((r, i) => {
                  const imgs = r.image_urls || [];

                  return (
                    <div
                      key={i}
                      className="min-w-[220px] border rounded-xl p-3 flex flex-col justify-between"
                    >
                      {/* NAME */}
                      <p className="text-sm font-semibold mb-2">
                        {r.profiles?.full_name || "User"}
                      </p>

                      {/* RATING */}
                      <p className="text-xs text-yellow-600 mb-1">
                        ⭐ {r.rating}
                      </p>

                      {/* IMAGES */}
                      {imgs.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {imgs.slice(0, 2).map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              className="w-14 h-14 object-cover rounded"
                            />
                          ))}

                          {imgs.length > 2 && (
                            <div className="w-14 h-14 flex items-center justify-center text-xs bg-gray-200 rounded">
                              +{imgs.length - 2}
                            </div>
                          )}
                        </div>
                      )}

                      {/* COMMENT */}
                      <p className="text-xs text-gray-600 line-clamp-4">
                        {r.comment || "No review"}
                      </p>

                      {/* VIEW MORE */}
                      <div className="text-right text-xs text-gray-400 mt-2">
                        View more
                      </div>
                    </div>
                  );
                })}

                <div className="min-w-[80px] flex items-center justify-center text-xl">
                  →
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
      </div>

      {showLoginPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    
    <div className="bg-white rounded-2xl p-6 w-[85%] max-w-sm text-center">
      
      <h2 className="text-lg font-semibold text-black">
        Login Required
      </h2>

      <p className="text-sm text-gray-600 mt-2">
        Please login to book your slot
      </p>

      <div className="flex gap-3 mt-5">
        
        {/* CANCEL */}
        <button
          onClick={() => setShowLoginPopup(false)}
          className="flex-1 border rounded-full py-2"
        >
          Cancel
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="flex-1 bg-green-600 text-white rounded-full py-2"
        >
          Login
        </button>

      </div>
    </div>

  </div>
)}

    </div>
  );
}