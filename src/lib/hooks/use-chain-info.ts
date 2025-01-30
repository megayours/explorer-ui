'use client';

import { useCallback, useEffect, useState } from 'react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { createMegaYoursQueryClient, TransferHistory, Paginator } from '@megayours/sdk';

export function useChainInfo() {
  const { chainClient } = useChain();
  const [modules, setModules] = useState<string[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!chainClient) return;

    setIsLoadingModules(true);
    try {
      const queryClient = createMegaYoursQueryClient(chainClient);
      const supportedModules = await queryClient.getSupportedModules();
      setModules(supportedModules);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    } finally {
      setIsLoadingModules(false);
    }
  }, [chainClient]);

  const fetchTransferHistory = useCallback(async (pageSize: number): Promise<Paginator<TransferHistory>> => {
    if (!chainClient) {
      return {
        data: [],
        fetchNext: () => Promise.resolve(null as unknown as Paginator<TransferHistory>)
      } as Paginator<TransferHistory>;
    }

    const queryClient = createMegaYoursQueryClient(chainClient);
    return queryClient.getAllTransferHistory(undefined, pageSize);
  }, [chainClient]);

  useEffect(() => {
    void fetchModules();
  }, [fetchModules]);

  return {
    modules,
    isLoadingModules,
    fetchTransferHistory
  };
} 