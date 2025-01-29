import { Navbar } from '@/components/navbar';
import { MainContent } from '@/components/main-content';
import { ChainInitializer } from '@/components/chain-initializer';
import { use } from 'react';

interface PageProps {
  params: Promise<{
    chain: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { chain } = use(params);
  
  return (
    <main className="min-h-screen bg-black text-white">
      <ChainInitializer chainName={chain} />
      <Navbar />
      <MainContent />
    </main>
  );
} 