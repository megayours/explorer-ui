"use client";

import { useEffect } from "react";
import type { TokenBalance, TokenMetadata } from "@megayours/sdk";
import { useGammaChain } from "@/lib/hooks/use-gamma-chain";
import { Navbar } from '@/components/navbar';
import { NFTCard } from '@/components/nft-card';
import { TransferHistory } from '@/components/transfer-history';
import type { NFT } from '@/types/nft';
import { useChain } from "@/lib/chain-switcher/chain-context";
import { withAuth } from "@/lib/auth/protected-route";
import { usePaginatedData } from "@/lib/hooks/use-paginated-data";
import { PaginationControls } from "@/components/pagination-controls";

function mapTokenToNFT(token: TokenBalance, metadata?: TokenMetadata): NFT {
  console.log(metadata);
  return {
    id: `${token.collection}-${String(token.token_id)}`,
    projectName: token.project.name,
    collectionName: token.collection,
    tokenId: token.token_id.toString(),
    name: metadata?.name ?? `${token.collection} #${token.token_id.toString()}`,
    imageUrl: (metadata?.properties?.image as string) ?? '/placeholder.svg?height=500&width=500',
    properties: metadata?.properties ?? {},
    project: token.project,
  };
}

const PAGE_SIZE = 6;

function DashboardContent() {
  const [actions] = useGammaChain();
  const { selectedChain } = useChain();

  const {
    items: nfts,
    isLoading,
    hasMore,
    page,
    loadInitialPage,
    loadPage,
  } = usePaginatedData<TokenBalance, NFT>({
    pageSize: PAGE_SIZE,
    fetchInitialPage: (pageSize) => actions.getTokens(pageSize),
    transformItem: async (token) => {
      try {
        const metadata = await actions.getMetadata(
          token.project,
          token.collection,
          token.token_id
        );
        return mapTokenToNFT(token, metadata ?? undefined);
      } catch (error) {
        console.error(`Failed to fetch metadata for token ${token.token_id}:`, error);
        return mapTokenToNFT(token);
      }
    },
  });

  useEffect(() => {
    void loadInitialPage();
  }, [selectedChain.blockchainRid]);

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
                  key={nft.id} 
                  nft={nft} 
                  onRefresh={loadInitialPage}
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
              isLoading={isLoading}
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

export default withAuth(DashboardContent);
