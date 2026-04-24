 "use client";

import { useRouter } from "next/navigation";

export default function RefundPage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-[900px] mx-auto">

        <div className="flex items-center gap-3 mb-7">
          <img onClick={() => router.back()} src="/icons/back.png" className="h-5" />
          <p className="text-2xl font-bold font-sans text-black ">Refund Policy</p>
        </div>

        <Section title="1. Cancellation by User">
          Users cannot cancel booking once the payment is completed and booking is done.
        </Section>

        <Section title="2. Refund Eligibility">
          No Refunds are not available after payment is made.
        </Section>

        <Section title="3. Turf Owner Responsibility">
          Turf owners cannot cancel booking and free the slot made by users.
        </Section>

        <Section title="4. Platform Role">
          Turfia acts only as a platform and is not liable for disputes.
        </Section>

        <Section title="5. Failed Payments">
          Failed bookings with deducted money will be refunded automatically.
        </Section>

        <p className="mt-6 text-gray-700">
          For queries: <strong>admin.turfia@gmail.com</strong>
        </p>

      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}