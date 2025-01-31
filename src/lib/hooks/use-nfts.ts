import { TokenBalance, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';
import { useRef, useEffect } from 'react';

export const nftKeys = {
  all: ['nfts'] as const,
  list: (blockchainRid: string, accountId: string | null) => 
    [...nftKeys.all, 'list', blockchainRid, accountId] as const,
};

export function useNFTs(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  const currentChainClientRef = useRef(chainClient);
  
  // Update ref when chain client changes
  useEffect(() => {
    currentChainClientRef.current = chainClient;
  }, [chainClient]);

  return usePaginator<TokenBalance>(
    nftKeys.list(blockchainRid, accountId),
    async () => {
      const currentClient = currentChainClientRef.current;
      if (!currentClient || !accountId || !blockchainRid || 
          (currentClient as any).blockchainRid !== blockchainRid) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      const queryClient = createMegaYoursQueryClient(currentClient);
      return queryClient.getTokenBalances({
        accountId: Buffer.from(accountId, 'hex'),
      }, pageSize);
    },
    {
      enabled: !!chainClient && !!accountId && !isLoadingClient && !!blockchainRid &&
        (chainClient as any)?.blockchainRid === blockchainRid
    }
  );
} 