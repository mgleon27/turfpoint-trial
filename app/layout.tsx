import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { LocationProvider } from "@/lib/locationContext";
import { UserProvider } from "@/lib/userContext";

// ✅ ADD THIS
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurfPoint",
  description: "Book turfs easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">

        <UserProvider>
          <LocationProvider>

            {/* ✅ MAIN CONTENT */}
            <main className="flex-grow">
              {children}
            </main>

            {/* ✅ GLOBAL FOOTER */}
            <Footer />

          </LocationProvider>
        </UserProvider>

        {/* Optional analytics */}
        <Analytics />

      </body>
    </html>
  );
}