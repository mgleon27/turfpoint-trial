"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/userContext";
import { useLocation } from "@/lib/locationContext";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  setShowLocationModal: (val: boolean) => void;
};

export default function Header({
  search,
  setSearch,
  setShowLocationModal,
}: Props) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ current route

  const { user, profile } = useUser();
  const { city } = useLocation();

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="bg-white shadow">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* LOGO */}
          <img
            src="/logo.png"
            alt="logo"
            className="h-12 cursor-pointer"
            onClick={() => router.push("/")}
          />

          {/* SEARCH + LOCATION */}
          <div className="flex items-center w-[55%] gap-7">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Turf, Location..."
              className="w-full p-2 rounded-full bg-gray-100 px-4"
            />

            <button
              onClick={() => setShowLocationModal(true)}
              className="bg-gray-100 px-3 py-2 rounded-full text-sm whitespace-nowrap"
            >
              📍 {city}
            </button>
          </div>

          {/* PROFILE / LOGIN */}
          <div className="flex items-center gap-4">
            {user ? (
              <img
                src={profile?.avatar_url || "/profile.png"}
                className="w-10 h-10 rounded-full object-cover border cursor-pointer"
                onClick={() => router.push("/profile")}
              />
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-green-500 text-white px-5 py-1.5 rounded-full"
              >
                Log In
              </button>
            )}

            
          </div>

        </div>
      </div>

      {/* ================= NAV ================= */}
      <div className="bg-taupe-100 border-y">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex gap-6 text-sm">

          <NavItem label="Home" path="/" pathname={pathname} router={router} />
          <NavItem label="Nearby You" path="/nearby" pathname={pathname} router={router} />
          <NavItem label="Venues" path="/sports" pathname={pathname} router={router} />
          <NavItem label="All Turfs" path="/turfs" pathname={pathname} router={router} />
          <NavItem label="Bookings" path="/bookings" pathname={pathname} router={router} />
          <NavItem label="Favourites" path="/favourites" pathname={pathname} router={router} />
          <NavItem label="Profile" path="/profile" pathname={pathname} router={router} />

        </div>
      </div>
    </>
  );
}

// ================= NAV ITEM =================
function NavItem({
  label,
  path,
  pathname,
  router,
}: {
  label: string;
  path: string;
  pathname: string;
  router: AppRouterInstance;
}) {
  const isActive = pathname === path;

  return (
    <span
      onClick={() => router.push(path)}
      className={`cursor-pointer transition ${
        isActive
          ? "text-green-600 font-semibold border-b-2 border-green-700"
          : "text-black hover:text-green-600"
      }`}
    >
      {label}
    </span>
  );
}