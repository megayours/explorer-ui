'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IClient } from 'postchain-client';
import { useChainClient, useInvalidateChainClient } from '@/lib/hooks/use-chain-client';
import { useQueryClient } from '@tanstack/react-query';
import dapps from '@/config/dapps';

interface Chain {
  name: string;
  blockchainRid: string;
  dappUrl?: string;
}

type ChainContextType = {
  selectedChain: Chain;
  chainClient: IClient | null;
  isInitializing: boolean;
  isReady: boolean;
  switchChain: (blockchainRid: string, options?: { skipNavigation?: boolean }) => Promise<void>;
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

interface ChainProviderProps {
  children: React.ReactNode;
  initialBlockchainRid: string;
}

export function ChainProvider({ children, initialBlockchainRid }: ChainProviderProps) {
  const initialChain = dapps.find(d => d.blockchainRid.toLowerCase() === initialBlockchainRid.toLowerCase()) || {
    name: 'Custom Chain',
    blockchainRid: initialBlockchainRid,
    dappUrl: undefined
  };

  const [selectedChain, setSelectedChain] = useState<Chain>(initialChain);
  const { data: chainClient, isLoading: isInitializing, isSuccess: isReady } = useChainClient(selectedChain.blockchainRid);
  const { invalidateChainClient } = useInvalidateChainClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isSwitchingRef = useRef(false);

  // After mount, sync with URL if needed
  useEffect(() => {
    const urlChainRid = pathname.split('/')[1];
    if (!urlChainRid || isSwitchingRef.current) return;

    if (urlChainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      console.log('Chain mismatch, updating to URL chain', { urlChainRid });
      const urlChain = dapps.find(d => d.blockchainRid.toLowerCase() === urlChainRid.toLowerCase()) || {
        name: 'Custom Chain',
        blockchainRid: urlChainRid,
        dappUrl: undefined
      };
      void switchChain(urlChain.blockchainRid, { skipNavigation: true });
    }
  }, [pathname]);

  const switchChain = useCallback(async (blockchainRid: string, options?: { skipNavigation?: boolean }) => {
    if (isSwitchingRef.current) return;
    
    try {
      isSwitchingRef.current = true;
      console.log('switchChain called', { blockchainRid, skipNavigation: options?.skipNavigation });
      
      const chain = dapps.find(d => d.blockchainRid.toLowerCase() === blockchainRid.toLowerCase()) || {
        name: 'Custom Chain',
        blockchainRid
      };
      
      if (chain.blockchainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
        // Clear all account-related queries
        await queryClient.cancelQueries();
        await queryClient.resetQueries({
          predicate: query => 
            query.queryKey.includes('account') || 
            query.queryKey.includes('nfts') ||
            query.queryKey.includes('transfers')
        });
        
        await invalidateChainClient(selectedChain.blockchainRid);
        
        setSelectedChain(chain);

        if (!options?.skipNavigation) {
          router.push(`/${blockchainRid}`);
        }
      }
    } finally {
      isSwitchingRef.current = false;
    }
  }, [router, selectedChain.blockchainRid, invalidateChainClient, queryClient]);

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