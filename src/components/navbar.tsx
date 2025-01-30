'use client'

import Image from "next/image";
import { ConnectButton } from "./connect-button";
import { ChainSwitcher } from "./chain-switcher";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-[#f0f4f8]/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-start">
            <div className="relative h-12 w-48">
              <Image
                src="/megayours.png"
                alt="MegaYours Logo"
                fill
                sizes="(max-width: 768px) 120px, 192px"
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-2 text-lg font-medium text-foreground">| Explorer</span>
          </div>

          {/* Center - Chain Switcher */}
          <div className="flex-1 flex items-center justify-center">
            <ChainSwitcher isHeader={true} />
          </div>

          {/* Right - Connect Button */}
          <div className="flex-1 flex items-center justify-end my-3">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
