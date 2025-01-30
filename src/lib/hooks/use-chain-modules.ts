import { useQuery } from '@tanstack/react-query';
import { createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';

export const moduleKeys = {
  all: ['modules'] as const,
  supported: (blockchainRid: string) => [...moduleKeys.all, 'supported', blockchainRid] as const,
};

export function useChainModules(blockchainRid: string) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);

  return useQuery({
    queryKey: moduleKeys.supported(blockchainRid),
    queryFn: async () => {
      if (!chainClient) {
        return [];
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getSupportedModules();
    },
    enabled: !!chainClient && !isLoadingClient,
  });
} 