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

type NFTCardProps = {
  nft: TokenBalance
  onRefresh: () => void
  onTransferSuccess?: () => void
}

export function NFTCard({ nft, onRefresh, onTransferSuccess }: NFTCardProps) {
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

  if (isLoadingMetadata) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-800/30 backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
      <div className="aspect-square overflow-hidden relative">
        {isLoadingMetadata && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        )}
        <Image
          src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={name}
          width={500}
          height={500}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="space-y-1 mb-3">
          <p className="text-zinc-400 text-sm">{nft.project.name} - {nft.collection}</p>
          <h3 className="font-semibold text-lg text-white truncate">{name}</h3>
        </div>

        {metadata?.properties && (
          <div className="max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {Object.entries(metadata.properties).map(([key, value]) => {
                const isObject = typeof value === 'object'
                const stringValue = String(value)
                const isUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(stringValue)
                const isIpfsPath = stringValue.startsWith('ipfs://')
                const isIpnsPath = stringValue.startsWith('ipns://')

                let valueElement
                if (isObject) {
                  valueElement = JSON.stringify(value)
                } else if (isUrl) {
                  valueElement = (
                    <a
                      href={stringValue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 break-all"
                    >
                      {stringValue.length > 16 ? `${stringValue.slice(0, 16)}...` : stringValue}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  )
                } else if (isIpfsPath || isIpnsPath) {
                  const gateway = 'https://ipfs.io/'
                  const path = stringValue.replace('ipfs://', 'ipfs/').replace('ipns://', 'ipns/')
                  const fullUrl = gateway + path

                  valueElement = (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 break-all"
                    >
                      {stringValue.length > 16 ? `${stringValue.slice(0, 16)}...` : stringValue}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  )
                } else {
                  valueElement = (
                    <span className="break-all" title={stringValue}>
                      {stringValue.length > 16 ? `${stringValue.slice(0, 16)}...` : stringValue}
                    </span>
                  )
                }

                return (
                  <div
                    key={key}
                    className="px-2.5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex flex-col justify-between min-w-0"
                  >
                    <p className="text-zinc-400 text-xs leading-none mb-1.5 truncate" title={key}>{key}</p>
                    <div className="text-white text-xs font-medium min-w-0">
                      {valueElement}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsSelectingChain(true)}
            disabled={isTransferring}
            className="w-full px-4 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 
                     hover:border-zinc-600/50 transition-all duration-300 text-sm font-medium text-white
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
              <div className="absolute bottom-full mb-2 left-0 right-0 rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-800/95 backdrop-blur-xl shadow-lg z-50">
                <div className="py-1">
                  {availableChains.map((chain) => (
                    <button
                      key={chain.blockchainRid}
                      onClick={() => handleTransfer(chain)}
                      disabled={isTransferring}
                      className="w-full px-4 py-2 text-left text-sm transition-colors
                        text-zinc-300 hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Transfer to {chain.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
