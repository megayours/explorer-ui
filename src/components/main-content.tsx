'use client';

import { NFTGrid } from './nft-grid';
import { TransferHistory } from './transfer-history';
import { AccountHeader } from './account-header';

export function MainContent({ accountId }: { accountId: string | null }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {accountId && <AccountHeader accountId={accountId} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NFTGrid accountId={accountId} />
        </div>
        <div>
          <TransferHistory accountId={accountId} />
        </div>
      </div>
    </div>
  );
}