import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePaginatedData } from './use-paginated-data';
import { useGammaChain } from './use-gamma-chain';
import { TokenBalance } from '@megayours/sdk';

export function useWalletNFTs() {
  const [actions] = useGammaChain();
  const { isConnected, address } = useAccount();
  const [error, setError] = useState<Error | null>(null);


  const fetchInitialPage = useCallback(async (pageSize: number) => {
    try {
      const result = await actions.getTokens(pageSize);
      return result;
    } catch (e) {
      console.error("Error fetching NFTs:", e);
      setError(e as Error);
      throw e;
    }
  }, [actions, isConnected, address]);

  const {
    items: nfts,
    isLoading,
    page,
    hasMore,
    loadPage,
    loadInitialPage
  } = usePaginatedData<TokenBalance>({
    pageSize: 10,
    fetchInitialPage
  });

  return {
    nfts,
    isLoading,
    error,
    page,
    hasMore,
    loadPage,
    loadInitialPage,
    isConnected,
    address
  };
} 