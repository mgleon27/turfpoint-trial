"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// ✅ NORMAL + ACTIVE ICONS
const items = [
  { name: "Home", icon: "/icons/home.png", activeIcon: "/icons/home-active.png", path: "/" },
  { name: "Nearby", icon: "/icons/nearby.png", activeIcon: "/icons/nearby-active.png", path: "/nearby" },
  { name: "Sports", icon: "/icons/sports.png", activeIcon: "/icons/sports-active.png", path: "/sports" },
  { name: "All Turfs", icon: "/icons/turfs.png", activeIcon: "/icons/turfs-active.png", path: "/turfs" },
  { name: "Bookings", icon: "/icons/bookings.png", activeIcon: "/icons/bookings-active.png", path: "/bookings" },
  { name: "Favourites", icon: "/icons/favourites.png", activeIcon: "/icons/favourites-active.png", path: "/favourites" },
  { name: "Profile", icon: "/icons/profile.png", activeIcon: "/icons/profile-active.png", path: "/profile" },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // 🔥 AUTO SCROLL (UNCHANGED)
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
      className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-2 pt-3 bg-white snap-x snap-mandatory"
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
            className={`flex flex-col items-center text-xs min-w-[60px] font-medium font-sans cursor-pointer snap-center transition-all duration-200 ${
              active ? "text-black scale-110" : "text-gray-600"
            } active:scale-90`}
          >

            {/* 🔥 ICON WITH GLOW */}
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                active
                  ? ""
                  : ""
              }`}
            >
              <img
                src={active ? item.activeIcon : item.icon}
                className="h-4.5 w-4.5 transition-all duration-200"
              />
            </div>

            {/* LABEL */}
            <span className="mt-1 font-medium">
              {item.name}
            </span>

          </div>
        );
      })}
    </div>
  );
}