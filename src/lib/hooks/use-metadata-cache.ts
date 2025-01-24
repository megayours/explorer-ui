'use client';

import { TokenMetadata } from '@megayours/sdk';

interface CacheEntry {
  metadata: TokenMetadata | null;
  timestamp: number;
}

interface CacheMap {
  [key: string]: CacheEntry;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const cache: CacheMap = {};

export function useMetadataCache() {
  const getCacheKey = (chainRid: string, collection: string, tokenId: bigint) => {
    return `${chainRid}:${collection}:${tokenId}`;
  };

  const getMetadata = (chainRid: string, collection: string, tokenId: bigint): TokenMetadata | null | undefined => {
    const key = getCacheKey(chainRid, collection, tokenId);
    const entry = cache[key];

    if (!entry) return undefined;

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      delete cache[key];
      return undefined;
    }

    return entry.metadata;
  };

  const setMetadata = (chainRid: string, collection: string, tokenId: bigint, metadata: TokenMetadata | null) => {
    const key = getCacheKey(chainRid, collection, tokenId);
    cache[key] = {
      metadata,
      timestamp: Date.now()
    };
  };

  return {
    getMetadata,
    setMetadata
  };
} 