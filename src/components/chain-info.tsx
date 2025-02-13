'use client';

import { Loader2, ExternalLink } from 'lucide-react';
import { useChainInfo } from '@/lib/hooks/use-chain-info';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { useEffect, useCallback } from 'react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import Link from 'next/link';
import { CopyableId } from '@/components/copyable-id';
import { Button } from './ui/button';
import { TransferHistoryEntry } from './transfer-history-entry';
import { PaginationControls } from './pagination-controls';
import { env } from '@/env';

const PAGE_SIZE = 10;

interface ChainInfoProps {
  fullWidth?: boolean;
}

function ChainDetails() {
  const { selectedChain } = useChain();

  return (
    <div className="space-y-4">
      {/* Header with Visit Dapp button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary mb-1">Chain Details</h3>
        {selectedChain.dappUrl && (
          <Button variant="secondary" size="sm" asChild>
            <Link href={selectedChain.dappUrl} target="_blank" rel="noopener noreferrer">
              Visit Dapp
            </Link>
          </Button>
        )}
      </div>

      {/* Chain details content */}
      <div className="space-y-2">
        {selectedChain.name && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Name:</span>
            <span className="text-sm font-medium text-text-primary">{selectedChain.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">RID:</span>
          <CopyableId id={selectedChain.blockchainRid} />
        </div>
      </div>
    </div>
  );
}

export function ChainInfo({ fullWidth = false }: ChainInfoProps) {
  const { modules, isLoadingModules, fetchTransferHistory } = useChainInfo();

  const fetchPage = useCallback(async () => {
    return await fetchTransferHistory(PAGE_SIZE);
  }, [fetchTransferHistory]);

  const {
    items: transfers,
    isLoading: isLoadingTransfers,
    loadInitialPage,
    loadPage,
    page,
    hasMore
  } = usePaginatedData({
    pageSize: PAGE_SIZE,
    fetchInitialPage: fetchPage,
  });

  // Load initial page when component mounts
  useEffect(() => {
    void loadInitialPage();
  }, [loadInitialPage]);

  if (isLoadingModules && isLoadingTransfers) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (fullWidth) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-6">
            <ChainDetails />
            {/* Modules Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Supported Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {modules.map((module, index) => (
                    <a
                      key={index}
                      href={`${env.NEXT_PUBLIC_MEGA_CHAIN_DASHBOARD_URL}/module/${module}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md 
                                bg-secondary/10 text-secondary border border-secondary/20 
                                hover:bg-secondary/20 hover:border-secondary/30 transition-all duration-200"
                    >
                      {module}
                      <ExternalLink className="h-3 w-3 text-secondary/70" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Global Transfers */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Recent Chain Activity</h3>
            {transfers.length > 0 && (hasMore || page > 1) && (
              <PaginationControls
                page={page}
                isLoading={isLoadingTransfers}
                hasMore={hasMore}
                onPageChange={async (direction) => {
                  await loadPage(direction);
                }}
                variant="subtle"
              />
            )}
          </div>
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <TransferHistoryEntry
                key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
                transfer={transfer}
                currentAccountId={transfer.account_id.toString('hex')}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-2">
        <div className="space-y-4">
          <ChainDetails />
          {/* Modules Section */}
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Supported Modules</h3>
              <div className="flex flex-wrap gap-2">
                {modules.map((module, index) => (
                  <a
                    key={index}
                    href={`${env.NEXT_PUBLIC_MEGA_CHAIN_DASHBOARD_URL}/module/${module}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md 
                              bg-secondary/10 text-secondary border border-secondary/20 
                              hover:bg-secondary/20 hover:border-secondary/30 transition-all duration-200"
                  >
                    {module}
                    <ExternalLink className="h-3 w-3 text-secondary/70" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Global Transfers */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Recent Chain Activity</h3>
          {transfers.length > 0 && (hasMore || page > 1) && (
            <PaginationControls
              page={page}
              isLoading={isLoadingTransfers}
              hasMore={hasMore}
              onPageChange={async (direction) => {
                await loadPage(direction);
              }}
              variant="subtle"
            />
          )}
        </div>
        <div className="space-y-3">
          {transfers.map((transfer) => (
            <TransferHistoryEntry
              key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
              transfer={transfer}
              currentAccountId={transfer.account_id.toString('hex')}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 