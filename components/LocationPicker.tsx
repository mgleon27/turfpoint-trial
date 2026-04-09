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

  // 🚀 INIT MAP
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: defaultCenter,
      zoom: 13,
    });

    // CLICK SELECT
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // remove old marker
      markerRef.current?.remove();

      // add new marker
      markerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      onSelect(lat, lng);
    });
  }, []);

  // 📍 CURRENT LOCATION
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

        mapRef.current?.flyTo({
          center: [lng, lat] as [number, number],
          zoom: 15,
        });

        markerRef.current?.remove();

        markerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

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