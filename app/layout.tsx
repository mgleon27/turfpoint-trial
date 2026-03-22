import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ EXISTING
import { LocationProvider } from "@/lib/locationContext";

// 🔥 NEW (ADD THIS)
import { UserProvider } from "@/lib/userContext";

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
      <body className="min-h-full flex flex-col">

        {/* 🔥 GLOBAL PROVIDERS */}
        <UserProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </UserProvider>

      </body>
    </html>
  );
}