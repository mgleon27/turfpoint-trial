"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [loadingLocation, setLoadingLocation] = useState(false);

  const defaultCenter: [number, number] = [77.4119, 8.1833];

  // 🚀 INIT MAP (SAFE)
  useEffect(() => {
    if (!mapContainer.current) return; // ✅ prevent null crash
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: defaultCenter,
      zoom: 13, 
    });

    mapRef.current = map;

    // ✅ Wait for map to load before attaching events
    map.on("load", () => {
      map.on("click", (e) => {
        try {
          if (!e?.lngLat) return;

          const lng = e.lngLat.lng;
          const lat = e.lngLat.lat;

          markerRef.current?.remove();

          markerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
            .setLngLat([lng, lat])
            .addTo(map);

          onSelect(lat, lng);
        } catch (err) {
          console.error("Map click error:", err);
        }
      });
    });

    // ✅ CLEANUP (VERY IMPORTANT)
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 📍 CURRENT LOCATION (SAFE)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!mapRef.current) return;

        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
        });

        markerRef.current?.remove();

        markerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        onSelect(lat, lng);
        setLoadingLocation(false);
      },
      () => {
        alert("Unable to fetch location");
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* 📍 CURRENT LOCATION */}
      <button
        onClick={getCurrentLocation}
        className="w-full bg-green-500 text-white py-2 rounded-lg text-sm"
      >
        {loadingLocation ? "Fetching location..." : "Use My Current Location"}
      </button>

      {/* 🗺️ MAP */}
      <div
        ref={mapContainer}
        className="h-[300px] w-full rounded-lg"
      />
    </div>
  );
}