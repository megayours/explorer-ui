"use client";

import { useRouter } from 'next/navigation';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useEffect } from 'react';
import { AuthButtons } from '@/components/auth/auth-buttons';

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
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Welcome to Gamma UI
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Connect your wallet to view and manage your NFT collection
        </p>
        <AuthButtons isHeader={false} />
      </div>
    </main>
  );
}
