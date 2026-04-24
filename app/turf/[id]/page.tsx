"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";

import UserOnly from"@/components/UserOnly";

import {useUser} from "@/lib/userContext";

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
  area_sqm?: number;

  turf_features?: {
  feature_id: string;
  features: {
    name: string;
    icon_url: string | null;
  } | null;
}[];

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


  const [isFav, setIsFav] = useState<boolean | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [favToast, setFavToast] = useState("");



  const { user } = useUser();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const load = async () => {
  try {
    const { data, error } = await supabase
      .from("turfs")
      .select(`
  *,
  reviews ( rating ),
  turf_sports ( sports ( name ) ),
  turf_features (
    feature_id,
    features!fk_feature ( name, icon_url )
  )
`)
      .eq("id", id)
      .single();

    if (error) {
      console.error("TURF LOAD ERROR:", error);
      return;
    }

    if (!data) {
      console.error("No turf found");
      return;
    }

    setTurf(data);

    // IMAGES
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

    // REVIEWS
    const { data: reviewData } = await supabase
      .from("reviews")
      .select(`*, profiles ( full_name )`)
      .eq("turf_id", id)
      .limit(7);

    if (reviewData) setReviews(reviewData);

  } catch (err) {
    console.error("LOAD FAILED:", err);
  }
};

    load();
  }, [id]);




  useEffect(() => {
  if (!user || !turf) return;

  const checkFav = async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .eq("turf_id", turf.id)
      .maybeSingle(); // ✅ IMPORTANT


    if (error) { 
      console.log(error);
      setIsFav(false);
      return;
    }

    setIsFav(!!data); // ✅ true if exists
  };

  checkFav();
}, [user, turf]);


  if (!turf) {
  return (
    <div className="min-h-screen bg-white animate-pulse">

      {/* HEADER */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <div className="h-5 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* IMAGE */}
      <div className="px-4">
        <div className="w-full h-[220px] bg-gray-300 rounded-xl"></div>

        {/* THUMBNAILS */}
        <div className="flex gap-2 mt-2">
          {[1,2,3,4].map((_,i) => (
            <div key={i} className="w-16 h-14 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      {/* NAME + RATING */}
      <div className="px-4 mt-4 text-center">
        <div className="h-6 w-40 bg-gray-300 rounded mx-auto"></div>
        <div className="h-4 w-24 bg-gray-300 rounded mx-auto mt-2"></div>
      </div>

      {/* ADDRESS */}
      <div className="px-4 mt-3 flex justify-center">
        <div className="h-4 w-64 bg-gray-300 rounded"></div>
      </div>

      {/* PRICE */}
      <div className="px-4 mt-3 flex justify-center">
        <div className="h-5 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-4 mt-4 px-4">
        <div className="h-10 w-36 bg-gray-300 rounded-full"></div>
        <div className="h-10 w-36 bg-gray-300 rounded-full"></div>
      </div>

      {/* DETAILS */}
      <div className="px-4 mt-6 space-y-3">
        <div className="h-4 w-48 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* SPORTS */}
      <div className="px-4 mt-6">
        <div className="h-5 w-40 bg-gray-300 rounded mb-4"></div>

        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map((_,i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* AMENITIES */}
      <div className="px-4 mt-6">
        <div className="h-5 w-40 bg-gray-300 rounded mb-4"></div>

        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((_,i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 bg-gray-300 rounded mx-auto"></div>
              <div className="h-3 w-16 bg-gray-300 rounded mx-auto mt-2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="px-4 mt-6">
        <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>

        <div className="flex gap-4">
          {[1,2,3].map((_,i) => (
            <div key={i} className="w-[200px] h-[160px] bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>

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

  const sports = Array.from(
  new Set(
    (turf.turf_sports?.map((s) =>
      s.sports?.name?.toLowerCase().trim()
    ) || []).filter(Boolean)
  )
);



  const amenities: Amenity[] = Array.from(
  new Map(
    (turf.turf_features || [])
      .filter(f => f.features) // remove null relations
      .map(f => [
        f.features!.name,
        {
          label: f.features!.name,
          icon: f.features!.icon_url || "/icons/feature.png",
        }
      ])
  ).values()
);


const toggleFavourite = async () => {
  if (!user) {
    setShowLoginPopup(true);
    return;
  }

  if (favLoading || !turf) return;

  setFavLoading(true);

  try {
    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("turf_id", turf.id);

      setIsFav(false);
      setFavToast("Removed from favourites"); // ✅ here
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        turf_id: turf.id,
      });

      setIsFav(true);
      setFavToast("Added to favourites"); // ✅ here
    }

    setTimeout(() => setFavToast(""), 1500);

  } catch (err) {
    console.log(err);
  }

  setFavLoading(false);
};



const iconMap: Record<string, string> = {
  football: "/icons/football.png",
  cricket: "/icons/cricket.png",
  badminton: "/icons/badminton.png",
  volleyball: "/icons/volleyball.png",
};



  return (
    <div className="bg-white min-h-screen">

      {/* ================= MOBILE ================= */}
      <div className="md:hidden bg-white">

        
        <div className="px-4 py-4 bg-white">

          {/* BACK */}
          <div  className="flex gap-3 mb-4 items-center">
            <img src="/icons/back.png" className="w-4 h-4"
            onClick={() => router.back()} />
            <span className="text-xl text-black font-sans">Turf Details</span>
          </div>

          {/* IMAGE */}
          <img
  src={activeImg || "/turf.jpg"}
  onClick={() => setShowGallery(true)}
  className="w-full h-[220px] rounded-xl object-cover"
/>

          <div className="flex gap-2 mt-2 overflow-x-auto ">
            {images.map((img, i) => (
              <img key={i} src={img.image_url} onClick={() => setActiveImg(img.image_url)}
                className="w-16 h-14 rounded object-cover" />
            ))}
          </div>

          {/* NAME + RATING */}
          <div className="relative mt-4">

              {/* CENTER NAME */}
              <h1 className="text-2xl text-black font-semibold text-center font-sans">
                 {turf.name}
              </h1>

              {/* RIGHT SIDE RATING */}
              <div className="absolute right-0 top-0 text-sm flex items-center gap-2 mr-2">
                  <div className="bg-yellow-500 text-white rounded-md pl-2 pr-3 py-0.5 flex flex-row items-center text-center font-sans">
                  <img src="/icons/star-white.png" className="w-4 h-4" /><p className="mt-0 pl-1"> {avg.toFixed(1)}</p>
                  </div>
                 <span className="text-lg text-center text-black font-sans">({turf.reviews?.length || 0})</span>
              </div>

</div>

          <div className="flex justify-center mt-3">
          <p className="text-[16px] text-gray-800 font-sans">{turf.address}</p>
          </div>

          <div className="flex justify-center mt-2">
          <h2 className="text-lg text-black font-semibold mt-2 font-sans">
  ₹{turf.min_price ?? turf.price}
  {(turf.min_price !== turf.max_price) && ` - ₹${turf.max_price}`}
  <span className="text-gray-800 font-medium text-base font-sans">
    / 60 minutes
  </span>
</h2>
          </div>




          <div className="flex justify-center gap-4">

          <button onClick={openMap}
           className="bg-white border-2 border-green-700 px-4 py-1 text-base text-green-900 font-medium font-sans rounded-full mt-3 
           mb-1 flex items-center gap-2 whitespace-nowrap">
            <img src="/icons/direction.png" className="w-5 h-5" />
            Locate on Map
          </button>



          <button
  onClick={toggleFavourite}
  disabled={isFav === null || favLoading}
  className={`px-4 py-1 font-sans text-base font-medium rounded-full mt-3 mb-1 flex items-center gap-2 whitespace-nowrap transition-all duration-200
  ${
    isFav === null
      ? "bg-gray-300 text-gray-500"
      : isFav
      ? "bg-red-500 text-white"
      : "bg-green-600 text-white"
  }`}
>
  {isFav === null ? (
    "Login to Save"
  ) : (
    <>
      <img src="/icons/heart.png" className="w-5 h-5" />
      {isFav ? "Favorites" : "Add to Favourite"}
    </>
  )}
</button>  




          </div>




          {/* DETAILS */}
          <div className="mt-4 space-y-2 text-sm">

            <div className="flex justify-between pt-1">
                 <div className="flex gap-3 text-base font-sans text-black font-medium ml-3">
    
                   <img src="/icons/area.png" className="w-5 h-5" />
                   {turf.area_sqm} sq.m

                 </div>


                  <div className="flex gap-2 text-base font-sans text-black font-medium pr-6">
                   <img src="/icons/location.png" className="w-5 h-5" />
                   {turf.locality}
                 </div>
            </div>
           
          </div>

          <hr className="my-4" />

          {/* SPORTS */}
          <h2 className="font-semibold font-sans text-black text-xl pb-6 pt-1">
            Sports Provided
          </h2>

          <div className="grid grid-cols-2 gap-5 ml-5">
            
            {sports.map((s, i) => {
  const sport = (s || "").trim().toLowerCase(); // ✅ FIX

  return (
    <div key={i} className="flex gap-2 items-center text-black text-base">
      <img
        src={iconMap[sport] || "/icons/sport.png"}
        className="w-6 h-6"
      />
      {sport.charAt(0).toUpperCase() + sport.slice(1)}
    </div>
  );
})}
          </div>

          <hr className="my-4 mt-7" />

          {/* AMENITIES */}
          <h2 className="font-semibold font-sans text-black text-xl pb-6 pt-1">
            Amenities
          </h2>

          <div className="grid grid-cols-4 gap-4 font-sans mb-10">
            {amenities.length === 0 ? (
  <p className="text-gray-400 text-sm text-center col-span-full">
    No amenities mentioned
  </p>
) : (
  amenities.map((a, i) => (
    <div key={i} className="text-center">
      <img src={a.icon} className="w-8 h-8 mx-auto" />
      <p className="text-sm mt-1">{a.label}</p>
    </div>
  ))
)}
          </div>

          {/* REVIEWS */}
<div className="flex justify-between items-center mt-6">
  <h2 className="font-semibold font-sans text-black text-xl">Reviews</h2>

  <div className="items-center flex flex-row">
    <span className="bg-yellow-500 rounded-md font-sans pl-2 pr-3 py-0.5 mr-2 text-white flex flex-row items-center text-center font-sans">
      <img src="/icons/star-white.png" className="h-5 pr-1" />{avg.toFixed(1)}
    </span>
    <span className="text-lg text-black font-sans">
      ( {turf.reviews?.length || 0} )</span>
  </div>
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
        <p className="text-sm text-black font-semibold font-sans">
          {r.profiles?.full_name || "User"}
        </p>

        {/* IMAGES */}
        {imgs.length > 0 && (
          <div className="flex gap-2 mt-2 font-sans">
            {imgs.slice(0, 2).map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="w-14 h-14 object-cover rounded"
              />
            ))}

            {imgs.length > 2 && (
              <div className="w-14 h-14 font-sans flex items-center justify-center text-black text-xs bg-gray-200 rounded">
                +{imgs.length - 2}
              </div>
            )}
          </div>
        )}

        {/* COMMENT */}
        <p className="text-xs font-sans text-gray-700 line-clamp-3 mt-2">
          {r.comment || "No review"}
        </p>

        {/* VIEW MORE */}
        <div className="text-right text-xs text-gray-400 font-sans">
          
        </div>
      </div>
    );
  })}

  {/* VIEW ALL CARD */}
  <div className="min-w-[80px] flex items-center font-sans justify-center text-black text-xl">
    →
  </div>

</div>

          <button className="w-full bg-green-600 text-lg font-sans text-white py-3 rounded-full mt-5"
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

                <div className="flex px-3 py-0.5 rounded-lg items-center bg-yellow-500 gap-1" >
                  <img src="/icons/star-white.png" className="h-5" /> 
                  <p className="text-white font-sans text-base">
                  {avg.toFixed(1)} 
                  </p>

                </div>
                <p className="text-gray-600 font-sans text-base -ml-2">({turf.reviews?.length || 0 }) Reviews</p>

              </div>

              <div className="text-base text-black font-sans flex flex-row items-center text-center gap-1">
                <img src={"/icons/locationtop.png"} className="h-4.5" /> 
                {turf.locality}
                </div>
            </div>

            {/* ADDRESS */}
            <div className="text-gray-600 font-sans font-normal text-base -mt-1">
            {turf.address.split(",").map((line, i) => (
            <div key={i}>{line.trim()}</div>
))}
    </div>
            {/* TIME */}
            <div className="flex items-center gap-2 text-base text-black font-sans text-black font-medium">
   <img src="/icons/area.png" className="w-6 h-6" />
   {turf.area_sqm} sq.m
</div>


            {/* PRICE */}
            <div className="flex justify-between items-center font-sans">
              
              <h2 className="text-lg text-black font-semibold mt-2 font-sans">
  ₹{turf.min_price ?? turf.price}
  {(turf.min_price !== turf.max_price) && ` - ₹${turf.max_price}`}
  <span className="text-gray-800 font-medium text-base font-sans">
    / 60 minutes
  </span>
</h2>

              <button className="bg-green-600 px-5 py-2 rounded-full text-white font-medium font-sans border-2 border-green-700"
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




            <div className="flex gap-7">

          <button onClick={openMap}
           className="bg-white border-2 border-green-700 px-4 py-0.5 text-base text-green-900 font-medium font-sans rounded-full mt-3 mb-1 flex whitespace-nowrap items-center gap-2">
            <img src="/icons/direction.png" className="w-5 h-5" />
            Locate on Map
          </button>



          <button
  onClick={toggleFavourite}
  disabled={isFav === null || favLoading}
  className={`px-4 py-0.5 font-sans text-base font-medium rounded-full mt-3 mb-1 flex whitespace-nowrap items-center gap-2
  ${
    isFav === null
      ? "bg-gray-300 text-gray-500"
      : isFav
      ? "bg-red-500 text-white"
      : "bg-green-600 text-white"
  }`}
>
  {isFav === null ? (
    "Login to Save"
  ) : (
    <>
      <img src="/icons/heart.png" className="w-5 h-5" />
      {isFav ? "Favorites" : "Add to Favourite"}
    </>
  )}
</button>  
          </div>





            {/* SPORTS */}
            <div>
              <h1 className="text-xl font-sans text-black font-semibold mb-7">
                Sports
              </h1>

              <div className="flex gap-15 flex-wrap">
  {sports.map((s, i) => {
    const sport = (s || "").trim().toLowerCase(); // ✅ FIX

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
              <h2 className="text-xl font-sans text-black font-semibold mb-7">
                Amenities
              </h2>

              <div className="flex gap-15 flex-wrap">
                {amenities.length === 0 ? (
  <p className="text-gray-400 text-sm text-center col-span-full">
    No amenities mentioned 
  </p>
) : (amenities.map((a , i) => (
                  <div key={i} className="text-center">
                    <img
                      src={a.icon}
                      className="w-8 h-8 mx-auto"
                    />
                    <p className="text-sm mt-1">{a.label}</p>
                  </div>
                )))}
              </div>
            </div>


            {/* ================= REVIEWS (UPDATED) ================= */}
            <div>
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-sans text-black font-semibold mb-5 ">
                  Reviews  
                 </h2>


                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-500 rounded-lg px-2 py-0.5 flex items-center gap-1" >
                      <img src="/icons/star-white.png" className="h-5" />
                      <p className="text-white font-sans text-sm">{avg.toFixed(1)}</p>
                    </div>

                    <p className="text-gray-800 font-sans text-base">({turf.reviews?.length || 0})</p>

                  </div>


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
                      <p className="text-sm font-semibold font-sans mb-2">
                        {r.profiles?.full_name || "User"}
                      </p>

                      {/* RATING */}
                      <p className="text-xs font-sans text-yellow-600 mb-1">
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
                            <div className="w-14 h-14 flex items-center justify-center font-sans text-xs bg-gray-200 rounded">
                              +{imgs.length - 2}
                            </div>
                          )}
                        </div>
                      )}

                      {/* COMMENT */}
                      <p className="text-xs text-gray-600 font-sans line-clamp-4">
                        {r.comment || "No review"}
                      </p>

                      {/* VIEW MORE */}
                    
                    </div>
                  );
                })}

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
      
      <h2 className="text-lg font-semibold text-black font-sans">
        Login Required
      </h2>

      <p className="text-sm text-gray-600 mt-2 font-sans">
        Please login to book your slot
      </p>

      <div className="flex gap-3 mt-5">
        
        {/* CANCEL */}
        <button
          onClick={() => setShowLoginPopup(false)}
          className="flex-1 border border-gray-600 rounded-full py-2 font-sans text-black shadow-md/20"
        >
          Cancel
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="flex-1 bg-green-600 text-white rounded-full py-2 font-sans shadow-md/20"
        >
          Login
        </button>

      </div>
    </div>

  </div>
)}




{showGallery && (
  <div
  className="fixed inset-0 bg-black/90 z-50 flex flex-col"
  onClick={() => setShowGallery(false)}
>

    {/* CLOSE */}
    <button
      onClick={() => setShowGallery(false)}
      className="text-white text-lg p-4 text-left"
    >
      ✕ Close
    </button>

    {/* IMAGE */}
    <div className="flex-1 flex items-center justify-center">
      <img src={activeImg} 
      onClick={(e) => e.stopPropagation()}
      className="max-h-[80%]" />
    </div>

    {/* THUMBNAILS */}
    <div className="flex gap-2 p-3 overflow-x-auto">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.image_url}
          onClick={() => setActiveImg(img.image_url)}
          className="w-16 h-14 rounded object-cover"
        />
      ))}
    </div>

  </div>
)}



{favToast && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm">
    {favToast}
  </div>
)}



    </div>
  );
}