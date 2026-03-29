"use client";

import {
  GoogleMap,
  Marker,
  Circle,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useRef } from "react";

export default function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"], // 🔥 REQUIRED
  });

  const defaultCenter = {
    lat: 8.1833,
    lng: 77.4119,
  };

  // 🔥 CURRENT LOCATION
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

        setPosition({ lat, lng });
        setAccuracy(pos.coords.accuracy);
        onSelect(lat, lng);

        setLoadingLocation(false);
      },
      () => {
        alert("Unable to fetch location");
        setLoadingLocation(false);
      }
    );
  };

  // 🔥 PLACE SEARCH SELECT
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPosition({ lat, lng });
    setAccuracy(0);
    onSelect(lat, lng);
  };

  if (!isLoaded) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-3">

      {/* 🔍 SEARCH BAR */}
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Search location..."
          className="w-full p-2 border rounded-lg outline-none"
        />
      </Autocomplete>

      {/* 📍 CURRENT LOCATION BUTTON */}
      <button
        onClick={getCurrentLocation}
        className="w-full bg-green-500 text-white py-2 rounded-lg text-sm"
      >
        {loadingLocation ? "Fetching location..." : "Use My Current Location"}
      </button>

      {/* 🗺️ MAP */}
      <GoogleMap
        center={position || defaultCenter}
        zoom={13}
        mapContainerClassName="h-[300px] w-full rounded-lg"
        onClick={(e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (!lat || !lng) return;

          setPosition({ lat, lng });
          setAccuracy(0);
          onSelect(lat, lng);
        }}
      >
        {position && (
          <>
            {/* 🔵 Accuracy Circle */}
            {accuracy > 0 && (
              <Circle
                center={position}
                radius={accuracy}
                options={{
                  fillColor: "#3b82f6",
                  fillOpacity: 0.2,
                  strokeOpacity: 0,
                }}
              />
            )}

            {/* 🔵 Blue Dot */}
            <Marker
              position={position}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
}