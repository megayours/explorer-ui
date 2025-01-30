'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IClient } from 'postchain-client';
import { useChainClient, useInvalidateChainClient } from '@/lib/hooks/use-chain-client';
import dapps from '@/config/dapps';

interface Chain {
  name: string;
  blockchainRid: string;
}

type ChainContextType = {
  selectedChain: Chain;
  chainClient: IClient | null;
  isInitializing: boolean;
  isReady: boolean;
  switchChain: (blockchainRid: string, options?: { skipNavigation?: boolean }) => void;
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

interface ChainProviderProps {
  children: React.ReactNode;
  initialBlockchainRid: string;
}

export function ChainProvider({ children, initialBlockchainRid }: ChainProviderProps) {
  const initialChain = dapps.find(d => d.blockchainRid.toLowerCase() === initialBlockchainRid.toLowerCase()) || {
    name: 'Custom Chain',
    blockchainRid: initialBlockchainRid
  };

  const [selectedChain, setSelectedChain] = useState<Chain>(initialChain);
  const { data: chainClient, isLoading: isInitializing, isSuccess: isReady } = useChainClient(selectedChain.blockchainRid);
  const { invalidateChainClient } = useInvalidateChainClient();
  const router = useRouter();
  const pathname = usePathname();

  // After mount, sync with URL if needed
  useEffect(() => {
    console.log('URL sync effect', { pathname, selectedChainRid: selectedChain.blockchainRid });
    const urlChainRid = pathname.split('/')[1];
    if (urlChainRid && urlChainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      console.log('Chain mismatch, updating to URL chain', { urlChainRid });
      const urlChain = dapps.find(d => d.blockchainRid.toLowerCase() === urlChainRid.toLowerCase()) || {
        name: 'Custom Chain',
        blockchainRid: urlChainRid
      };
      setSelectedChain(urlChain);
    }
  }, [pathname, selectedChain.blockchainRid]);

  const switchChain = useCallback((blockchainRid: string, options?: { skipNavigation?: boolean }) => {
    console.log('switchChain called', { blockchainRid, skipNavigation: options?.skipNavigation });
    const chain = dapps.find(d => d.blockchainRid.toLowerCase() === blockchainRid.toLowerCase()) || {
      name: 'Custom Chain',
      blockchainRid
    };
    
    // Only update if the chain has actually changed
    if (chain.blockchainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      // Invalidate the old chain client before switching
      invalidateChainClient(selectedChain.blockchainRid);
      setSelectedChain(chain);

      // Only navigate if not explicitly skipped
      if (!options?.skipNavigation) {
        router.push(`/${blockchainRid}`);
      }
    }
  }, [router, selectedChain.blockchainRid, invalidateChainClient]);

  return (
    <ChainContext.Provider value={{ selectedChain, chainClient: chainClient ?? null, isInitializing, isReady, switchChain }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
} 