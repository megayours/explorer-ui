import { TokenBalance, Paginator, createMegaYoursClient, Project, TokenMetadata, TransferHistory, Token, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChromia } from "../chromia-connect/chromia-context";
import { createClient, FailoverStrategy, IClient } from "postchain-client";
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useMemo, useCallback } from "react";
import { env } from "@/env";

export type GammaChainActions = {
  getTokens: (pageSize: number, accountId: string | null) => Promise<Paginator<TokenBalance>>;
  getMetadata: (project: Project, collection: string, tokenId: bigint) => Promise<TokenMetadata | null>;
  getTransferHistory: (pageSize: number, accountId: string | null) => Promise<Paginator<TransferHistory>>;
};

export type GammaChainState = {
  isInitialized: boolean;
  isInitializing: boolean;
  isReady: boolean;
  error?: Error;
};

export type ChainTokenBalance = TokenBalance & {
  blockchainRid: string;
}

const RETRY_INTERVAL = 100; // ms
const MAX_RETRIES = 50; // 5 seconds total

async function waitForClient(getState: () => { client: IClient | null, ready: boolean }, maxRetries = MAX_RETRIES): Promise<IClient> {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    // Check immediately first
    const initialState = getState();
    if (initialState.ready && initialState.client) {
      resolve(initialState.client);
      return;
    }

    // Then set up interval for subsequent checks
    const interval = setInterval(() => {
      const { client, ready } = getState();
      console.log('Checking client state:', { ready, hasClient: !!client, retries });

      if (ready && client) {
        clearInterval(interval);
        resolve(client);
        return;
      }

      retries++;
      if (retries >= maxRetries) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for chain client'));
      }
    }, RETRY_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  });
}

export function useGammaChain(): [GammaChainActions, GammaChainState] {
  const { chromiaSession } = useChromia();
  const { chainClient, isInitializing, isReady } = useChain();

  const isInitialized = useMemo(() => !!chromiaSession, [chromiaSession]);
  const combinedReady = useMemo(() => isReady && !!chainClient, [isReady, chainClient]);

  const state = useMemo<GammaChainState>(() => ({
    isInitialized,
    isInitializing,
    isReady: combinedReady
  }), [isInitialized, isInitializing, combinedReady]);

  const getClientWhenReady = useCallback(() => {
    return waitForClient(() => ({
      client: chainClient,
      ready: combinedReady
    }));
  }, [chainClient, combinedReady]);

  const actions = useMemo<GammaChainActions>(() => ({
    getTokens: async (pageSize: number, accountId: string | null) => {
      console.log("getTokens called", { pageSize, accountId, chainClient, isInitializing, isReady, combinedReady });
      
      if (!accountId) {
        console.log("No account ID provided");
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      try {
        const client = await getClientWhenReady();
        console.log("Client ready, creating query client");
        const queryClient = createMegaYoursQueryClient(client);
        console.log("Fetching tokens");
        const paginator = await queryClient.getTokenBalances({ account_id: Buffer.from(accountId, 'hex') }, pageSize);
        console.log("Tokens fetched successfully");
        return paginator;
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }
    },
    getMetadata: async (project: Project, collection: string, tokenId: bigint) => {
      try {
        const client = await getClientWhenReady();
        const queryClient = createMegaYoursQueryClient(client);
        return await queryClient.getMetadata(project, collection, tokenId);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
        return null;
      }
    },
    getChainModules: async () => {
      try {
        const client = await getClientWhenReady();
        const queryClient = createMegaYoursQueryClient(client);
        return await queryClient.getSupportedModules();
      } catch (error) {
        console.error("Failed to fetch chain modules:", error);
        return [];
      }
    },
    getAllTransferHistory: async (pageSize: number) => {
      try {
        const client = await getClientWhenReady();
        const queryClient = createMegaYoursQueryClient(client);
        return await queryClient.getTransferHistory({}, pageSize);
      } catch (error) {
        console.error("Failed to fetch transfer history:", error);
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }
    },
    getTransferHistory: async (pageSize: number, accountId: string | null) => {
      if (!accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }

      try {
        const client = await getClientWhenReady();
        const queryClient = createMegaYoursQueryClient(client);
        return await queryClient.getTransferHistory({ account_id: Buffer.from(accountId, 'hex') }, pageSize);
      } catch (error) {
        console.error("Failed to fetch account transfer history:", error);
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
        } as Paginator<TransferHistory>;
      }
    }
  }), [getClientWhenReady]);

  return [actions, state];
}