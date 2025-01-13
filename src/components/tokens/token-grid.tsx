"use client";

import { useEffect, useRef, useState } from "react";
import type { TokenBalance, Paginator } from "@megayours/sdk";
import { useGammaChain } from "@/lib/chromia-connect/hooks/use-gamma-chain";

function TokenCard({ token }: { token: TokenBalance }) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [actions] = useGammaChain();

  const handleTransfer = async () => {
    const blockchainRid = prompt("Enter the target blockchain RID:");
    if (!blockchainRid) return;

    try {
      setIsTransferring(true);
      await actions.transferToken(
        blockchainRid,
        token.project,
        token.collection,
        token.token_id
      );
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed. Check console for details.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">{token.project.name}</h3>
        <div className="space-y-1 text-sm text-gray-400">
          <p>Collection: {token.collection}</p>
          <p>Token ID: {String(token.token_id)}</p>
          <p>Type: {token.type}</p>
          <p>Amount: {String(token.amount)}</p>
        </div>
        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
        >
          {isTransferring ? "Transferring..." : "Transfer"}
        </button>
      </div>
    </div>
  );
}

export function TokenGrid() {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actions] = useGammaChain();
  const paginatorRef = useRef<Paginator<TokenBalance> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadMoreTokens = async () => {
    // Use ref to prevent concurrent loads
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

      console.log('Received data:', paginator.data);

      if (paginator.data.length === 0) {
        console.log('No more data, setting hasMore to false');
        setHasMore(false);
        return;
      }

      setTokens(prev => {
        // Create a map of existing tokens for faster lookup
        const existingTokens = new Map(
          prev.map(token => [`${token.collection}-${String(token.token_id)}`, token])
        );

        // Filter out duplicates
        const newTokens = paginator.data.filter(token => 
          !existingTokens.has(`${token.collection}-${String(token.token_id)}`)
        );

        console.log(`Adding ${newTokens.length} new tokens to existing ${prev.length} tokens`);
        return [...prev, ...newTokens];
      });

      paginatorRef.current = paginator;
    } catch (error) {
      console.error('Failed to load tokens:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Initial load
    void loadMoreTokens();

    // Cleanup
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
          void loadMoreTokens();
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

  if (tokens.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No tokens found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tokens.map((token) => {
          const key = `${token.collection}-${String(token.token_id)}`;
          return (
            <TokenCard 
              key={key}
              token={token} 
            />
          );
        })}
      </div>
      
      {hasMore && (
        <div 
          ref={loadingRef} 
          className="py-4 text-center"
        >
          {isLoading ? (
            <div className="animate-pulse text-gray-400">
              Loading more tokens...
            </div>
          ) : (
            <div className="text-gray-400">
              Scroll to load more
            </div>
          )}
        </div>
      )}
    </div>
  );
} 