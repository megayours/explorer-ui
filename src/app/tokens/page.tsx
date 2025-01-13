"use client";

import { TokenGrid } from "@/components/tokens/token-grid";
import { useChromiaAuth } from "@/lib/chromia-connect/hooks/use-chromia-auth";

export default function TokensPage() {
  const [state] = useChromiaAuth();

  if (!state.isConnected || state.authStatus !== "connected") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Tokens</h1>
          <p className="text-gray-400">
            Please connect your wallet and authenticate to view your tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Your Tokens</h1>
        </div>
        <TokenGrid />
      </div>
    </div>
  );
}
