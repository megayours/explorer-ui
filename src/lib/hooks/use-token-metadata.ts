import { useQuery } from '@tanstack/react-query';
import { Project, TokenMetadata, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChainClient } from './use-chain-client';

export const metadataKeys = {
  all: ['metadata'] as const,
  token: (blockchainRid: string, project: Project | undefined, collection: string, tokenId: bigint) => 
    [...metadataKeys.all, 'token', blockchainRid, project, collection, tokenId.toString()] as const,
};

export function useTokenMetadata(
  blockchainRid: string,
  project: Project | undefined,
  collection: string,
  tokenId: bigint
) {
  const { data: chainClient, isLoading: isLoadingClient } = useChainClient(blockchainRid);

  return useQuery({
    queryKey: metadataKeys.token(blockchainRid, project, collection, tokenId),
    queryFn: async (): Promise<TokenMetadata | null> => {
      if (!chainClient || !project) {
        return null;
      }

      const queryClient = createMegaYoursQueryClient(chainClient);
      return queryClient.getMetadata(project, collection, tokenId);
    },
    enabled: !!chainClient && !isLoadingClient && !!project,
  });
} 