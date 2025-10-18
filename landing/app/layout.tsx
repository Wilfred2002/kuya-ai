import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kuya AI - AI native to group conversations",
  description: "An AI that remembers, understands context, and feels like a natural part of your team. Join the waitlist for early access.",
  keywords: ["AI", "group chat", "Discord", "Slack", "conversation AI", "team collaboration"],
  openGraph: {
    title: "Kuya AI - AI native to group conversations",
    description: "An AI that remembers, understands context, and feels like a natural part of your team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuya AI - AI native to group conversations",
    description: "An AI that remembers, understands context, and feels like a natural part of your team.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
