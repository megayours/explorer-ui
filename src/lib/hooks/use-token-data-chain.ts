import { TokenBalance, Paginator, createMegaYoursClient, Project, TokenMetadata, TransferHistory, Token, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChromia } from "../chromia-connect/chromia-context";
import { createClient, FailoverStrategy } from "postchain-client";
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useMemo } from "react";
import { env } from "@/env";

export type GammaChainActions = {
  getTokens: (pageSize: number, accountId: string | null) => Promise<Paginator<TokenBalance>>;
  getMetadata: (project: Project, collection: string, tokenId: bigint) => Promise<TokenMetadata | null>;
  getTransferHistory: (pageSize: number) => Promise<Paginator<TransferHistory>>;
};

export type GammaChainState = {
  isInitialized: boolean;
  error?: Error;
};

export type ChainTokenBalance = TokenBalance & {
  blockchainRid: string;
}

export function useGammaChain(): [GammaChainActions, GammaChainState] {
  const { chromiaSession } = useChromia();
  const { chainClient, selectedChain } = useChain();

  const state: GammaChainState = {
    isInitialized: !!chromiaSession,
  };

  

  const actions = useMemo<GammaChainActions>(() => ({
    getTokens: async (pageSize: number, accountId: string | null) => {
      // Create a new client for this specific request to ensure we're using the correct chain

      if (!accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      const client = await createClient({
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
        blockchainRid: selectedChain.blockchainRid,
        failOverConfig: {
          attemptsPerEndpoint: 20,
          strategy: FailoverStrategy.TryNextOnError
        }
      });

      // If we have a Chromia session, use it
      if (chromiaSession) {
        const megaYoursClient = createMegaYoursClient(chromiaSession);
        return megaYoursClient.getTokenBalances(chromiaSession.account.id, pageSize);
      }

      // Otherwise, use the query client
      const queryClient = createMegaYoursQueryClient(client);

      return queryClient.getTokenBalances(Buffer.from(accountId, 'hex'), pageSize);
    },
    getMetadata: async (project: Project, collection: string, tokenId: bigint) => {
      // Create a new client for this specific request
      const client = await createClient({
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
        blockchainRid: selectedChain.blockchainRid,
        failOverConfig: {
          attemptsPerEndpoint: 20,
          strategy: FailoverStrategy.TryNextOnError
        }
      });

      const queryClient = createMegaYoursQueryClient(client);
      return queryClient.getMetadata(project, collection, tokenId);
    },
    getTransferHistory: async (pageSize: number) => {
      if (!chromiaSession) {
        throw new Error("Chromia session not initialized");
      }
      const client = createMegaYoursClient(chromiaSession);
      return client.getTransferHistoryByAccount(chromiaSession.account.id, undefined, pageSize);
    }
  }), [selectedChain.blockchainRid, chromiaSession]); // Remove chainClient from deps since we're creating new clients

  return [actions, state];
}