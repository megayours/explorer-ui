'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Loader2 } from 'lucide-react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5
          rounded-full font-medium transition-all duration-300
          bg-gradient-to-r from-purple-500 to-pink-600 
          hover:opacity-90 text-white shadow-lg shadow-purple-500/20
          text-sm"
      >
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      className="inline-flex items-center justify-center gap-2 px-8 py-3
        rounded-full font-medium transition-all duration-300
        bg-gradient-to-r from-purple-500 to-pink-600 
        hover:opacity-90 text-white shadow-lg shadow-purple-500/20
        text-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
} 