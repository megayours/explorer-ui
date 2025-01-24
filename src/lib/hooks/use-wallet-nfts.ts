import { useAccount } from 'wagmi';
import { TokenBalance, Paginator, createMegaYoursQueryClient } from "@megayours/sdk";
import { createClient, IClient } from "postchain-client";
import { env } from "@/env";
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useState } from 'react';

export const getAccountId = async (client: IClient, evmAddress: string) => {
  const accounts = await client.query<{ data: { id: Buffer }[] }>('ft4.get_accounts_by_signer', {
    id: Buffer.from(evmAddress.slice(2), 'hex'), // Remove '0x' prefix
    page_size: 1,
    page_cursor: null
  });

  if (accounts.data.length === 0) return null;
  return accounts.data[0].id;
}

export function useWalletNFTs() {
  const { address, isConnected } = useAccount();
  const { selectedChain } = useChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNFTs = async (pageSize: number): Promise<Paginator<TokenBalance> | null> => {
    if (!isConnected || !address) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = await createClient({ 
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL, 
        blockchainRid: selectedChain.blockchainRid 
      });
      const queryClient = createMegaYoursQueryClient(client);
      const accountId = await getAccountId(client, address);
      
      if (!accountId) {
        return null;
      }

      const paginator = await queryClient.getTokenBalances(accountId, pageSize);
      return paginator;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch NFTs'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchNFTs,
    isLoading,
    error,
    isConnected,
    address
  };
} 