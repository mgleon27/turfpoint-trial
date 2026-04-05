"use client";

import OwnerOnly from "@/components/OwnerOnly";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OwnerOnly>
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        

        {/* MAIN */}
        <div className="flex-1 bg-gray-100">
          {children}
        </div>

      </div>
    </OwnerOnly>
  );
}