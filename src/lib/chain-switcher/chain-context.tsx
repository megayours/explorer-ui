'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient, IClient, FailoverStrategy } from 'postchain-client';
import { env } from '@/env';
import dapps from '@/config/dapps';

interface Chain {
  name: string;
  blockchainRid: string;
}

type ChainContextType = {
  selectedChain: Chain;
  chainClient: IClient | null;
  switchChain: (blockchainRid: string, options?: { skipNavigation?: boolean }) => void;
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

interface ChainProviderProps {
  children: React.ReactNode;
  initialBlockchainRid: string;
}

export function ChainProvider({ children, initialBlockchainRid }: ChainProviderProps) {
  // Start with the initialBlockchainRid for consistent server/client rendering
  const initialChain = dapps.find(d => d.blockchainRid.toLowerCase() === initialBlockchainRid.toLowerCase()) || {
    name: 'Custom Chain',
    blockchainRid: initialBlockchainRid
  };

  const [selectedChain, setSelectedChain] = useState<Chain>(initialChain);
  const [chainClient, setChainClient] = useState<IClient | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // After mount, sync with URL if needed
  useEffect(() => {
    const urlChainRid = pathname.split('/')[1];
    if (urlChainRid && urlChainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      const urlChain = dapps.find(d => d.blockchainRid.toLowerCase() === urlChainRid.toLowerCase()) || {
        name: 'Custom Chain',
        blockchainRid: urlChainRid
      };
      setSelectedChain(urlChain);
    }
  }, [pathname, selectedChain.blockchainRid]);

  const createChainClient = useCallback(async (chain: Chain) => {
    try {
      const client = await createClient({
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
        blockchainRid: chain.blockchainRid,
        failOverConfig: {
          attemptsPerEndpoint: 20,
          strategy: FailoverStrategy.TryNextOnError
        }
      });
      setChainClient(client);
    } catch (error) {
      console.error('Failed to create chain client:', error);
      setChainClient(null);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      void createChainClient(selectedChain);
    }
  }, [createChainClient, isMounted, selectedChain]);

  const switchChain = useCallback((blockchainRid: string, options?: { skipNavigation?: boolean }) => {
    const chain = dapps.find(d => d.blockchainRid.toLowerCase() === blockchainRid.toLowerCase()) || {
      name: 'Custom Chain',
      blockchainRid
    };
    
    // Only update if the chain has actually changed
    if (chain.blockchainRid.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      setSelectedChain(chain);
      void createChainClient(chain);

      // Only navigate if not explicitly skipped
      if (!options?.skipNavigation) {
        router.push(`/${blockchainRid}`);
      }
    }
  }, [createChainClient, router, selectedChain.blockchainRid]);

  return (
    <ChainContext.Provider value={{ selectedChain, chainClient, switchChain }}>
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