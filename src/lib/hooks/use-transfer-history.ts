import { TransferHistory, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';
import { useMemo, useCallback } from 'react';

export const transferKeys = {
  all: ['transfers'] as const,
  history: (blockchainRid: string, accountId: string | null) => 
    [...transferKeys.all, 'history', blockchainRid, accountId] as const,
  allHistory: (blockchainRid: string) => 
    [...transferKeys.all, 'all-history', blockchainRid] as const,
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
    return queryClient.getTransferHistoryByAccount(
      Buffer.from(accountId, 'hex'),
      undefined,
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
      return queryClient.getAllTransferHistory(undefined, pageSize);
    },
    {
      enabled: !!chainClient && !isLoadingClient,
    }
  );
} 