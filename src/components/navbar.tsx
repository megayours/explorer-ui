'use client'

import Image from "next/image";
import { ConnectButton } from "./connect-button";
import { ChainSwitcher } from "./chain-switcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-[#f0f4f8]/50 backdrop-blur-xl">
      <div className="mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
          {/* Logo Section */}
          <div className="flex items-center min-w-0">
            <div className="relative h-7 w-28 sm:h-10 sm:w-40">
              <Image
                src="/megayours.png"
                alt="MegaYours Logo"
                fill
                sizes="(max-width: 640px) 112px, 160px"
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-1.5 sm:ml-2 text-sm sm:text-lg font-medium text-foreground whitespace-nowrap">| Explorer</span>
          </div>

          {/* Center - Chain Switcher */}
          <div className="flex-1 flex items-center justify-center">
            <ChainSwitcher isHeader={true} />
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden sm:flex items-center">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 -mr-2 hover:bg-background/80 rounded-lg"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-[64px] z-50 w-72 h-[calc(100vh-64px)] bg-background border-l border-border sm:hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-text-secondary">Account</h3>
                <ConnectButton isMobile />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
