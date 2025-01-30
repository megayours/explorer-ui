'use client'

import { ConnectButton } from "./connect-button";
import { ChainSwitcher } from "./chain-switcher";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-start">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              MegaYours Explorer
            </h1>
          </div>

          {/* Center - Chain Switcher */}
          <div className="flex-1 flex items-center justify-center">
            <ChainSwitcher isHeader={true} />
          </div>

          {/* Right - Connect Button */}
          <div className="flex-1 flex items-center justify-end">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
