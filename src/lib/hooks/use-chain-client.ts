import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, IClient, FailoverStrategy } from 'postchain-client';
import { env } from '@/env';
import { useState, useEffect } from 'react';

export const chainKeys = {
  all: ['chain'] as const,
  client: (blockchainRid: string) => [...chainKeys.all, 'client', blockchainRid] as const,
};

async function createChainClient(blockchainRid: string, signal?: AbortSignal): Promise<IClient> {
  console.log('Creating chain client for', blockchainRid);
  const client = await createClient({
    directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
    blockchainRid,
    failOverConfig: {
      attemptsPerEndpoint: 20,
      strategy: FailoverStrategy.TryNextOnError
    }
  });
  
  // Add cancellation check
  signal?.addEventListener('abort', () => {
    console.log('Aborting chain client creation for', blockchainRid);
    client.close();
  });

  (client as any).blockchainRid = blockchainRid;
  return client;
}

export function useChainClient(blockchainRid: string) {
  return useQuery({
    queryKey: ['chain-client', blockchainRid],
    queryFn: async ({ signal }) => {
      try {
        return await createChainClient(blockchainRid, signal);
      } catch (error) {
        if (signal?.aborted) {
          console.log('Chain client creation aborted for', blockchainRid);
          throw new Error('Request aborted');
        }
        throw error;
      }
    },
    staleTime: Infinity,
    enabled: !!blockchainRid,
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