import { TokenBalance, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';
import { usePaginator } from './use-paginator';

export const nftKeys = {
  all: ['nfts'] as const,
  list: (blockchainRid: string, accountId: string | null) => 
    [...nftKeys.all, 'list', blockchainRid, accountId] as const,
};

export function useNFTs(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);

  return usePaginator<TokenBalance>(
    nftKeys.list(blockchainRid, accountId),
    async () => {
      if (!chainClient || !accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getTokenBalances({
        accountId: Buffer.from(accountId, 'hex'),
      }, pageSize);
    },
    {
      enabled: !!chainClient && !!accountId && !isLoadingClient,
    }
  );
} 