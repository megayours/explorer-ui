import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, IClient, FailoverStrategy } from 'postchain-client';
import { env } from '@/env';

export const chainKeys = {
  all: ['chain'] as const,
  client: (blockchainRid: string) => [...chainKeys.all, 'client', blockchainRid] as const,
};

async function createChainClient(blockchainRid: string): Promise<IClient> {
  console.log('Creating chain client for', blockchainRid);
  const client = await createClient({
    directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
    blockchainRid,
    failOverConfig: {
      attemptsPerEndpoint: 20,
      strategy: FailoverStrategy.TryNextOnError
    }
  });
  (client as any).blockchainRid = blockchainRid;
  return client;
}

export function useChainClient(blockchainRid: string) {
  return useQuery({
    queryKey: chainKeys.client(blockchainRid),
    queryFn: () => createChainClient(blockchainRid),
    staleTime: Infinity, // Chain client should remain fresh unless explicitly invalidated
    gcTime: Infinity, // Keep the client in cache until explicitly removed
    retry: 2, // Retry failed client creation twice
  });
}

export function useInvalidateChainClient() {
  const queryClient = useQueryClient();
  
  return {
    invalidateChainClient: (blockchainRid: string) => {
      return queryClient.invalidateQueries({
        queryKey: chainKeys.client(blockchainRid),
      });
    },
    removeChainClient: (blockchainRid: string) => {
      return queryClient.removeQueries({
        queryKey: chainKeys.client(blockchainRid),
      });
    }
  };
} 