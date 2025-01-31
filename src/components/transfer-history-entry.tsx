import Link from 'next/link';
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useTokenMetadata } from "@/lib/hooks/use-token-metadata";
import { Loader2, ArrowDown, ArrowUp } from "lucide-react";
import { TransferHistory } from '@megayours/sdk';
import { cn } from '@/lib/utils';

export function TransferHistoryEntry({ transfer, displayAccountAvatar = true, currentAccountId }: { 
  transfer: TransferHistory, 
  displayAccountAvatar?: boolean,
  currentAccountId?: string 
}) {
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
  const accountPageUrl = `/${selectedChain.blockchainRid}/account/${accountId}`;
  const accountAvatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${accountId}&backgroundColor=transparent`;
  
  // Determine transfer type
  const isOwnershipChanged = transfer.type === 'external_received' || transfer.type === 'external_sent';
  const isChainIn = transfer.type === 'received';
  const isChainOut = transfer.type === 'sent';
  const isMyAccount = currentAccountId ? accountId === currentAccountId : true;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:bg-background/80 transition-colors">
      {/* NFT Image */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-background-light">
        {isLoadingMetadata ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-accent-blue" />
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
      <Link 
        href={`/${selectedChain.blockchainRid}/token/${transfer.token.uid.toString('hex')}`}
        className="flex-1 min-w-0 group"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-blue">
              {name}
              <span className="text-xs text-text-tertiary group-hover:text-accent-blue ml-1">→</span>
            </p>
          </div>
          <p className="text-xs text-text-secondary truncate">{transfer.token.collection}</p>
        </div>
      </Link>

      {/* Event Type */}
      <div className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium",
        isOwnershipChanged
          ? "bg-blue-500/10 text-blue-500" // Owner changed
          : isChainIn
            ? "bg-green-500/10 text-green-500" // Chain received
            : "bg-red-500/10 text-red-500" // Chain sent
      )}>
        {isChainIn ? (
          <>
            <ArrowDown className="h-3.5 w-3.5" />
            Chain Received
          </>
        ) : isChainOut ? (
          <>
            <ArrowUp className="h-3.5 w-3.5" />
            Chain Sent
          </>
        ) : (
          <>
            {isMyAccount ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            Owner Changed
          </>
        )}
      </div>

      {/* Account Avatar */}
      {displayAccountAvatar && (
        <Link
          href={accountPageUrl}
          className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-background-light border border-border hover:border-accent-blue hover:scale-105 transition-all"
          title={`View account ${accountId.slice(0, 6)}...${accountId.slice(-4)}`}
        >
          <img
            src={accountAvatarUrl}
            alt={`Avatar for ${accountId}`}
            className="w-full h-full"
          />
        </Link>
      )}
    </div>
  );
}

function truncateBlockchainRid(rid: string) {
  if (rid.length <= 12) return rid;
  return `${rid.slice(0, 6)}...${rid.slice(-6)}`;
} 