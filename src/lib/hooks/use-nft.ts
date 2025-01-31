import { Token, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export const nftKeys = {
  all: ['nft'] as const,
  list: (blockchainRid: string, token_uid: string) => 
    [...nftKeys.all, 'list', blockchainRid, token_uid] as const,
};

export function useNFT(blockchainRid: string, token_uid: string) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  
  // Add dependency debug
  console.log('useNFT render', {
    blockchainRid,
    token_uid,
    chainClientReady: !!chainClient?.config?.blockchainRid,
    clientChain: chainClient?.config?.blockchainRid,
    isLoadingClient
  });

  const queryKey = useMemo(() => {
    const key = nftKeys.list(blockchainRid, token_uid);
    console.log('NFT query key recomputed:', key);
    return key;
  }, [blockchainRid, token_uid]);

  const fetchToken = useCallback(async () => {
    console.log('useNFT fetchToken called', {
      hasChainClient: !!chainClient,
      hasBlockchainRid: !!chainClient?.config?.blockchainRid,
      hasTokenUid: !!token_uid,
      isLoadingClient
    });

    if (!chainClient?.config?.blockchainRid || !token_uid) {
      console.log('useNFT', 'no chain client or token uid');
      throw new Error('Missing chain client or token uid');
    }

    console.log('useNFT', 'querying');

    const queryClient = createMegaYoursQueryClient(chainClient);
    return queryClient.getTokenByUid(Buffer.from(token_uid, 'hex'));
  }, [chainClient, token_uid, isLoadingClient]);

  const isEnabled = useMemo(() => {
    const enabled = !isLoadingClient && !!chainClient && chainClient.config.blockchainRid === blockchainRid && !!token_uid;
    console.log('useNFT enabled state:', {
      enabled,
      isLoadingClient,
      hasChainClient: !!chainClient,
      chainMatches: chainClient?.config?.blockchainRid === blockchainRid,
      hasTokenUid: !!token_uid
    });
    return enabled;
  }, [chainClient, blockchainRid, token_uid, isLoadingClient]);

  return useQuery({
    queryKey,
    queryFn: fetchToken,
    enabled: isEnabled
  });
}