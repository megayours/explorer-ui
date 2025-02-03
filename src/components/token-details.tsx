'use client';

import { Loader2 } from 'lucide-react';
import { TransferHistoryEntry } from './transfer-history-entry';
import { CopyableId } from './copyable-id';
import { TokenMetadata } from '@megayours/sdk';
import { useNFT } from '@/lib/hooks/use-nft';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useTokenMetadata } from '@/lib/hooks/use-token-metadata';
import { useSpecificTokenTransferHistory } from '@/lib/hooks/use-transfer-history';
import { PaginationControls } from './pagination-controls';
import { JsonViewer } from './json-viewer';
import Image from 'next/image';
import { useOwnerships } from '@/lib/hooks/use-ownerships';
import Link from 'next/link';
import type { TokenBalance } from '@megayours/sdk';

const PAGE_SIZE = 10;
const OWNERSHIP_PAGE_SIZE = 5;

interface TokenDetailsProps {
  tokenUid: string;
}

function AttributeValue({ value }: { value: unknown }) {
  // If the value is an object or array, render it as JSON
  if (typeof value === 'object' && value !== null) {
    return <JsonViewer data={value} />;
  }

  const stringValue = String(value);

  // If it's a long string (more than 30 chars), make it copyable
  if (stringValue.length > 30) {
    return <CopyableId id={stringValue} />;
  }

  // For shorter strings, just display with truncation
  return (
    <div className="truncate" title={stringValue}>
      {stringValue}
    </div>
  );
}

function OwnershipEntry({ ownership }: { ownership: TokenBalance }) {
  const { selectedChain } = useChain();
  const accountId = ownership.account_id.toString('hex');
  const accountPageUrl = `/${selectedChain.blockchainRid}/account/${accountId}`;
  const accountAvatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${accountId}&backgroundColor=transparent`;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
      <div className="flex items-center gap-3">
        <Link
          href={accountPageUrl}
          className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-background-light border border-border hover:border-accent-blue hover:scale-105 transition-all"
          title={`View account ${accountId.slice(0, 6)}...${accountId.slice(-4)}`}
        >
          <img
            src={accountAvatarUrl}
            alt={`Avatar for ${accountId}`}
            className="w-full h-full"
          />
        </Link>
        <CopyableId id={accountId} />
      </div>
      <div className="text-sm font-medium text-text-primary">
        Balance: {ownership.amount.toString()}
      </div>
    </div>
  );
}

export function TokenDetails({ tokenUid }: TokenDetailsProps) {
  const { selectedChain } = useChain();
  const { data: token, isLoading: isLoadingToken } = useNFT(
    selectedChain.blockchainRid,
    tokenUid
  );

  const { data: metadata, isLoading: isLoadingMetadata } = useTokenMetadata(
    selectedChain.blockchainRid,
    token?.project,
    token?.collection ?? '',
    token?.id ?? BigInt(0)
  );

  const { 
    data: transfers, 
    isLoading: isLoadingTransfers,
    fetchNextPage: fetchTransfersNextPage,
    fetchPreviousPage: fetchTransfersPreviousPage,
    hasNextPage: hasTransfersNextPage,
    hasPreviousPage: hasTransfersPreviousPage,
    pageIndex: transfersPageIndex
  } = useSpecificTokenTransferHistory(selectedChain.blockchainRid, tokenUid, PAGE_SIZE);

  const { 
    data: ownerships, 
    isLoading: isLoadingOwnerships,
    fetchNextPage: fetchOwnershipsNextPage,
    fetchPreviousPage: fetchOwnershipsPreviousPage,
    hasNextPage: hasOwnershipsNextPage,
    hasPreviousPage: hasOwnershipsPreviousPage,
    pageIndex: ownershipsPageIndex
  } = useOwnerships(selectedChain.blockchainRid, token, OWNERSHIP_PAGE_SIZE);

  if (isLoadingToken) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-6">
        <p className="text-text-secondary">Token not found</p>
      </div>
    );
  }

  // Show loading state for metadata
  if (isLoadingMetadata) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const imageUrl = metadata?.properties?.image?.toString() || '/placeholder.svg?height=500&width=500';
  const name = metadata?.name || `${token.collection} #${token.id}`;
  const description = metadata?.properties?.description?.toString() || 'No description available';
  const attributes = Object.entries(metadata?.properties || {}).map(([trait_type, value]) => ({
    trait_type,
    value: value
  })).filter(attr => !['image', 'description'].includes(attr.trait_type)); // Exclude image and description from attributes display

  return (
    <div className="p-6 space-y-8">
      {/* Token Header */}
      <div className="flex items-start gap-6">
        {/* Token Image */}
        <div className="w-32 h-32 rounded-lg overflow-hidden bg-background-light flex-shrink-0">
          <Image
            src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
            alt={name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-primary truncate">
              {name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>{token.collection}</span>
              <span>•</span>
              <span>{token.project.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Token UID:</span>
              <CopyableId id={tokenUid} />
            </div>
          </div>
        </div>
      </div>

      {/* Token Ownerships */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Owners</h2>
          {ownerships?.data.length > 0 && (hasOwnershipsNextPage || hasOwnershipsPreviousPage || ownershipsPageIndex > 1) && (
            <PaginationControls
              page={ownershipsPageIndex}
              isLoading={isLoadingOwnerships}
              hasMore={hasOwnershipsNextPage}
              onPageChange={async (direction) => {
                if (direction === 'next') {
                  await fetchOwnershipsNextPage();
                } else {
                  await fetchOwnershipsPreviousPage();
                }
              }}
              variant="subtle"
            />
          )}
        </div>
        {isLoadingOwnerships ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
          </div>
        ) : !ownerships?.data.length ? (
          <div className="text-center py-4">
            <p className="text-text-secondary">No owners found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ownerships.data.map((ownership) => (
              <OwnershipEntry
                key={ownership.account_id.toString('hex')}
                ownership={ownership}
              />
            ))}
          </div>
        )}
      </div>

      {/* Token Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-primary">Description</h2>
        <p className="text-text-secondary">{description}</p>
      </div>

      {/* Token Attributes */}
      {attributes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Attributes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attributes.map(({ trait_type, value }, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-background-light border border-border"
              >
                <div className="text-xs text-text-tertiary truncate" title={trait_type}>{trait_type}</div>
                <div className="text-sm font-medium text-text-primary">
                  <AttributeValue value={value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Transfer History</h2>
          {transfers?.data.length > 0 && (hasTransfersNextPage || hasTransfersPreviousPage || transfersPageIndex > 1) && (
            <PaginationControls
              page={transfersPageIndex}
              isLoading={isLoadingTransfers}
              hasMore={hasTransfersNextPage}
              onPageChange={async (direction) => {
                if (direction === 'next') {
                  await fetchTransfersNextPage();
                } else {
                  await fetchTransfersPreviousPage();
                }
              }}
              variant="subtle"
            />
          )}
        </div>

        {isLoadingTransfers ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !transfers?.data.length && transfersPageIndex === 1 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">No transfers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers?.data.map((transfer) => (
              <TransferHistoryEntry
                key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
                transfer={transfer}
                displayAccountAvatar={false}
                currentAccountId={transfer.account_id.toString('hex')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
