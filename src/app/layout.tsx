import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false
});

export const metadata: Metadata = {
  title: "MegaYours Explorer",
  description: "Explore your NFTs and transfers across blockchains",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    chain: string;
  };
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  const className = `${geistSans.variable} ${geistMono.variable} antialiased`;
  
  return (
    <html lang="en" className={className}>
      <body>
        <ClientProviders initialBlockchainRid={params.chain}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
