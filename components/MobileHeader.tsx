"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import useMounted from "@/lib/useMounted";

import { useLocation } from "@/lib/locationContext"; // ✅ ADD

type Props = {
  setShowLocationModal: (val: boolean) => void; // ✅ ADD
};

export default function MobileHeader({ setShowLocationModal }: Props) {
  const router = useRouter();
  const mounted = useMounted();
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const { city } = useLocation(); // ✅ GET CITY

  return (
    <div className="bg-white px-2 py-2 sticky top-0 z-50  border-b-1 border-gray-300  ">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">

        {/* LOGO + LOCATION */}
        <div className="flex flex-col pl-1">
          <img src="/logo.png" className="h-9" />

          {/* 🔥 CLICKABLE LOCATION */}
          <span
            onClick={() => setShowLocationModal(true)}
            className="text-sm text-gray-700 font-medium cursor-pointer flex pt-0.2 font-sans"
          >
            <img src="/icons/locationtop.png" className="h-4 pr-0.5" /> {mounted ? city : "..." } ›
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5 pr-5">

          <button className="bg-green-500 text-white px-4 py-2 rounded text-xs font-sans">
            Get App
          </button>

          <Search
            size={23}
            onClick={() => setShowSearch(!showSearch)}
            className="cursor-pointer stroke-black"
          />
        </div>
      </div>

      {/* SEARCH BAR */}
      {showSearch && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="mt-3 w-full p-2 rounded bg-gray-100 outline-none font-sans"
        />
      )}
    </div>
  );
}