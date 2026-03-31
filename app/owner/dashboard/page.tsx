"use client";

import OwnerGuard from "@/components/OwnerGuard";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();

  return (
    <OwnerGuard>
      <div className="p-6">

        <h1 className="text-2xl font-semibold mb-6">
          Owner Dashboard
        </h1>

        <div className="grid grid-cols-2 gap-4">

          <Card title="My Turfs" onClick={() => router.push("/owner/turfs")} />
          <Card title="Bookings" onClick={() => router.push("/owner/bookings")} />
          <Card title="Add Turf" onClick={() => router.push("/owner/add-turf")} />
          <Card title="Profile" onClick={() => router.push("/profile")} />

        </div>

      </div>
    </OwnerGuard>
  );
}

function Card({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow cursor-pointer text-center active:scale-95 transition"
    >
      <p className="font-semibold">{title}</p>
    </div>
  );
}