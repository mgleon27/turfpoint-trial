"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
  const pathname = usePathname();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // 🔥 AUTO SCROLL TO ACTIVE TAB
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;

      const offset =
        active.offsetLeft -
        container.offsetWidth / 2 +
        active.offsetWidth / 2;

      container.scrollTo({
        left: offset,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-3 pt-3 bg-white  scroll-smooth snap-x snap-mandatory"
    >
      {items.map((item) => {
        const active =
          item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path);

        return (
          <div
            key={item.name}
            ref={active ? activeRef : null}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center text-xs min-w-[65px] cursor-pointer snap-center transition-all duration-200 ${
              active ? "text-green-600 scale-105" : "text-gray-500"
            } active:scale-90`} // 🔥 HAPTIC EFFECT
          >
            {/* ICON */}
            <div
              className={`text-xl transition-all duration-200 ${
                active ? "bg-green-100 p-2 rounded-full" : ""
              }`}
            >
              {item.icon}
            </div>

            {/* LABEL */}
            <span className="mt-1">{item.name}</span>

            {/* ACTIVE INDICATOR */}
           
          </div>
        );
      })}
    </div>
  );
}