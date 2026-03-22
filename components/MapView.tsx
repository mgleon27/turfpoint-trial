"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!center) return;

    const map = L.map("map").setView([center.lat, center.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

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

    return () => {
      map.remove();
    };
  }, [turfs, center, selectedTurfId]);

  return <div id="map" className="w-full h-full rounded-xl" />;
}