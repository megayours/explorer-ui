"use client";

import { Navbar } from '@/components/navbar';
import { MainContent } from '@/components/main-content';
import { ChainInitializer } from '@/components/chain-initializer';
import { use, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAccountId } from '@/lib/hooks/use-account.id';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{
    chain: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { chain } = use(params);
  const { address } = useAccount();
  const { getAccountId } = useAccountId();
  const [accountId, setAccountId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!address) return;
    
    // Get the accountId for the connected wallet
    getAccountId().then((id) => {
      const newAccountId = id?.toString('hex') ?? null;
      setAccountId(newAccountId);
      
      // Only redirect if we have a valid accountId
      if (newAccountId) {
        router.replace(`/${chain}/${newAccountId}`);
      }
    });
  }, [getAccountId, address, chain]);
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ChainInitializer chainName={chain} />
      <Navbar />
      <MainContent accountId={accountId} />
    </main>
  );
} 