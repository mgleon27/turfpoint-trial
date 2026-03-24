"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Turf = {
  id: string;
  name: string;
  map_lat: number;
  map_lng: number;
};

export default function MapView({
  turfs,
  center,
  selectedTurfId,
  onMarkerClick,
}: {
  turfs: Turf[];
  center: { lat: number; lng: number } | null;
  selectedTurfId: string | null;
  onMarkerClick?: (id: string) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!center || !containerRef.current) return;

    // 🔥 REMOVE EXISTING MAP (KEY FIX)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView(
      [center.lat, center.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);

    // ✅ ADD MARKERS
    turfs.forEach((turf) => {
      const isSelected = turf.id === selectedTurfId;

      const marker = L.marker([turf.map_lat, turf.map_lng]).addTo(map);

      if (isSelected) {
        marker.setIcon(
          L.divIcon({
            html: `<div style="background:#22c55e;width:20px;height:20px;border-radius:50%"></div>`
          })
        );

        map.flyTo([turf.map_lat, turf.map_lng], 15);
      }

      marker.on("click", () => {
        onMarkerClick?.(turf.id);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [turfs, center, selectedTurfId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl"
    />
  );
}