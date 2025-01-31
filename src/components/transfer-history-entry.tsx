import Link from 'next/link';
import { useChain } from "@/lib/chain-switcher/chain-context";
import { useTokenMetadata } from "@/lib/hooks/use-token-metadata";
import { Loader2 } from "lucide-react";
import { TransferHistory } from '@megayours/sdk';

export function TransferHistoryEntry({ transfer, displayAccountAvatar = true}: { transfer: TransferHistory, displayAccountAvatar?: boolean }) {
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

      {/* Event Type */}
      {!transfer.blockchain_rid ? (
        <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
          <p className="text-xs text-text-secondary font-medium italic">Owner Changed</p>
        </div>
      ) : transfer.blockchain_rid && (
        <div className="flex-shrink-0 px-2 py-1 rounded bg-background-light border border-border">
          <p className="text-xs text-text-secondary font-medium truncate">
            {truncateBlockchainRid(transfer.blockchain_rid.toString('hex'))}
          </p>
        </div>
      )}

      {/* Account Avatar */}
      {displayAccountAvatar && (
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
      )}
    </div>
  );
}

function truncateBlockchainRid(rid: string) {
  if (rid.length <= 12) return rid;
  return `${rid.slice(0, 6)}...${rid.slice(-6)}`;
} 