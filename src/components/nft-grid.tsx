'use client';

import { useEffect, useRef } from 'react';
import { useWalletNFTs } from '@/lib/hooks/use-wallet-nfts';
import { NFTCard } from './nft-card';
import { PaginationControls } from './pagination-controls';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { EmptyState } from './empty-state';

export function NFTGrid({ accountId }: { accountId: string | null }) {
  const { nfts, isLoading, page, hasMore, loadPage, loadInitialPage } = useWalletNFTs(accountId);
  const { selectedChain } = useChain();
  const loadedRef = useRef<{chain: string, loaded: boolean}>({ chain: '', loaded: false });

  useEffect(() => {
    // Reset loaded state when chain or accountId changes
    if (loadedRef.current.chain !== selectedChain.blockchainRid) {
      loadedRef.current.loaded = false;
    }
    
    // Only load if we have an accountId and haven't loaded for this chain yet
    if (accountId && !loadedRef.current.loaded) {
      loadedRef.current = { chain: selectedChain.blockchainRid, loaded: true };
      void loadInitialPage();
    }

    // Handle navigation to empty pages
    if (nfts.length === 0 && page > 0) {
      void loadPage('previous');
    }
  }, [accountId, selectedChain.blockchainRid, loadInitialPage, nfts.length, page, loadPage]);

  // Show loading state only on initial load
  if (isLoading && !loadedRef.current.loaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Only show empty state on initial load with no NFTs
  if (!accountId || (nfts.length === 0 && page === 0)) {
    return <EmptyState type="nfts" accountId={accountId} />;
  }

  // Determine if we can load more pages
  const canLoadMore = hasMore && nfts.length === 10; // We know each page should have 10 items

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Tokens</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nfts.map((nft) => (
          <NFTCard
            key={`${nft.project.blockchain_rid}-${nft.token_id}`}
            nft={nft}
            onRefresh={loadInitialPage}
            onTransferSuccess={loadInitialPage}
          />
        ))}
      </div>

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
  );
} 