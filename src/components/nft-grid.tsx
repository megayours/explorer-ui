'use client';

import { useEffect, useRef } from 'react';
import { useWalletNFTs } from '@/lib/hooks/use-wallet-nfts';
import { NFTCard } from './nft-card';
import { PaginationControls } from './pagination-controls';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useAccount } from 'wagmi';

export function NFTGrid() {
  const { nfts, isLoading, page, hasMore, loadPage, loadInitialPage } = useWalletNFTs();
  const { selectedChain } = useChain();
  const { isConnected } = useAccount();
  const loadedRef = useRef<{chain: string, loaded: boolean}>({ chain: '', loaded: false });

  useEffect(() => {
    // Only load if we haven't loaded for this chain yet
    if (isConnected && (!loadedRef.current.loaded || loadedRef.current.chain !== selectedChain.blockchainRid)) {
      loadedRef.current = { chain: selectedChain.blockchainRid, loaded: true };
      void loadInitialPage();
    }
  }, [isConnected, selectedChain.blockchainRid]); // Remove loadInitialPage from deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        Please connect your wallet to view your NFTs
      </div>
    );
  }

  if (nfts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        No NFTs found for this chain
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        hasMore={hasMore}
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