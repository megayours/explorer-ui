'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Loader2, Wallet } from 'lucide-react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 font-medium transition-all duration-300 text-sm shadow-sm whitespace-nowrap"
      >
        <div className="w-full flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            <span>Disconnect Wallet</span>
          </div>
          <span className="text-xs text-red-500/80 pl-5">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-medium transition-all duration-300 text-sm shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <div className="w-full flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Connecting...</span>
          </div>
          <span className="text-xs opacity-70 pl-5">Please wait</span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            <span>Connect Wallet</span>
          </div>
          <span className="text-xs opacity-70 pl-5">Click to connect</span>
        </div>
      )}
    </button>
  );
} 