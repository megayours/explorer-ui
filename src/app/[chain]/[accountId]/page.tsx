"use client";

import { use } from 'react';
import { Navbar } from '@/components/navbar';
import { MainContent } from '@/components/main-content';
import { ChainInitializer } from '@/components/chain-initializer';

interface PageProps {
  params: Promise<{
    chain: string;
    accountId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { chain, accountId } = use(params);
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ChainInitializer chainName={chain} />
      <Navbar />
      <MainContent accountId={accountId} />
    </main>
  );
} 