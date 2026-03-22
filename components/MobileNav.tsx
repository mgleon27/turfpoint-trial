"use client";

import { useRouter } from "next/navigation";

const items = [
  { name: "Home", icon: "🏠", path: "/" },
  { name: "Nearby", icon: "📍", path: "/" },
  { name: "Sports", icon: "🏏", path: "/sports" },
  { name: "All Turfs", icon: "🏟️", path: "/turfs" },
  { name: "Bookings", icon: "📋", path: "/bookings" },
  { name: "Favourites", icon: "❤️", path: "/favourites" },
  { name: "Profile", icon: "👤", path: "/profile" },
];

export default function MobileNav() {
  const router = useRouter();

  return (
    <div className="flex overflow-x-auto gap-6 px-4 py-3 bg-white">

      {items.map((item) => (
        <div
          key={item.name}
          onClick={() => router.push(item.path)}
          className="flex flex-col items-center text-sm min-w-[60px] cursor-pointer"
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.name}</span>
        </div>
      ))}

    </div>
  );
}