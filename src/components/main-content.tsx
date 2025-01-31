'use client';

import { NFTGrid } from './nft-grid';
import { TransferHistory } from './transfer-history';
import { AccountHeader } from './account-header';
import { ChainInfo } from './chain-info';
import { useChain } from '@/lib/chain-switcher/chain-context';

export function MainContent({ accountId }: { accountId: string | null }) {
  if (!accountId) {
    return (
      <div className="mx-8 py-8">
        <ChainInfo fullWidth />
      </div>
    );
  }

  return (
    <div className="mx-8 py-8">
      <div className="space-y-8 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-8">
        {/* Chain Information */}
        <div className="xl:col-span-4">
          <div className="xl:sticky xl:top-24">
            <div className="bg-card border border-border rounded-xl p-6">
              <ChainInfo />
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="xl:col-span-8 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Account Header */}
          <AccountHeader accountId={accountId} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* NFTs */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-xl font-semibold text-primary">Tokens</h2>
              <NFTGrid accountId={accountId} />
            </div>

            {/* Transfer History */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-xl font-semibold text-primary">Transfer History</h2>
              <TransferHistory accountId={accountId} />
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}