'use client';

import { useEffect, useState } from 'react';
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { useTransferHistory } from '@/lib/hooks/use-transfer-history';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useTokenMetadata } from '@/lib/hooks/use-token-metadata';
import { PaginationControls } from './pagination-controls';
import { TransferHistoryEntry } from './transfer-history-entry';

const PAGE_SIZE = 10;

function TransferItem({ transfer, accountId }: { transfer: any, accountId: string | null }) {
  const { selectedChain } = useChain();
  const { data: metadata, isLoading: isLoadingMetadata } = useTokenMetadata(
    selectedChain.blockchainRid,
    transfer.token.project,
    transfer.token.collection,
    transfer.token.id
  );

  const isExternal = !transfer.blockchain_rid;
  const isIncoming = Buffer.from(transfer.account_id).toString('hex') === accountId;
  const imageUrl = metadata?.properties?.image?.toString() || '/placeholder.svg?height=500&width=500';
  const name = metadata?.name || `${transfer.token.collection} #${transfer.token.id}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
      {/* Transfer Icon */}
      <div className={`p-2 rounded-lg ${
        isExternal ? 'bg-secondary/10 text-secondary' :
        isIncoming ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
      }`}>
        {isExternal ? (
          <ArrowLeftRight className="h-4 w-4" />
        ) : isIncoming ? (
          <ArrowDownLeft className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </div>

      {/* NFT Image */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-background-light">
        {isLoadingMetadata ? (
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
        <p className="text-xs text-text-secondary truncate">
          {transfer.token.project.name} - {transfer.token.collection}
        </p>
        <h3 className="font-medium text-sm text-text-primary truncate">{name}</h3>
      </div>

      {/* Chain Info (if available) */}
      {isExternal ? (
        <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
          <p className="text-xs text-text-secondary font-medium italic">Owner Changed</p>
        </div>
      ) : transfer.blockchain_rid && (
        <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
          <p className="text-xs text-text-secondary font-medium truncate">
            {truncateBlockchainRid(transfer.blockchain_rid.toString('hex'))}
          </p>
        </div>
      )}
    </div>
  );
}

export function TransferHistory({ accountId }: { accountId: string | null }) {
  const { selectedChain } = useChain();
  const {
    data: transfers,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    pageIndex
  } = useTransferHistory(selectedChain.blockchainRid, accountId, PAGE_SIZE);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show empty state only if we have no data and it's the first page
  if (!transfers?.data.length && pageIndex === 1) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No transfers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show transfers if we have any */}
      <div className="space-y-4">
        {transfers?.data.map((transfer) => (
          <TransferHistoryEntry
          key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
          transfer={transfer}
          displayAccountAvatar={false}
        />
        ))}
      </div>

      {/* Always show pagination controls if we're not on the first empty page */}
      <PaginationControls
        page={pageIndex}
        isLoading={isLoading}
        hasMore={hasNextPage}
        onPageChange={async (direction) => {
          if (direction === 'next') {
            await fetchNextPage();
          } else {
            await fetchPreviousPage();
          }
        }}
      />
    </div>
  );
}

function truncateBlockchainRid(rid: string) {
  if (rid.length <= 12) return rid;
  return `${rid.slice(0, 6)}...${rid.slice(-6)}`;
} 