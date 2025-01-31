import { TokenBalance, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';
import { useMemo, useCallback } from 'react';

export const nftKeys = {
  all: ['nfts'] as const,
  list: (blockchainRid: string, accountId: string | null) => 
    [...nftKeys.all, 'list', blockchainRid, accountId] as const,
};

export function useNFTs(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  
  // Add dependency debug
  console.log('useNFTs render', {
    blockchainRid,
    accountId,
    chainClientReady: !!chainClient?.config?.blockchainRid,
    clientChain: chainClient?.config?.blockchainRid,
    isLoadingClient
  });

  const queryKey = useMemo(() => {
    const key = nftKeys.list(blockchainRid, accountId);
    console.log('NFT query key recomputed:', key);
    return key;
  }, [blockchainRid, accountId]);

  const fetchFirstPage = useCallback(async () => {
    console.log('useNFTs fetchFirstPage called', {
      hasChainClient: !!chainClient,
      hasBlockchainRid: !!chainClient?.config?.blockchainRid,
      hasAccountId: !!accountId,
      isLoadingClient
    });

    if (!chainClient?.config?.blockchainRid || !accountId) {
      console.log('useNFTs', 'no chain client or account id');
      return { data: [], fetchNext: () => Promise.resolve(null!) };
    }

    console.log('useNFTs', 'querying');

    const queryClient = createMegaYoursQueryClient(chainClient);
    return queryClient.getTokenBalances({
      accountId: Buffer.from(accountId, 'hex'),
    }, pageSize);
  }, [chainClient, accountId, pageSize, isLoadingClient]);

  const isEnabled = useMemo(() => {
    const enabled = !isLoadingClient && !!chainClient && chainClient.config.blockchainRid === blockchainRid && !!accountId;
    console.log('useNFTs enabled state:', {
      enabled,
      isLoadingClient,
      hasChainClient: !!chainClient,
      chainMatches: chainClient?.config?.blockchainRid === blockchainRid,
      hasAccountId: !!accountId
    });
    return enabled;
  }, [chainClient, blockchainRid, accountId, isLoadingClient]);

  return usePaginator<TokenBalance>(
    queryKey,
    fetchFirstPage,
    {
      enabled: isEnabled
    }
  );
} 