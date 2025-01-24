"use client";

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { ConnectButton } from '@/components/connect-button';
import { ChainSwitcher } from '@/components/chain-switcher';
import { useChain } from '@/lib/chain-switcher/chain-context';
import dapps from '@/config/dapps';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { selectedChain, switchChain } = useChain();

  useEffect(() => {
    // If no chain is selected, select the first one
    if (!selectedChain && dapps.length > 0) {
      void switchChain(dapps[0]);
    }
  }, [selectedChain, switchChain]);

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-black via-zinc-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Welcome to Gamma UI
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Connect your wallet to view and manage your NFT collection
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <ChainSwitcher />
          <ConnectButton />
        </div>
      </div>
    </main>
  );
}
