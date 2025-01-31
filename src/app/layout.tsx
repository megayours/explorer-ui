import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";
import { use } from "react";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MegaYours Explorer",
  description: "Explore your NFTs and transfers across blockchains",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    chain: string;
  }>;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  const { chain } = use(params);
  
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={[
        geistSans.variable,
        geistMono.variable,
        "antialiased",
        "light"
      ].join(" ")}
    >
      <head />
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground">
        <ClientProviders initialBlockchainRid={chain}>
          <Navbar />
          <Breadcrumbs />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
