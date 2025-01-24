'use client';

import { useRef, useState } from 'react';
import { Paginator } from '@megayours/sdk';

interface UsePaginatedDataOptions<T> {
  pageSize: number;
  fetchInitialPage: (pageSize: number) => Promise<Paginator<T>>;
}

interface UsePaginatedDataResult<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  loadInitialPage: () => Promise<void>;
  loadPage: (direction: 'next' | 'previous') => Promise<void>;
}

export function usePaginatedData<T>({
  pageSize,
  fetchInitialPage,
}: UsePaginatedDataOptions<T>): UsePaginatedDataResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const paginatorRef = useRef<Paginator<T> | null>(null);
  const paginatorHistoryRef = useRef<Paginator<T>[]>([]);
  const isLoadingRef = useRef(false);

  const loadInitialPage = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      
      const paginator = await fetchInitialPage(pageSize);

      setItems(paginator.data);
      setHasMore(paginator.data.length === pageSize);
      paginatorRef.current = paginator;
      paginatorHistoryRef.current = [paginator];
    } catch (error) {
      console.error('Failed to load initial page:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const loadPage = async (direction: 'next' | 'previous') => {
    if (isLoadingRef.current) return;
    if (direction === 'next' && !hasMore) return;
    if (direction === 'previous' && page === 1) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      
      let paginator: Paginator<T>;
      
      if (direction === 'next' && paginatorRef.current) {
        paginator = await paginatorRef.current.fetchNext();
        console.log(`Data received on page: `, paginator.data);
        paginatorHistoryRef.current.push(paginator);
      } else if (direction === 'previous') {
        // Remove current paginator from history
        paginatorHistoryRef.current.pop();
        // Get the previous paginator
        paginator = paginatorHistoryRef.current[paginatorHistoryRef.current.length - 1];
      } else {
        // Initial load or reset
        paginator = await fetchInitialPage(pageSize);
        paginatorHistoryRef.current = [paginator];
      }

      setItems(paginator.data);
      setHasMore(paginator.data.length === pageSize);
      paginatorRef.current = paginator;
      
      if (direction === 'next') {
        setPage(prev => prev + 1);
      } else if (direction === 'previous') {
        setPage(prev => prev - 1);
      }
    } catch (error) {
      console.error('Failed to load page:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  return {
    items,
    isLoading,
    hasMore,
    page,
    loadInitialPage,
    loadPage,
  };
} 