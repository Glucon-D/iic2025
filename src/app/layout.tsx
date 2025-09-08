import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Krishi Officer - AI-Based Farmer Query Support",
  description:
    "AI-powered agricultural advisory system for farmers in Kerala. Get expert advice in Malayalam for crop diseases, weather decisions, and farming practices.",
  keywords:
    "agriculture, farming, Kerala, Malayalam, AI, crop diseases, farming advice",
  authors: [{ name: "Digital Krishi Officer Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider defaultTheme="system" storageKey="digital-krishi-theme">
          <div className="flex flex-col min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
