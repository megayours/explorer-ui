import { Token, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { useMemo, useCallback } from 'react';
import { usePaginator } from './use-paginator';

export const nftKeys = {
  all: ['ownerships'] as const,
  list: (blockchainRid: string, token: Token) => 
    [...nftKeys.all, 'list', blockchainRid, token.project.blockchain_rid.toString('hex'), token.project.name, token.collection, token.id.toString()] as const,
};

export function useOwnerships(blockchainRid: string, token: Token | null | undefined, pageSize: number = 5) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  
  // Add dependency debug
  console.log('useOwnerships render', {
    blockchainRid,
    token,
    chainClientReady: !!chainClient?.config?.blockchainRid,
    clientChain: chainClient?.config?.blockchainRid,
    isLoadingClient
  });

  const queryKey = useMemo(() => {
    const key = token ? nftKeys.list(blockchainRid, token) : [...nftKeys.all, 'list', blockchainRid];
    console.log('NFT query key recomputed:', key);
    return key;
  }, [blockchainRid, token]);

  const fetchFirstPage = useCallback(async () => {
    console.log('useOwnerships fetchFirstPage called', {
      hasChainClient: !!chainClient,
      hasBlockchainRid: !!chainClient?.config?.blockchainRid,
      token: !!token,
      isLoadingClient
    });

    if (!chainClient?.config?.blockchainRid || !token) {
      console.log('useOwnerships', 'no chain client or token');
      return { data: [], fetchNext: () => Promise.resolve(null!) };
    }

    console.log('useOwnerships', 'querying');

    const queryClient = createMegaYoursQueryClient(chainClient);
    return queryClient.getTokenBalances({ project: token.project, collection: token.collection, tokenId: token.id }, pageSize);
  }, [chainClient, token, pageSize, isLoadingClient]);

  const isEnabled = useMemo(() => {
    const enabled = !isLoadingClient && !!chainClient && chainClient.config.blockchainRid === blockchainRid && !!token;
    console.log('useOwnerships enabled state:', {
      enabled,
      isLoadingClient,
      hasChainClient: !!chainClient,
      chainMatches: chainClient?.config?.blockchainRid === blockchainRid,
      hasToken: !!token
    });
    return enabled;
  }, [chainClient, blockchainRid, token, isLoadingClient]);

  return usePaginator(
    queryKey,
    fetchFirstPage,
    {
      enabled: isEnabled
    }
  );
}