"use client";

import { createContext, useContext, useState } from "react";

type LocationType = {
  lat: number;
  lng: number;
};

type LocationContextType = {
  location: LocationType | null;
  city: string;
  setLocationData: (loc: LocationType, city: string) => void;
};

const LocationContext = createContext<LocationContextType | null>(null);

// ✅ SAFE PARSER (avoids crash if JSON is invalid)
function getStoredLocation() {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("user_location");
    if (!saved) return null;

    return JSON.parse(saved);
  } catch (error) {
    console.error("Error parsing location from localStorage:", error);
    return null;
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // ✅ LOAD ONCE (no hydration issue)
  const stored = getStoredLocation();

  const [location, setLocation] = useState<LocationType | null>(
    stored?.coords || null
  );

  const [city, setCity] = useState<string>(
    stored?.city || "Nagercoil"
  );

  // ✅ UPDATE FUNCTION
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
    <LocationContext.Provider value={{ location, city, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
}

// ✅ CUSTOM HOOK
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside LocationProvider");
  }
  return ctx;
};