"use client";

import { createContext, useContext, useState } from "react";

// ================= TYPES =================
type LocationType = {
  lat: number;
  lng: number;
};

type LocationContextType = {
  location: LocationType | null;
  city: string;
  setLocationData: (loc: LocationType, city: string) => void;
};

// ================= CONTEXT =================
const LocationContext = createContext<LocationContextType | null>(null);

// ================= SAFE STORAGE PARSER =================
function getStoredLocation() {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("user_location");
    if (!saved) return null;

    return JSON.parse(saved);
  } catch (error) {
    console.error("Error parsing location:", error);
    return null;
  }
}

// ================= PROVIDER =================
export function LocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ INITIAL LOAD (NO useEffect → NO ERROR)
  const stored = getStoredLocation();

  const [location, setLocation] = useState<LocationType | null>(
    stored?.coords || null
  );

  const [city, setCity] = useState<string>(
    stored?.city || "Nagercoil"
  );

  // ================= UPDATE FUNCTION =================
  const setLocationData = (loc: LocationType, cityName: string) => {
    setLocation(loc);
    setCity(cityName);

    try {
      localStorage.setItem(
        "user_location",
        JSON.stringify({
          coords: loc,
          city: cityName,
        })
      );
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  return (
    <LocationContext.Provider
      value={{ location, city, setLocationData }}
    >
      {children}
    </LocationContext.Provider>
  );
}

// ================= HOOK =================
export const useLocation = () => {
  const ctx = useContext(LocationContext);

  if (!ctx) {
    throw new Error("useLocation must be used inside LocationProvider");
  }

  return ctx;
};