import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Paginator } from '@megayours/sdk';
import { useState } from 'react';

export function usePaginator<T>(
  queryKey: readonly unknown[],
  fetchFirstPage: () => Promise<Paginator<T>>,
  options?: Omit<UseQueryOptions<Paginator<T>, Error>, 'queryKey' | 'queryFn'>
) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Paginator<T>[]>([]);
  const [isLastPage, setIsLastPage] = useState(false);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchFirstPage();
      setPages([result]);
      setPage(1);
      setIsLastPage(!result.data.length || result.data.length < 10); // Assuming pageSize is 10
      return result;
    },
    ...options
  });

  const fetchNextPage = async () => {
    const currentPaginator = pages[pages.length - 1];
    if (currentPaginator && !isLastPage) {
      const nextPage = await currentPaginator.fetchNext();
      if (nextPage) {
        const isLast = !nextPage.data.length || nextPage.data.length < 10;
        setIsLastPage(isLast);
        setPages([...pages, nextPage]);
        setPage(p => p + 1);
      }
    }
  };

  const fetchPreviousPage = async () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const currentPaginator = pages[page - 1];
  const hasNextPage = !isLastPage && currentPaginator?.data.length === 10;
  const hasPreviousPage = page > 1;

  return {
    ...query,
    data: currentPaginator,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    pageIndex: page
  };
} 