"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

export default function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  function MapClick() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onSelect(lat, lng);
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={[8.1833, 77.4119]} // default Nagercoil
      zoom={13}
      className="h-[300px] w-full rounded-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClick />
      {position && <Marker position={position} />}
    </MapContainer>
  );
}