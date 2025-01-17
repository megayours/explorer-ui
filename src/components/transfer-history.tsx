'use client';

import { useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { TransferHistory as TransferHistoryType, TokenMetadata } from '@megayours/sdk';
import { useGammaChain } from '@/lib/hooks/use-gamma-chain';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { PaginationControls } from '@/components/pagination-controls';

type TransferWithMetadata = TransferHistoryType & {
  metadata?: TokenMetadata;
};

function truncateBlockchainRid(rid: Buffer): string {
  const hex = rid.toString('hex');
  return `${hex.slice(0, 4)}...${hex.slice(-4)}`;
}

const PAGE_SIZE = 12;

export function TransferHistory() {
  const [actions] = useGammaChain();

  const {
    items: transfers,
    isLoading,
    hasMore,
    page,
    loadInitialPage,
    loadPage,
  } = usePaginatedData<TransferHistoryType, TransferWithMetadata>({
    pageSize: PAGE_SIZE,
    fetchInitialPage: (pageSize) => actions.getTransferHistory(pageSize),
    transformItem: async (transfer) => {
      try {
        const metadata = await actions.getMetadata(
          transfer.token.project,
          transfer.token.collection,
          transfer.token.id
        );

        if (metadata === null) {
          console.log('metadata is null', transfer.token.project, transfer.token.collection, transfer.token.id);
        }
        return { ...transfer, metadata: metadata ?? undefined };
      } catch (error) {
        console.error(`Failed to fetch metadata for token ${transfer.token.id}:`, error);
        return transfer;
      }
    },
  });

  useEffect(() => {
    void loadInitialPage();
  }, []);

  if (transfers.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex flex-col items-center px-8 py-6 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
          <div className="w-12 h-12 rounded-full bg-zinc-700/50 flex items-center justify-center mb-3">
            <span className="text-xl">📜</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Transfers</h3>
          <p className="text-zinc-400">No transfer history found</p>
        </div>
      </div>
    );
  }

  console.log('transfers', transfers);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Transfer History</h2>
      
      <div className="space-y-2">
        {transfers.map((transfer) => {
          const imageUrl = (transfer.metadata?.properties?.image as string) ?? '/placeholder.svg?height=500&width=500';
          
          return (
            <div
              key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}`}
              className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50 flex gap-3"
            >
              {/* NFT Image */}
              <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden">
                <Image
                  src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                  alt={transfer.token.name || `${transfer.token.collection} #${transfer.token.id.toString()}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Top Row - Type and Name */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    transfer.type === 'sent' 
                      ? 'bg-orange-400/10 text-orange-400' 
                      : 'bg-green-400/10 text-green-400'
                  }`}>
                    {transfer.type === 'sent' ? 'Sent' : 'Received'}
                  </span>
                  <span className="text-sm text-white font-medium truncate">
                    {transfer.metadata?.name || `${transfer.token.collection} #${transfer.token.id.toString()}`}
                  </span>
                </div>

                {/* Middle Row - Project and Collection */}
                <div className="text-xs text-zinc-400 mb-0.5 truncate">
                  {transfer.token.project.name} • {transfer.token.collection}
                </div>

                {/* Bottom Row - Chain and Amount */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="truncate">
                    {transfer.blockchain_rid 
                      ? `Chain: ${truncateBlockchainRid(transfer.blockchain_rid)}`
                      : 'Internal transfer'
                    }
                  </div>
                  <div className="shrink-0 ml-2">
                    Amount: {transfer.amount.toString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        page={page}
        isLoading={isLoading}
        hasMore={hasMore}
        onPageChange={loadPage}
      />
    </div>
  );
} 