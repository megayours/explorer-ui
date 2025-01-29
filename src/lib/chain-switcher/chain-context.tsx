'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  switchChain: (blockchainRid: string) => void;
};

const ChainContext = createContext<ChainContextType | undefined>(undefined);

interface ChainProviderProps {
  children: React.ReactNode;
  initialBlockchainRid: string;
}

export function ChainProvider({ children, initialBlockchainRid }: ChainProviderProps) {
  // Find in known dapps or create a custom chain
  const initialChain = dapps.find(d => d.blockchainRid.toLowerCase() === initialBlockchainRid.toLowerCase()) || {
    name: 'Custom Chain',
    blockchainRid: initialBlockchainRid
  };

  const [selectedChain, setSelectedChain] = useState<Chain>(initialChain);
  const [chainClient, setChainClient] = useState<IClient | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const createChainClient = useCallback(async (chain: Chain) => {
    const client = await createClient({
      directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
      blockchainRid: chain.blockchainRid,
      failOverConfig: {
        attemptsPerEndpoint: 20,
        strategy: FailoverStrategy.TryNextOnError
      }
    });
    setChainClient(client);
  }, []);

  // Handle initial mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create chain client only after component is mounted
  useEffect(() => {
    if (isMounted) {
      void createChainClient(selectedChain);
    }
  }, [selectedChain.blockchainRid, createChainClient, isMounted]);

  const switchChain = useCallback((blockchainRid: string) => {
    const chain = dapps.find(d => d.blockchainRid.toLowerCase() === blockchainRid.toLowerCase()) || {
      name: 'Custom Chain',
      blockchainRid
    };
    setSelectedChain(chain);
    router.replace(`/${blockchainRid}`);
  }, [router]);

  return (
    <ChainContext.Provider value={{ selectedChain, chainClient, switchChain }}>
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