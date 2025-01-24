"use client";

import { useEffect } from "react";
import type { TokenBalance, TokenMetadata } from "@megayours/sdk";
import { Navbar } from '@/components/navbar';
import { NFTCard } from '@/components/nft-card';
import { TransferHistory } from '@/components/transfer-history';
import type { NFT } from '@/types/nft';
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useWalletNFTs } from "@/lib/hooks/use-wallet-nfts";
import { usePaginatedData } from "@/lib/hooks/use-paginated-data";
import { PaginationControls } from "@/components/pagination-controls";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { selectedChain } = useChain();
  const { fetchNFTs, isLoading: isWalletLoading } = useWalletNFTs();

  const {
    items: nfts,
    isLoading,
    hasMore,
    page,
    loadInitialPage,
    loadPage,
  } = usePaginatedData<TokenBalance>({
    pageSize: PAGE_SIZE,
    fetchInitialPage: async (pageSize) => {
      const paginator = await fetchNFTs(pageSize);
      if (!paginator) {
        throw new Error('Failed to fetch NFTs');
      }
      return paginator;
    },
  });

  useEffect(() => {
    if (!isConnected) {
      router.replace('/');
      return;
    }
    void loadInitialPage();
  }, [isConnected, selectedChain.blockchainRid]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 2xl:max-w-[1800px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Your NFTs</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 pb-12">
              {nfts.map((nft) => (
                <NFTCard 
                  key={`${nft.collection}-${nft.token_id}`}
                  nft={nft} 
                  onRefresh={loadInitialPage}
                  onTransferSuccess={loadInitialPage}
                />
              ))}
            </div>

            {nfts.length === 0 && !isLoading && (
              <div className="text-center py-24">
                <div className="inline-flex flex-col items-center px-12 py-8 rounded-2xl bg-zinc-800/30 border border-zinc-700/50">
                  <div className="w-16 h-16 rounded-full bg-zinc-700/50 flex items-center justify-center mb-4">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
                  <p className="text-zinc-400">No NFTs found in your collection</p>
                </div>
              </div>
            )}

            <PaginationControls
              page={page}
              isLoading={isLoading || isWalletLoading}
              hasMore={hasMore}
              onPageChange={loadPage}
            />
          </div>

          {/* Transfer History */}
          <div className="lg:border-l lg:border-zinc-800/50 lg:pl-8">
            <TransferHistory />
          </div>
        </div>
      </main>
    </div>
  );
}
