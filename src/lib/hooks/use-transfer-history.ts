import { TransferHistory, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';

export const transferKeys = {
  all: ['transfers'] as const,
  history: (blockchainRid: string, accountId: string | null) => 
    [...transferKeys.all, 'history', blockchainRid, accountId] as const,
  allHistory: (blockchainRid: string) => 
    [...transferKeys.all, 'all-history', blockchainRid] as const,
};

export function useTransferHistory(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);

  return usePaginator<TransferHistory>(
    transferKeys.history(blockchainRid, accountId),
    async () => {
      if (!chainClient || !accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getTransferHistoryByAccount(
        Buffer.from(accountId, 'hex'),
        undefined,
        pageSize
      );
    },
    {
      enabled: !!chainClient && !!accountId && !isLoadingClient,
    }
  );
}

export function useAllTransferHistory(blockchainRid: string, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);

  return usePaginator<TransferHistory>(
    transferKeys.allHistory(blockchainRid),
    async () => {
      if (!chainClient) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getAllTransferHistory(undefined, pageSize);
    },
    {
      enabled: !!chainClient && !isLoadingClient,
    }
  );
} 