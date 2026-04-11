"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import useMounted from "@/lib/useMounted";
import { useLocation } from "@/lib/locationContext";
import { supabase } from "@/lib/supabase"; // ✅ ADD

type Props = {
  setShowLocationModal: (val: boolean) => void;
};

// ✅ TYPE (safe)
type TurfSearch = {
  id: string;
  name: string;
  price: number;
  locality: string;
  image_url?: string;
};

export default function MobileHeader({ setShowLocationModal }: Props) {
  const router = useRouter();
  const mounted = useMounted();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const [results, setResults] = useState<TurfSearch[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { city } = useLocation();

  // 🔥 SEARCH LOGIC (debounced)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("turfs")
        .select("id,price, name, locality, image_url")
        .ilike("name", `%${search}%`)
        .limit(5);

      if (error) console.log(error);

      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // 🔥 CLICK RESULT
  const handleSelect = (id: string) => {
    setShowSearch(false);
    setSearch("");
    setResults([]);
    router.push(`/turf/${id}`);
  };

  return (
    <div className="bg-white px-2 py-1 sticky top-0 z-50 border-b-1 border-gray-300">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">

        {/* LOGO + LOCATION */}
        <div className="flex flex-col pl-1 gap-0.5">
          <img src="/logo.png" className="h-9" />

          <span
            onClick={() => setShowLocationModal(true)}
            className="text-sm text-gray-700 font-medium cursor-pointer flex pt-0.2 font-sans"
          >
            <img src="/icons/locationtop.png" className="h-4 pr-0.5" />
            {mounted ? city : "..."} ›
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5 pr-5">

          <button onClick={() => router.push("/download")}
          className="bg-green-500 text-white px-4 py-2 rounded text-xs font-sans">
            Get App
          </button>

          <Search
            size={23}
            onClick={() => {
              setShowSearch(!showSearch);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="cursor-pointer stroke-black"
          />
        </div>
      </div>

      {/* SEARCH BAR */}
      {showSearch && (
        <div className="mt-3 relative">

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 rounded bg-gray-100 outline-none font-sans font-medium text-gray-800 text-[15px]"
          />

          {/* 🔥 DROPDOWN */}
          {(search || loading) && (
            <div className="absolute top-11 left-0 w-full bg-white shadow-lg rounded-xl border z-50 max-h-60 overflow-y-auto">

              {/* LOADING */}
              {loading && (
                <p className="p-3 text-sm font-sans text-gray-500">Searching...</p>
              )}

              {/* RESULTS */}
              {!loading && results.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="flex gap-3 px-3 py-3 border-b last:border-none cursor-pointer hover:bg-gray-100"
                >
                  <img
                    src={t.image_url || "/turf.jpg"}
                    className="w-20 h-16 rounded object-cover"
                  />

                  <div className="flex flex-col w-70 pr-2">
                      <div className="flex justify-between">
                        <div className="text-lg font-medium font-sans text-black">{t.name}</div>
                        <div className="flex pt-1.5 "><img src="/icons/locationtop.png" className="h-4 " /><p className="text-sm/4 font-sans font-normal text-gray-500">{t.locality}</p></div>
                      </div>

                      <div>
                        <div className="text-base font-medium font-sans text-black">₹{t.price}<span className="text-gray-700"> /hr </span></div>

                      </div>
                  </div>
                  
                </div>
              ))}

              {/* NO RESULTS */}
              {!loading && search && results.length === 0 && (
                <p className="p-3 text-sm text-gray-500">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}