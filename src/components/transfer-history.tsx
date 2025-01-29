'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { createClient } from 'postchain-client';
import { createMegaYoursQueryClient, TokenMetadata, Project, Paginator } from '@megayours/sdk';
import { env } from '@/env';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useAccount } from 'wagmi';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { getAccountId } from '@/lib/utils/chain';
import { PaginationControls } from '@/components/pagination-controls';
import { useMetadataCache } from '@/lib/hooks/use-metadata-cache';

const PAGE_SIZE = 10;

interface TransferHistoryEntry {
  token: {
    project: Project;
    collection: string;
    id: bigint;
  };
  blockchain_rid: Buffer;
  type: 'sent' | 'received';
  amount: bigint;
  op_index: number;
}

interface Transfer {
  token: {
    project: Project;
    collection: string;
    id: bigint;
  };
  blockchain_rid: string | null;
  type: 'sent' | 'received';
  amount: bigint;
  decimals: number;
  op_index: number;
}

export function TransferHistory() {
  const { selectedChain } = useChain();
  const { address, isConnected } = useAccount();
  const [metadataMap, setMetadataMap] = useState<Record<string, TokenMetadata | null>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<Record<string, boolean>>({});
  const { getMetadata, setMetadata } = useMetadataCache();

  async function fetchTransfers(accountId: Buffer | null): Promise<Paginator<Transfer>> {
    if (!accountId) {
      return {
        data: [] as Transfer[],
        fetchNext: () => Promise.resolve(null as unknown as Paginator<Transfer>)
      } as Paginator<Transfer>;
    }

    const client = await createClient({
      directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
      blockchainRid: selectedChain.blockchainRid
    });
    const queryClient = createMegaYoursQueryClient(client);
    const result = await queryClient.getTransferHistoryByAccount(accountId, undefined, PAGE_SIZE);
    
    // Convert Buffer to string for blockchain_rid
    const transfers = result.data.map(entry => ({
      ...entry,
      blockchain_rid: entry.blockchain_rid?.toString('hex') ?? null
    }));

    return {
      data: transfers,
      fetchNext: async () => {
        const nextPage = await result.fetchNext();
        if (!nextPage) return null as unknown as Paginator<Transfer>;

        const nextTransfers = nextPage.data.map(entry => ({
          ...entry,
          blockchain_rid: entry.blockchain_rid?.toString('hex') ?? null
        }));

        return {
          data: nextTransfers,
          fetchNext: nextPage.fetchNext
        } as Paginator<Transfer>;
      }
    } as Paginator<Transfer>;
  }

  const {
    items: transfers,
    isLoading,
    hasMore,
    page,
    loadPage,
    loadInitialPage,
  } = usePaginatedData<Transfer>({
    pageSize: PAGE_SIZE,
    fetchInitialPage: async () => {
      if (isConnected && address) {
        const client = await createClient({
          directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
          blockchainRid: selectedChain.blockchainRid
        });
        const accountId = await getAccountId(client, address);
        return await fetchTransfers(accountId);
      }
      return {
        data: [] as Transfer[],
        fetchNext: () => Promise.resolve(null as unknown as Paginator<Transfer>)
      } as Paginator<Transfer>;
    },
  });

  useEffect(() => {
    if (isConnected) {
      void loadInitialPage();
    }
  }, [isConnected, selectedChain.blockchainRid]);

  const fetchMetadata = async (transfer: Transfer) => {
    const key = `${transfer.token.collection}-${transfer.token.id}`;
    if (key in metadataMap || isLoadingMetadata[key]) return;

    // Check cache first
    const cachedMetadata = getMetadata(selectedChain.blockchainRid, transfer.token.collection, transfer.token.id);
    if (cachedMetadata !== undefined) {
      setMetadataMap(prev => ({ ...prev, [key]: cachedMetadata }));
      return;
    }

    setIsLoadingMetadata(prev => ({ ...prev, [key]: true }));
    try {
      const client = await createClient({
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
        blockchainRid: selectedChain.blockchainRid
      });
      const queryClient = createMegaYoursQueryClient(client);
      const metadata = await queryClient.getMetadata(transfer.token.project, transfer.token.collection, transfer.token.id);
      
      // Update both local state and cache
      setMetadataMap(prev => ({ ...prev, [key]: metadata }));
      setMetadata(selectedChain.blockchainRid, transfer.token.collection, transfer.token.id, metadata);
    } catch (err) {
      console.error(`Failed to fetch metadata for token ${transfer.token.id}:`, err);
      
      // Update both local state and cache with null
      setMetadataMap(prev => ({ ...prev, [key]: null }));
      setMetadata(selectedChain.blockchainRid, transfer.token.collection, transfer.token.id, null);
    } finally {
      setIsLoadingMetadata(prev => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    transfers.forEach(transfer => {
      void fetchMetadata(transfer);
    });
  }, [transfers]);

  if (!isConnected) {
    return null;
  }

  function truncateBlockchainRid(rid: string | null): string {
    if (!rid) return 'Unknown';
    return rid.slice(0, 8) + '...' + rid.slice(-8);
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Transfer History</h2>
      <div className="space-y-2">
        {transfers.map((transfer) => {
          const key = `${transfer.token.collection}-${transfer.token.id}`;
          const metadata = metadataMap[key];
          const isLoadingCurrentMetadata = isLoadingMetadata[key];
          const name = metadata?.name || `${transfer.token.collection} #${transfer.token.id}`;
          const imageUrl = metadata?.properties?.image?.toString() || '/placeholder.svg?height=500&width=500';

          const isExternal = transfer.type.startsWith('external_');
          const isReceived = transfer.type.includes('received');

          return (
            <div
              key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random()*1000}`}
              className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50 flex items-center gap-3"
            >
              {/* Transfer Type Icon */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${isReceived ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isExternal ? (
                  isReceived ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  )
                ) : (
                  <ArrowLeftRight className={`h-4 w-4 ${isReceived ? 'text-green-500' : 'text-red-500'}`} />
                )}
              </div>

              {/* NFT Image */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                {isLoadingCurrentMetadata ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <img
                    src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* NFT Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-400 truncate">{transfer.token.project.name} - {transfer.token.collection}</p>
                <h3 className="font-medium text-sm text-white truncate">{name}</h3>
              </div>

              {/* Chain Info (if available) */}
              {isExternal ? (
                <div className="flex-shrink-0 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-xs text-zinc-400 font-medium italic">Owner Changed</p>
                </div>
              ) : transfer.blockchain_rid && (
                <div className="flex-shrink-0 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-xs text-zinc-400 font-medium truncate">{truncateBlockchainRid(transfer.blockchain_rid)}</p>
                </div>
              )}
            </div>
          );
        })}

        {transfers.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center px-6 py-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
              <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center mb-2">
                <span className="text-lg">📜</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No Transfers</h3>
              <p className="text-sm text-zinc-400">No transfer history found</p>
            </div>
          </div>
        )}

        <PaginationControls
          page={page}
          isLoading={isLoading}
          hasMore={hasMore}
          onPageChange={loadPage}
        />
      </div>
    </div>
  );
} 