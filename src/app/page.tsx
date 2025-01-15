"use client";

import { useRouter } from 'next/navigation';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useEffect } from 'react';
import { AuthButtons } from '@/components/auth/auth-buttons';
import { ChainSwitcher } from '@/components/chain-switcher';

export default function Home() {
  const router = useRouter();
  const { chromiaSession } = useChromia();

  useEffect(() => {
    if (chromiaSession) {
      router.push('/dashboard');
    }
  }, [chromiaSession, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-black via-zinc-900 to-black">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Welcome to Gamma UI
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Select a chain and connect your wallet to view and manage your NFT collection
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <ChainSwitcher />
          <AuthButtons isHeader={false} />
        </div>
      </div>
    </main>
  );
}
