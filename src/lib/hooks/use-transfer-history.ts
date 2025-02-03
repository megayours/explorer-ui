import { TransferHistory, Paginator, createMegaYoursQueryClient, Project } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';
import { useMemo, useCallback } from 'react';

export const transferKeys = {
  all: ['transfers'] as const,
  history: (blockchainRid: string, accountId: string | null) => 
    [...transferKeys.all, 'history', blockchainRid, accountId] as const,
  allHistory: (blockchainRid: string) => 
    [...transferKeys.all, 'all-history', blockchainRid] as const,
  specificTokenHistory: (blockchainRid: string, tokenUid: string) => 
    [...transferKeys.all, 'specific-token-history', blockchainRid, tokenUid] as const,
};

export function useTransferHistory(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  
  // Add dependency debug
  console.log('useTransferHistory render', {
    blockchainRid,
    accountId,
    chainClientReady: !!chainClient?.config?.blockchainRid,
    clientChain: chainClient?.config?.blockchainRid,
    isLoadingClient
  });

  const queryKey = useMemo(() => {
    const key = transferKeys.history(blockchainRid, accountId);
    console.log('Transfer query key recomputed:', key);
    return key;
  }, [blockchainRid, accountId]);

  const fetchFirstPage = useCallback(async () => {
    console.log('useTransferHistory fetchFirstPage called', {
      hasChainClient: !!chainClient,
      hasBlockchainRid: !!chainClient?.config?.blockchainRid,
      hasAccountId: !!accountId,
      isLoadingClient
    });

    if (!chainClient?.config?.blockchainRid || !accountId) {
      console.log('useTransferHistory', 'no chain client or account id');
      return { data: [], fetchNext: () => Promise.resolve(null!) };
    }

    console.log('useTransferHistory', 'querying');

    const queryClient = createMegaYoursQueryClient(chainClient);
    return queryClient.getTransferHistory(
      { account_id: Buffer.from(accountId, 'hex') },
      pageSize
    );
  }, [chainClient, accountId, pageSize, isLoadingClient]);

  const isEnabled = useMemo(() => {
    const enabled = !isLoadingClient && !!chainClient && chainClient.config.blockchainRid === blockchainRid && !!accountId;
    console.log('useTransferHistory enabled state:', {
      enabled,
      isLoadingClient,
      hasChainClient: !!chainClient,
      chainMatches: chainClient?.config?.blockchainRid === blockchainRid,
      hasAccountId: !!accountId
    });
    return enabled;
  }, [chainClient, blockchainRid, accountId, isLoadingClient]);

  return usePaginator<TransferHistory>(
    queryKey,
    fetchFirstPage,
    {
      enabled: isEnabled
    }
  );
}

export function useAllTransferHistory(blockchainRid: string, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  console.log('useAllTransferHistory', blockchainRid, pageSize);
  return usePaginator<TransferHistory>(
    transferKeys.allHistory(blockchainRid),
    async () => {
      if (!chainClient) {
        console.log('useAllTransferHistory', 'no chain client');
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      console.log('useAllTransferHistory', 'querying');
      return queryClient.getTransferHistory({}, pageSize);
    },
    {
      enabled: !!chainClient && !isLoadingClient,
    }
  );
}

export function useSpecificTokenTransferHistory(blockchainRid: string, tokenUid:string, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  console.log('useSpecificTokenTransferHistory', blockchainRid, tokenUid, pageSize);
  return usePaginator<TransferHistory>(
    transferKeys.allHistory(blockchainRid),
    async () => {
      if (!chainClient) {
        console.log('useSpecificTokenTransferHistory', 'no chain client');
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      console.log('useSpecificTokenTransferHistory', 'querying');
      return queryClient.getTransferHistory({ token_uid: Buffer.from(tokenUid, 'hex') }, pageSize);
    },
    {
      enabled: !!chainClient && !isLoadingClient,
    }
  );
} 