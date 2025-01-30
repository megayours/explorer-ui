'use client';

import { ScrollText, Wallet2, Image } from 'lucide-react';

interface EmptyStateProps {
  type: 'nfts' | 'transfers';
  accountId: string | null;
}

export function EmptyState({ type, accountId }: EmptyStateProps) {
  const config = {
    nfts: {
      icon: <Image className="h-6 w-6 text-zinc-600" />,
      connectMessage: 'Connect your wallet to view your NFTs',
      emptyMessage: 'No NFTs found for this account',
    },
    transfers: {
      icon: <ScrollText className="h-6 w-6 text-zinc-600" />,
      connectMessage: 'Connect your wallet to view your transfer history',
      emptyMessage: 'No transfer history found',
    },
  };

  const { icon, connectMessage, emptyMessage } = config[type];

  if (!accountId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
          <Wallet2 className="h-6 w-6 text-zinc-600" />
        </div>
        <h3 className="text-base font-medium text-white mb-1">Connect Wallet</h3>
        <p className="text-sm text-zinc-400">{connectMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium text-white mb-1">No {type === 'nfts' ? 'NFTs' : 'Transfers'}</h3>
      <p className="text-sm text-zinc-400">{emptyMessage}</p>
    </div>
  );
} 