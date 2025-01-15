"use client";

import { useEffect, useRef, useState } from "react";
import type { TokenBalance, Paginator, TokenMetadata } from "@megayours/sdk";
import { useGammaChain } from "@/lib/hooks/use-gamma-chain";
import { Navbar } from '@/components/navbar';
import { NFTCard } from '@/components/nft-card';
import type { NFT } from '@/types/nft';
import { useChromia } from "@/lib/chromia-connect/chromia-context";

function mapTokenToNFT(token: TokenBalance, metadata?: TokenMetadata): NFT {
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

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700/50">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-zinc-500 border-t-white rounded-full" />
            <span className="text-zinc-400">Initializing connection...</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24">
          <div className="inline-flex flex-col items-center px-12 py-8 rounded-2xl bg-zinc-800/30 border border-zinc-700/50">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
            <p className="text-red-400">{error.message}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function NFTDashboard() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actions] = useGammaChain();
  const paginatorRef = useRef<Paginator<TokenBalance> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const fetchMetadata = async (token: TokenBalance): Promise<NFT> => {
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
  };

  const loadMoreNFTs = async () => {
    if (isLoadingRef.current || !hasMore) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      
      let paginator: Paginator<TokenBalance>;
      
      if (paginatorRef.current) {
        console.log('Fetching next page...');
        paginator = await paginatorRef.current.fetchNext();
      } else {
        console.log('Fetching first page...');
        paginator = await actions.getTokens();
      }

      if (paginator.data.length === 0) {
        console.log('No more data, setting hasMore to false');
        setHasMore(false);
        return;
      }

      const nftsWithMetadata = await Promise.all(
        paginator.data.map(fetchMetadata)
      );

      setNfts(prev => {
        const existingNFTs = new Map(
          prev.map(nft => [nft.id, nft])
        );

        const newNFTs = nftsWithMetadata.filter(nft => 
          !existingNFTs.has(nft.id)
        );

        return [...prev, ...newNFTs];
      });

      paginatorRef.current = paginator;
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    void loadMoreNFTs();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          void loadMoreNFTs();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadingRef.current]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Your NFT Collection
          </h1>
          <p className="mt-2 text-center text-zinc-400">
            Discover and manage your digital assets
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
        
        {hasMore && (
          <div 
            ref={loadingRef} 
            className="py-12 text-center"
          >
            {isLoading ? (
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-zinc-500 border-t-white rounded-full" />
                <span className="text-zinc-400">Loading more NFTs...</span>
              </div>
            ) : (
              <div className="text-zinc-500">
                Scroll to load more
              </div>
            )}
          </div>
        )}

        {!hasMore && nfts.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex flex-col items-center px-12 py-8 rounded-2xl bg-zinc-800/30 border border-zinc-700/50">
              <div className="w-16 h-16 rounded-full bg-zinc-700/50 flex items-center justify-center mb-4">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
              <p className="text-zinc-400">Connect your wallet to view your NFT collection</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const { chromiaSession } = useChromia();
  const [actions, state] = useGammaChain();

  if (!state.isInitialized || !chromiaSession) {
    return <LoadingState />;
  }

  if (state.error) {
    return <ErrorState error={state.error} />;
  }

  return <NFTDashboard />;
}
