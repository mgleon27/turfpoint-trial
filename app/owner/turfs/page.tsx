"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OwnerGuard from "@/components/OwnerGuard";
import { useUser } from "@/lib/userContext";

type Turf = {
  id: string;
  name: string;
  image_url?: string;
};

export default function OwnerTurfs() {
  const { user } = useUser();
  const [turfs, setTurfs] = useState<Turf[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("turfs")
        .select("*")
        .eq("owner_id", user?.id);

      if (data) setTurfs(data);
    };

    load();
  }, [user]);

  return (
    <OwnerGuard>
      <div className="p-6">

        <h1 className="text-xl font-semibold mb-4">My Turfs</h1>

        <div className="grid grid-cols-2 gap-4">
          {turfs.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow p-3">
              <img
                src={t.image_url || "/turf.jpg"}
                className="h-32 w-full object-cover rounded"
              />
              <p className="mt-2 font-medium">{t.name}</p>
            </div>
          ))}
        </div>

      </div>
    </OwnerGuard>
  );
}