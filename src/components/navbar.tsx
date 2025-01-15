'use client'

import { useChromia } from "@/lib/chromia-connect/chromia-context";
import { Button } from "./ui/button";
import { AuthButtons } from "./auth/auth-buttons";

export function Navbar() {
  const { chromiaSession } = useChromia();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          

          {/* Connect/Disconnect Button */}
          <div className="flex-1 flex items-center justify-center sm:justify-end">
            <AuthButtons isHeader={true} />
          </div>
        </div>
      </div>
    </nav>
  );
}
