'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Loader2, Wallet } from 'lucide-react';

interface ConnectButtonProps {
  isMobile?: boolean;
}

export function ConnectButton({ isMobile }: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium transition-all duration-300
          text-sm shadow-sm whitespace-nowrap
          ${isMobile 
            ? 'w-full px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200' 
            : 'px-3 sm:px-6 py-2 sm:py-2.5 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground'
          }
        `}
      >
        {isMobile ? (
          <div className="w-full flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              <span>Disconnect Wallet</span>
            </div>
            <span className="text-xs text-red-500/80">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        ) : (
          <>
            <span className="hidden sm:inline">Disconnect</span>
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap
        ${isMobile 
          ? 'w-full px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-base' 
          : 'px-4 sm:px-8 py-2 sm:py-3 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base sm:text-xl'
        }
      `}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          {isMobile ? (
            <span>Connecting...</span>
          ) : (
            <>
              <span className="hidden sm:inline">Connecting...</span>
              <span className="sm:hidden">...</span>
            </>
          )}
        </>
      ) : (
        <>
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </div>
          ) : (
            <>
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </>
          )}
        </>
      )}
    </button>
  );
} 