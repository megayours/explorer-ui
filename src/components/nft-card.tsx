'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowRightLeft, ExternalLink, Loader2 } from 'lucide-react'
import { useNFTTransfer } from '@/lib/hooks/use-nft-transfer'
import { useChain } from '@/lib/chain-switcher/chain-context'
import { createMegaYoursQueryClient, TokenBalance, TokenMetadata } from '@megayours/sdk'
import { createClient } from 'postchain-client'
import { env } from '@/env'
import dapps from '@/config/dapps'
import { useMetadataCache } from '@/lib/hooks/use-metadata-cache'
import { JsonViewer } from './json-viewer'

type NFTCardProps = {
  nft: TokenBalance
  onRefresh: () => void
  onTransferSuccess?: () => void
  isOwner: boolean
}

function PropertyValue({ value }: { value: unknown }) {
  // If the value is an object or array, render it as JSON
  if (typeof value === 'object' && value !== null) {
    return <JsonViewer data={value} />;
  }

  const stringValue = String(value);

  // Handle IPFS/IPNS links
  if (stringValue.startsWith('ipfs://') || stringValue.startsWith('ipns://')) {
    const gateway = 'https://ipfs.io/';
    const path = stringValue.replace('ipfs://', 'ipfs/').replace('ipns://', 'ipns/');
    const fullUrl = gateway + path;

    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-blue hover:text-accent-blue/80 inline-flex items-center gap-1 text-xs min-w-0 w-full"
        title={stringValue}
      >
        <span className="truncate">{stringValue}</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </a>
    );
  }

  // Handle regular URLs
  if (stringValue.startsWith('http://') || stringValue.startsWith('https://')) {
    return (
      <a
        href={stringValue}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-blue hover:text-accent-blue/80 inline-flex items-center gap-1 text-xs min-w-0 w-full"
        title={stringValue}
      >
        <span className="truncate">{stringValue}</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </a>
    );
  }

  // Handle regular text with truncation
  return (
    <span
      className="text-text-primary text-xs truncate block min-w-0 w-full"
      title={stringValue}
    >
      {stringValue}
    </span>
  );
}

export function NFTCard({ nft, onRefresh, onTransferSuccess, isOwner }: NFTCardProps) {
  const [isSelectingChain, setIsSelectingChain] = useState(false)
  const [targetChain, setTargetChain] = useState<typeof dapps[0] | null>(null)
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const { transfer, isTransferring } = useNFTTransfer()
  const { selectedChain } = useChain()
  const { getMetadata: getCachedMetadata, setMetadata: setCachedMetadata } = useMetadataCache()

  useEffect(() => {
    async function loadMetadata() {
      try {
        // Check cache first
        const cachedMetadata = getCachedMetadata(selectedChain.blockchainRid, nft.collection, nft.token_id)
        if (cachedMetadata !== undefined) {
          setMetadata(cachedMetadata)
          setIsLoadingMetadata(false)
          return
        }

        const client = await createClient({
          directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
          blockchainRid: selectedChain.blockchainRid
        })
        const queryClient = createMegaYoursQueryClient(client)
        const data = await queryClient.getMetadata(nft.project, nft.collection, nft.token_id)

        // Update both local state and cache
        setMetadata(data)
        setCachedMetadata(selectedChain.blockchainRid, nft.collection, nft.token_id, data)
      } catch (err) {
        console.error(`Failed to fetch metadata for token ${nft.token_id}:`, err)

        // Update both local state and cache with null
        setMetadata(null)
        setCachedMetadata(selectedChain.blockchainRid, nft.collection, nft.token_id, null)
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    void loadMetadata()
  }, [nft.project, nft.collection, nft.token_id, selectedChain.blockchainRid])

  if (!nft) return null

  const availableChains = dapps.filter(
    chain => chain.blockchainRid !== selectedChain.blockchainRid
  )

  const handleTransfer = async (chain: typeof dapps[0]) => {
    setTargetChain(chain)
    setIsSelectingChain(false)
    try {
      await transfer(
        chain.blockchainRid,
        nft.project,
        nft.collection,
        nft.token_id,
        () => {
          // Refresh both NFTs and transfer history
          console.log(`NFTCard: Transfer success, refreshing...`);
          onRefresh()
          onTransferSuccess?.()
        }
      )
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setTargetChain(null)
    }
  }

  const imageUrl = metadata?.properties?.image?.toString() || '/placeholder.svg?height=500&width=500'
  const name = metadata?.name || `${nft.collection} #${nft.token_id}`
  const modules = metadata?.yours?.modules || []

  if (isLoadingMetadata) {
    return <div className="flex justify-center items-center h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
    </div>
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-border-hover transition-all duration-300 shadow-sm">
      <div className="aspect-[4/3] overflow-hidden relative">
        {isLoadingMetadata && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          </div>
        )}
        <Image
          src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={name}
          width={400}
          height={300}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="space-y-1 mb-3">
          <p className="text-text-secondary text-sm">{nft.project.name} - {nft.collection}</p>
          <h3 className="font-semibold text-text-primary truncate">{name}</h3>

          {/* Modules Section */}
          {modules.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1.5">
                {modules.map((module, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs font-medium rounded-md bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {metadata && (
          <div className="max-h-[100px] overflow-y-auto scrollbar-thin mb-4">
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(metadata.properties || {}).map(([key, value]) => (
                <div
                  key={key}
                  className="px-2 py-1.5 rounded-lg bg-muted border border-border flex flex-col min-w-0"
                >
                  <p className="text-text-secondary text-xs leading-none mb-1 truncate" title={key}>{key}</p>
                  <div className="text-text-primary text-xs font-medium min-w-0 flex-1">
                    <PropertyValue value={value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setIsSelectingChain(true)}
              disabled={isTransferring}
              className="w-full px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90
                     border border-border transition-all duration-300 text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transferring to {targetChain?.name}...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer
                </>
              )}
            </button>

            {isSelectingChain && !isTransferring && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSelectingChain(false)}
                />
                <div className="absolute bottom-full mb-2 left-0 right-0 rounded-lg overflow-hidden border border-border bg-card shadow-md z-50">
                  <div className="py-1">
                    {availableChains.map((chain) => (
                      <button
                        key={chain.blockchainRid}
                        onClick={() => handleTransfer(chain)}
                        disabled={isTransferring}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors
                               text-text-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chain.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
