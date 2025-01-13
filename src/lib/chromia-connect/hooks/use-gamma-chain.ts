import { TokenBalance, Paginator, createMegaYoursClient, Project } from "@megayours/sdk";
import { useChromia } from "../chromia-context";
import { createClient } from "postchain-client";
import { env } from "@/env";

export type GammaChainActions = {
  getTokens: () => Promise<Paginator<TokenBalance>>;
  transferToken: (toBlockchainRid: string, project: Project, collection: string, tokenId: bigint) => Promise<void>;
};

export function useGammaChain(): [GammaChainActions] {
  const { chromiaSession } = useChromia();

  const actions: GammaChainActions = {
    getTokens: () => {
      if (!chromiaSession) throw new Error("No chromia session");

      const client = createMegaYoursClient(chromiaSession);
      return client.getTokenBalances(chromiaSession.account.id);
    },
    transferToken: async (toBlockchainRid: string, project: Project, collection: string, tokenId: bigint) => {
      if (!chromiaSession) throw new Error("No chromia session");
      const client = createMegaYoursClient(chromiaSession);
      const targetChain = await createClient({ directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL, blockchainRid: toBlockchainRid });
      return client.transferCrosschain(targetChain, client.account.id, project, collection, tokenId, BigInt(1))
    }
  };

  return [actions];
}