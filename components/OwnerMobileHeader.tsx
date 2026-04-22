"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useUser } from "@/lib/userContext";

export default function OwnerMobileHeader() {
  const router = useRouter();

  const { profile } = useUser();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white px-3 py-2 sticky top-0 z-50 border-b border-gray-300">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">


       <div className="flex items-center">
        {/* LOGO */}
        <img
                src={profile?.avatar_url || "/profile.png"}
                onError={(e) => (e.currentTarget.src = "/profile.png")}
                className="w-11 h-11 rounded-full object-cover border border-gray-400 ml-2"
              />



          <div className="ml-3">
            <p className="text-[11px]/4 font-sans text-gray-500 -mt-1.5">Welcome</p>
            <p className="font-medium text-black font-sans text-lg/4 capitalize">
              {profile?.full_name}
            </p>
          </div>
       </div>  




        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH ICON */}
          <div className=" flex bg-gray-100 gap-5 px-4 py-1 rounded-full grid grid-flow-col justify-between items-center border border-gray-200 shadow-xs">



            <p className="font-sans font-normal text-gray-700 text-base">Search...</p>

            <Search
                  size={16}
                  onClick={() => setShowSearch(!showSearch)}
                  className="cursor-pointer stroke-black" 
            />
            

          </div>

        

          <div className=" rounded-full  mr-1.5 ml-1">
            <img src="/icons/bell-black.png" className="h-5" />
          </div>

        </div>

      </div>

      {/* SEARCH BAR */}
      {showSearch && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search turfs, bookings..."
          className="mt-3 w-full p-2 rounded bg-gray-100 outline-none font-sans text-sm"
        />
      )}
    </div>
  );
}