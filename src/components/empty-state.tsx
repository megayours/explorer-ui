'use client';

import { Wallet, Image, ArrowLeftRight } from 'lucide-react';
import { colors } from '@/lib/theme';

interface EmptyStateProps {
  type: 'nfts' | 'transfers';
  accountId: string | null;
}

export function EmptyState({ type, accountId }: EmptyStateProps) {
  const Icon = type === 'nfts' ? Image : ArrowLeftRight;
  const title = accountId
    ? `No ${type === 'nfts' ? 'NFTs' : 'transfers'} found`
    : 'Connect your wallet';
  const description = accountId
    ? `No ${type === 'nfts' ? 'NFTs' : 'transfers'} found for this account on the selected chain.`
    : 'Connect your wallet to view your NFTs and transfer history.';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-border bg-background-light">
      <div className="w-12 h-12 rounded-full bg-background-DEFAULT border border-border flex items-center justify-center mb-4">
        {accountId ? (
          <Icon className="h-6 w-6 text-text-secondary" />
        ) : (
          <Wallet className="h-6 w-6 text-text-secondary" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm">{description}</p>
    </div>
  );
} 