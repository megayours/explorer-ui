'use client';

import { NFTGrid } from './nft-grid';
import { TransferHistory } from './transfer-history';
import { AccountHeader } from './account-header';
import { ChainInfo } from './chain-info';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function MintBanner() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [canMint, setCanMint] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle mounting state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address) return;

    const checkMintStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/demo/mint/${address}`);
        const data = await response.json();
        setCanMint(data.canMint);
        setError(null);
      } catch (err) {
        console.error('Error checking mint status:', err);
        setError('Failed to check mint status');
      } finally {
        setIsLoading(false);
      }
    };

    void checkMintStatus();
  }, [mounted, address]);

  const handleMint = async () => {
    if (!address || !canMint) return;

    try {
      setIsMinting(true);
      const response = await fetch(`/api/demo/mint/${address}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mint');
      }

      // Refresh mint status
      const statusResponse = await fetch(`/api/demo/mint/${address}`);
      const statusData = await statusResponse.json();
      setCanMint(statusData.canMint);
      setError(null);
    } catch (err) {
      console.error('Error minting:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint');
    } finally {
      setIsMinting(false);
    }
  };

  // Don't render anything during server-side rendering or before mounting
  if (!mounted) return null;
  
  // Don't render if no wallet is connected or if can't mint and no error
  if (!address || (!isLoading && !canMint && !error)) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-primary">Demo Mint</h3>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Checking mint status...' :
             error ? error :
             canMint ? 'You can mint a demo NFT now!' :
             'Please wait for the cooldown to end'}
          </p>
        </div>
        <button
          onClick={handleMint}
          disabled={isLoading || isMinting || !canMint || !!error}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center gap-2"
        >
          {isMinting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            'Mint'
          )}
        </button>
      </div>
    </div>
  );
}

export function MainContent({ accountId }: { accountId: string | null }) {
  if (!accountId) {
    return (
      <div className="mx-8 py-8">
        <ChainInfo fullWidth />
      </div>
    );
  }

  return (
    <div className="mx-8 py-2">
      <div className="space-y-8 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-8">
        {/* Chain Details */}
        <div className="xl:col-span-4">
          <div className="xl:sticky xl:top-24">
            <div className="bg-card border border-border rounded-xl p-6">
              <ChainInfo />
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="xl:col-span-8 space-y-6">
          <MintBanner />
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Account Header */}
            <AccountHeader accountId={accountId} />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* NFTs */}
              <div className="lg:col-span-8 space-y-6">
                <NFTGrid accountId={accountId} />
              </div>

              {/* Transfer History */}
              <div className="lg:col-span-4 space-y-6">
                <TransferHistory accountId={accountId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}