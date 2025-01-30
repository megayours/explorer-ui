'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { createClient } from 'postchain-client';
import { createMegaYoursQueryClient, TokenMetadata, Project, Paginator } from '@megayours/sdk';
import { env } from '@/env';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { PaginationControls } from '@/components/pagination-controls';
import { useMetadataCache } from '@/lib/hooks/use-metadata-cache';
import { EmptyState } from './empty-state';
import { colors, shadows } from '@/lib/theme';

const PAGE_SIZE = 10;

interface Transfer {
  token: {
    project: Project;
    collection: string;
    id: bigint;
  };
  blockchain_rid: Buffer | null;
  type: 'sent' | 'received';
  amount: bigint;
  decimals: number;
  op_index: number;
}

export function TransferHistory({ accountId }: { accountId: string | null }) {
  const { selectedChain } = useChain();
  const [metadataMap, setMetadataMap] = useState<Record<string, TokenMetadata | null>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<Record<string, boolean>>({});
  const { getMetadata, setMetadata } = useMetadataCache();
  const loadedRef = useRef<{chain: string, loaded: boolean}>({ chain: '', loaded: false });
  const isNavigatingRef = useRef(false);

  async function fetchTransfers(): Promise<Paginator<Transfer>> {
    if (!accountId) {
      console.log('No accountId found');
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
    const result = await queryClient.getTransferHistoryByAccount(Buffer.from(accountId, 'hex'), undefined, PAGE_SIZE);
    
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
      return await fetchTransfers();
    },
  });

  // Handle initial loading and chain changes
  useEffect(() => {
    // Reset loaded state when chain changes
    if (loadedRef.current.chain !== selectedChain.blockchainRid) {
      loadedRef.current.loaded = false;
    }
    
    // Only load if we have an accountId and haven't loaded for this chain yet
    if (accountId && !loadedRef.current.loaded) {
      loadedRef.current = { chain: selectedChain.blockchainRid, loaded: true };
      void loadInitialPage();
    }
  }, [accountId, selectedChain.blockchainRid, loadInitialPage]);

  // Handle empty page navigation
  useEffect(() => {
    if (transfers.length === 0 && page > 0 && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      void loadPage('previous').finally(() => {
        isNavigatingRef.current = false;
      });
    }
  }, [transfers.length, page, loadPage]);

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

  function truncateBlockchainRid(rid: Buffer | null): string {
    if (!rid) return 'Unknown';
    return rid.toString('hex').slice(0, 8) + '...' + rid.toString('hex').slice(-8);
  }

  // Show loading state only on initial load
  if (isLoading && !loadedRef.current.loaded) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>;
  }

  // Only show empty state on initial load (page 0) with no transfers
  if (!accountId || (transfers.length === 0 && page === 0)) {
    return <EmptyState type="transfers" accountId={accountId} />;
  }

  // Determine if we can load more pages
  const canLoadMore = hasMore && transfers.length === PAGE_SIZE;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary mb-4">Transfer History</h2>
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
              className="p-3 rounded-lg bg-background-DEFAULT border border-border hover:border-border-hover transition-colors shadow-sm flex items-center gap-3"
            >
              {/* Transfer Type Icon */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                isReceived 
                  ? 'bg-status-success-bg text-status-success-text' 
                  : 'bg-status-error-bg text-status-error-text'
              }`}>
                {isExternal ? (
                  isReceived ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )
                ) : (
                  <ArrowLeftRight className="h-4 w-4" />
                )}
              </div>

              {/* NFT Image */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-background-light">
                {isLoadingCurrentMetadata ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-blue" />
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
                <p className="text-xs text-text-secondary truncate">{transfer.token.project.name} - {transfer.token.collection}</p>
                <h3 className="font-medium text-sm text-text-primary truncate">{name}</h3>
              </div>

              {/* Chain Info (if available) */}
              {isExternal ? (
                <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
                  <p className="text-xs text-text-secondary font-medium italic">Owner Changed</p>
                </div>
              ) : transfer.blockchain_rid && (
                <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
                  <p className="text-xs text-text-secondary font-medium truncate">{truncateBlockchainRid(transfer.blockchain_rid)}</p>
                </div>
              )}
            </div>
          );
        })}

        <PaginationControls
          page={page}
          isLoading={isLoading}
          hasMore={canLoadMore}
          onPageChange={async (direction) => {
            if (direction === 'next') {
              await loadPage('next');
            } else {
              await loadPage('previous');
            }
          }}
        />
      </div>
    </div>
  );
} 