'use client';

import { use } from 'react';
import { Navbar } from '@/components/navbar';
import { ChainInitializer } from '@/components/chain-initializer';
import { ChainInfo } from '@/components/chain-info';
import { TokenDetails } from '@/components/token-details';

interface PageProps {
  params: Promise<{
    chain: string;
    uid: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { chain, uid } = use(params);
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ChainInitializer chainName={chain} />
      <div className="mx-8 pt-2 pb-8">
        <div className="space-y-8 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-8">
          {/* Chain Details */}
          <div className="xl:col-span-4">
            <div className="xl:sticky xl:top-24">
              <div className="bg-card border border-border rounded-xl p-6">
                <ChainInfo />
              </div>
            </div>
          </div>

          {/* Token Details */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-xl">
              <TokenDetails tokenUid={uid} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
