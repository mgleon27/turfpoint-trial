"use client";

import { createContext, useContext, useState, useEffect } from "react";

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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  
  const [state, setState] = useState<{
    location: LocationType | null;
    city: string;
  }>({
    location: null,
    city: "Select Location",
  });

  useEffect(() => {
  try {
    const saved = localStorage.getItem("user_location");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    setState((prev) => {
      // ✅ prevent unnecessary re-render
      if (
        prev.city === parsed.city &&
        JSON.stringify(prev.location) === JSON.stringify(parsed.coords)
      ) {
        return prev;
      }

      return {
        location: parsed.coords || null,
        city: parsed.city || "Select Location",
      };
    });

  } catch (error) {
    console.error("Error loading location:", error);
  }
}, []);
  const setLocationData = (loc: LocationType, cityName: string) => {
    setState({
      location: loc,
      city: cityName,
    });

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
      value={{
        location: state.location,
        city: state.city,
        setLocationData,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside LocationProvider");
  }
  return ctx;
};