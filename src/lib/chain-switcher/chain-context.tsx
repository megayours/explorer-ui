'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dapps from '@/config/dapps';

type ChainContextType = {
  selectedChain: typeof dapps[0];
  switchChain: (chain: typeof dapps[0]) => void;
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [selectedChain, setSelectedChain] = useState(dapps[0]);
  const router = useRouter();

  const switchChain = useCallback((chain: typeof dapps[0]) => {
    setSelectedChain(chain);
    router.replace('/');
  }, [router]);

  return (
    <ChainContext.Provider value={{ selectedChain, switchChain }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
} 