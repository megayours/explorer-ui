import { TokenBalance, Paginator, createMegaYoursClient, Project, TokenMetadata, TransferHistory, Token, createMegaYoursQueryClient } from "@megayours/sdk";
import { useChromia } from "../chromia-connect/chromia-context";
import { IClient, createClient, FailoverStrategy } from "postchain-client";
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { env } from "@/env";

export type GammaChainActions = {
  getTokens: (pageSize: number) => Promise<Paginator<TokenBalance>>;
  transferToken: (toBlockchainRid: string, project: Project, collection: string, tokenId: bigint) => Promise<void>;
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
  const { address } = useAccount();

  const state: GammaChainState = {
    isInitialized: !!chromiaSession,
  };

  const getAccountId = async (client: IClient, evmAddress: string) => {
    const accounts = await client.query<{ data: { id: Buffer }[] }>('ft4.get_accounts_by_signer', {
      id: Buffer.from(evmAddress.slice(2), 'hex'),  // Remove '0x' prefix
      page_size: 1,
      page_cursor: null
    });

    if (accounts.data.length === 0) return null;

    return accounts.data[0].id;
  }

  const actions = useMemo<GammaChainActions>(() => ({
    getTokens: async (pageSize: number) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Create a new client for this specific request to ensure we're using the correct chain
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
      const accountId = await getAccountId(client, address);
      
      if (!accountId) {
        return {
          data: [],
          fetchNext: () => Promise.resolve(null as unknown as Paginator<TokenBalance>)
        } as Paginator<TokenBalance>;
      }

      return queryClient.getTokenBalances(accountId, pageSize);
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
    transferToken: async (toBlockchainRid: string, project: Project, collection: string, tokenId: bigint) => {
      if (!chromiaSession) {
        throw new Error("Chromia session not initialized");
      }

      if (!chainClient) {
        throw new Error("Chain client not initialized");
      }

      console.log(`useGammaChain: Session before transfer - auth descriptor: ${chromiaSession.account.authenticator.keyHandlers[0].authDescriptor.id.toString('hex')}`);
      const client = createMegaYoursClient(chromiaSession);
      return client.transferCrosschain(chainClient, client.account.id, project, collection, tokenId, BigInt(1))
    },
    getTransferHistory: async (pageSize: number) => {
      if (!chromiaSession) {
        throw new Error("Chromia session not initialized");
      }
      const client = createMegaYoursClient(chromiaSession);
      return client.getTransferHistoryByAccount(chromiaSession.account.id, undefined, pageSize);
    }
  }), [address, selectedChain.blockchainRid, chromiaSession]); // Remove chainClient from deps since we're creating new clients

  return [actions, state];
}