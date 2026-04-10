"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// ✅ OWNER NAV ITEMS
const items = [
  {
    name: "Home",
    icon: "/icons/home.png",
    activeIcon: "/icons/home-active.png",
    path: "/owner",
  },
  {
    name: "Turfs",
    icon: "/icons/turfs.png",
    activeIcon: "/icons/turfs-active.png",
    path: "/owner/turfs",
  },
  {
    name: "Bookings",
    icon: "/icons/bookings.png",
    activeIcon: "/icons/bookings-active.png",
    path: "/owner/bookings",
  },
  {
    name: "Analysis",
    icon: "/icons/analysis.png", // 🔥 add this icon
    activeIcon: "/icons/analysis-active.png",
    path: "/owner/analysis",
  },
  {
    name: "Account",
    icon: "/icons/profile.png",
    activeIcon: "/icons/profile-active.png",
    path: "/owner/account",
  },
];

export default function OwnerMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // 🔥 AUTO SCROLL
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
      className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-2 pt-4 bg-white snap-x snap-mandatory"
    >
      {items.map((item) => {
        const active =
          item.path === "/owner"
            ? pathname === "/owner"
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
            {/* ICON */}
            <div className="p-1 rounded-full">
              <img
                src={active ? item.activeIcon : item.icon}
                className="h-4.5 w-4.5"
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