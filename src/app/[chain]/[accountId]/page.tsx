'use client';

import { Navbar } from '@/components/navbar';
import { MainContent } from '@/components/main-content';
import { ChainInitializer } from '@/components/chain-initializer';
import { use } from 'react';

interface PageProps {
  params: Promise<{
    chain: string;
    accountId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { chain, accountId } = use(params);
  
  return (
    <main className="min-h-screen bg-black text-white">
      <ChainInitializer chainName={chain} />
      <Navbar />
      <MainContent accountId={accountId} />
    </main>
  );
} 