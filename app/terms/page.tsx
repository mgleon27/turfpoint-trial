 "use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-[900px] mx-auto">

        <div className="flex items-center gap-3 mb-7">
          <img onClick={() => router.back()} src="/icons/back.png" className="h-5" />
          <p className="text-2xl font-bold font-sans text-black ">Terms and Conditions</p>
        </div>


        <Section title="1. Platform Overview">
          Turfia is an online platform that connects users with turf owners for booking sports facilities and slots on turf.
        </Section>

        <Section title="2. User Responsibilities">
          <ul className="list-disc ml-6">
            <li>Provide accurate booking details</li>
            <li>Follow turf rules</li>
            <li>Responsible for damages</li>
          </ul>
        </Section>

        <Section title="3. Booking Policy">
          <ul className="list-disc ml-6">
            <li>Booking are confirmed only after payment successfull</li>
            <li>Late arrival may reduce play time</li>
          </ul>
        </Section>

        <Section title="4. Payments">
          Payments are processed securely via third-party gateways. Turfia does not store your card details.
        </Section>

        <Section title="5. Cancellation & Refund">
          No refund are available after payment made.
        </Section>

        <Section title="6. Platform Role">
          Turfia only connects users and turf owners.
        </Section>

        <Section title="7. Prohibited Activities">
          Fraud, misuse, illegal activity are strictly prohibited.
        </Section>

        <Section title="8. Changes to Terms">
          Turfia may update terms anytime.Users will be notified if any changes are made throught Email or messages.
        </Section>

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