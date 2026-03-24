"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useLocation } from "@/lib/locationContext"; // ✅ ADD

type Props = {
  setShowLocationModal: (val: boolean) => void; // ✅ ADD
};

export default function MobileHeader({ setShowLocationModal }: Props) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const { city } = useLocation(); // ✅ GET CITY

  return (
    <div className="bg-white px-2 py-2 shadow-sm sticky top-0 z-50">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">

        {/* LOGO + LOCATION */}
        <div className="flex flex-col pl-1">
          <img src="/logo.png" className="h-9" />

          {/* 🔥 CLICKABLE LOCATION */}
          <span
            onClick={() => setShowLocationModal(true)}
            className="text-sm text-gray-700 font-medium pl-1 cursor-pointer flex items-center"
          >
            📍 {city} ›
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5 pr-5">

          <button className="bg-green-500 text-white px-4 py-2 rounded text-xs">
            Get App
          </button>

          <Search
            size={20}
            onClick={() => setShowSearch(!showSearch)}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* SEARCH BAR */}
      {showSearch && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="mt-3 w-full p-2 rounded bg-gray-100 outline-none"
        />
      )}
    </div>
  );
}