"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function MobileHeader() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white px-4 py-3 shadow-sm">

      {/* TOP ROW */}
      <div className="flex items-center justify-between pb-1">

        {/* LOGO */}
        <div className="flex flex-col gap-1">
          <img src="/logo.png" className="h-8" />
          <span className="text-sm text-gray-500">📍Nagercoil</span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">
            Get App
          </button>

          <Search
            size={20}
            onClick={() => setShowSearch(!showSearch)}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* EXPAND SEARCH */}
      {showSearch && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="mt-3 w-full p-2 rounded bg-gray-100"
        />
      )}
    </div>
  );
}