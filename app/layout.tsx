import type { Metadata } from "next";
import { Silkscreen, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Clawed's look: pixel display type (Silkscreen) + a mono body (IBM Plex Mono).
const display = Silkscreen({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const sans = IBM_Plex_Mono({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dream Architect — Walk back into your dreams",
  description:
    "A dream journal where entries are walkable 3D worlds. Speak a dream; walk back into it. Your subconscious, mapped.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
