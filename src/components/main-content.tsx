'use client';

import { NFTGrid } from './nft-grid';
import { TransferHistory } from './transfer-history';
import { AccountHeader } from './account-header';
import { ChainInfo } from './chain-info';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const WALLET_COOLDOWN = 60 * 60 * 1000;  // 1 hour in ms

function getStoredMintTime(wallet: string): number {
  const stored = localStorage.getItem(`lastMint_${wallet}`);
  return stored ? parseInt(stored, 10) : 0;
}

function setStoredMintTime(wallet: string) {
  localStorage.setItem(`lastMint_${wallet}`, Date.now().toString());
}

function canMint(wallet: string): { canMint: boolean; timeLeft: number } {
  const now = Date.now();
  const lastMint = getStoredMintTime(wallet);
  const timeLeft = Math.max(0, WALLET_COOLDOWN - (now - lastMint));

  return {
    canMint: timeLeft === 0,
    timeLeft,
  };
}

function MintBanner({ address }: { address: string }) {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(-1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const status = canMint(address);
      setTimeLeft(status.timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [address]);

  if (!mounted) return null;

  const handleMint = async () => {
    try {
      setIsMinting(true);
      setError(null);
      setTxHash(null);

      const response = await fetch(`/api/demo/mint/${address}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint');
      }

      setStoredMintTime(address);
      setTxHash(data.hash);
      const status = canMint(address);
      setTimeLeft(status.timeLeft);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint');
    } finally {
      setIsMinting(false);
    }
  };

  const mintStatus = canMint(address);
  const formattedTimeLeft = Math.ceil(timeLeft / 1000 / 60); // minutes

  if (timeLeft === -1) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Demo Minting</h4>
          <p className="text-sm text-muted-foreground">
            {mintStatus.canMint
              ? 'You can mint now!'
              : `You can mint again in ${formattedTimeLeft} minutes`}
          </p>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {txHash && (
            <div>
              <a
                href={`https://www.oklink.com/amoy/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-2"
              >
                View Transaction <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Your token should show up in the PFP Chain Demo in a few minutes.
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={handleMint}
          disabled={!mintStatus.canMint || isMinting}
        >
          {isMinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Mint
        </Button>
      </div>
    </div>
  );
}

export function MainContent({ accountId }: { accountId: string | null }) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
          {address && <MintBanner address={address} />}
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