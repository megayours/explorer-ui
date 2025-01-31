'use client';

import { useNFTs } from '@/lib/hooks/use-nfts';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { PaginationControls } from './pagination-controls';
import { NFTCard } from './nft-card';
import { useEffect, useState } from 'react';
import { useAccountId } from '@/lib/hooks/use-account.id';
import { useAccount } from 'wagmi';

interface NFTGridProps {
  accountId: string | null;
  className?: string;
}

export function NFTGrid({ accountId, className }: NFTGridProps) {
  const { selectedChain } = useChain();
  const { address } = useAccount();

  const {
    data: nfts,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    pageIndex,
    refetch
  } = useNFTs(selectedChain.blockchainRid, accountId);

  const { getAccountId } = useAccountId();
  const [signedInAccountId, setSignedInAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    
    // Get the accountId for the connected wallet
    getAccountId().then((id) => {
      const newAccountId = id?.toString('hex') ?? null;
      setSignedInAccountId(newAccountId);
    });
  }, [getAccountId, address]);

  useEffect(() => {
    console.log(`NFTs: ${nfts?.data.length}`);
  }, [nfts])

  if (!accountId || !selectedChain.blockchainRid) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show empty state only if we have no data and it's the first page
  if (!nfts?.data.length && pageIndex === 1) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No tokens found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Tokens</h2>
        {nfts?.data.length > 0 && (hasNextPage || hasPreviousPage || pageIndex > 1) && (
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
            variant="subtle"
          />
        )}
      </div>

      {/* Show NFTs if we have any */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nfts?.data.map((nft) => (
          <NFTCard
            key={`${nft.project.blockchain_rid}-${nft.token_id}`}
            nft={nft}
            onRefresh={refetch}
            onTransferSuccess={refetch}
            isOwner={accountId === signedInAccountId}
          />
        ))}
      </div>
    </div> 
  );
} 