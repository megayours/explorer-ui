'use client';

import { WalletProtectedContent } from './wallet-protected-content';
import { NFTGrid } from './nft-grid';
import { TransferHistory } from './transfer-history';
import { useAccount } from 'wagmi';
import { ConnectButton } from './connect-button';

export function MainContent() {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Connect your wallet to view content
          </h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WalletProtectedContent>
              <NFTGrid />
            </WalletProtectedContent>
          </div>
          <div>
            <WalletProtectedContent>
              <TransferHistory />
            </WalletProtectedContent>
          </div>
        </div>
      )}
    </div>
  );
} 