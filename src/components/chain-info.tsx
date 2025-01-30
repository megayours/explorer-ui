'use client';

import { Loader2 } from 'lucide-react';
import { useChainInfo } from '@/lib/hooks/use-chain-info';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { useTokenMetadata } from '@/lib/hooks/use-token-metadata';
import { useState, useEffect, useCallback } from 'react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import Link from 'next/link';
import { CopyableId } from '@/components/copyable-id';

const PAGE_SIZE = 10;

interface ChainInfoProps {
  fullWidth?: boolean;
}

function TransferActivityItem({ transfer }: { transfer: any }) {
  const { selectedChain } = useChain();
  const { data: metadata, isLoading: isLoadingMetadata } = useTokenMetadata(
    selectedChain.blockchainRid,
    transfer.token.project,
    transfer.token.collection,
    transfer.token.id
  );

  const name = metadata?.name || `${transfer.token.collection} #${transfer.token.id}`;
  const imageUrl = metadata?.properties?.image?.toString() || '/placeholder.svg?height=500&width=500';
  const accountId = transfer.account_id.toString('hex');
  const accountPageUrl = `/${selectedChain.blockchainRid}/${accountId}`;
  const accountAvatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${accountId}&backgroundColor=transparent`;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors">
      {/* NFT Image */}
      <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-background-light">
        {isLoadingMetadata ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-accent-blue" />
          </div>
        ) : (
          <img
            src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
            alt={name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* NFT Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{name}</p>
        <p className="text-xs text-text-secondary truncate">{transfer.token.collection}</p>
      </div>

      {/* Account Avatar */}
      <Link 
        href={accountPageUrl}
        className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-background-light border border-border hover:border-accent-blue hover:scale-110 transition-all"
        title={`View account ${accountId.slice(0, 6)}...${accountId.slice(-4)}`}
      >
        <img
          src={accountAvatarUrl}
          alt={`Avatar for ${accountId}`}
          className="w-full h-full"
        />
      </Link>
    </div>
  );
}

function ChainDetails() {
  const { selectedChain } = useChain();

  return (
    <div className="space-y-4">
      <div>
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
    loadPage
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
          <h2 className="text-xl font-semibold text-primary mb-4">Chain Information</h2>
          <div className="space-y-6">
            <ChainDetails />
            {/* Modules Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Supported Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {modules.map((module, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium rounded-md bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Global Transfers */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Chain Activity</h3>
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <TransferActivityItem
                key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
                transfer={transfer}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Chain Information</h2>
        <div className="space-y-6">
          <ChainDetails />
          {/* Modules Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Supported Modules</h3>
              <div className="flex flex-wrap gap-2">
                {modules.map((module, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-secondary/10 text-secondary border border-secondary/20"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Global Transfers */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Recent Chain Activity</h3>
        <div className="space-y-3">
          {transfers.map((transfer) => (
            <TransferActivityItem
              key={`${transfer.token.collection}-${transfer.token.id}-${transfer.op_index}-${Math.random() * 10000}`}
              transfer={transfer}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 