import { useQuery } from '@tanstack/react-query';
import { TokenBalance, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';

export const tokenKeys = {
  all: ['tokens'] as const,
  balances: (blockchainRid: string, accountId: string | null) => 
    [...tokenKeys.all, 'balances', blockchainRid, accountId] as const,
};

export function useTokenBalances(blockchainRid: string, accountId: string | null, pageSize: number = 10) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);
  console.log("chainClient", chainClient);
  return useQuery({
    queryKey: tokenKeys.balances(blockchainRid, accountId),
    queryFn: async (): Promise<Paginator<TokenBalance>> => {
      if (!chainClient || !accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getTokenBalances({ account_id: Buffer.from(accountId, 'hex') }, pageSize);
    },
    enabled: !!chainClient && !!accountId && !isLoadingClient,
  });
} 