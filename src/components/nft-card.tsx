'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRightLeft, Loader2 } from 'lucide-react'
import { useGammaChain } from '@/lib/hooks/use-gamma-chain'
import { useChain } from '@/lib/chain-switcher/chain-context'
import dapps from '@/config/dapps'
import type { NFT } from '@/types/nft'

type Property = {
  trait_type: string
  value: string | number | boolean
}

type NFTCardProps = {
  nft: NFT
  onRefresh: () => void
}

export function NFTCard({ nft, onRefresh }: NFTCardProps) {
  const [isTransferring, setIsTransferring] = useState(false)
  const [isSelectingChain, setIsSelectingChain] = useState(false)
  const [targetChain, setTargetChain] = useState<typeof dapps[0] | null>(null)
  const [actions] = useGammaChain()
  const { selectedChain } = useChain()

  if (!nft) return null

  const availableChains = dapps.filter(
    chain => chain.blockchainRid !== selectedChain.blockchainRid
  )

  const handleTransfer = async (chain: typeof dapps[0]) => {
    setTargetChain(chain)
    setIsSelectingChain(false)
    try {
      setIsTransferring(true)
      await actions.transferToken(
        chain.blockchainRid,
        nft.project,
        nft.collectionName,
        BigInt(nft.tokenId)
      )
      onRefresh()
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setIsTransferring(false)
      setTargetChain(null)
    }
  }

  if (nft.imageUrl === '') {
    console.log('nft', nft);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-800/30 backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
      <div className="aspect-square overflow-hidden">
        <Image
          src={nft.imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={nft.name}
          width={500}
          height={500}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="space-y-1 mb-3">
          <p className="text-zinc-400 text-sm">{nft.projectName} - {nft.collectionName}</p>
          <h3 className="font-semibold text-lg text-white truncate">{nft.name}</h3>
        </div>

        {nft.properties?.attributes && (
          <div className="max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent mb-4">
            <div className="grid grid-cols-2 gap-1.5 pr-2">
              {(nft.properties.attributes as Property[]).map((attr, index) => (
                <div
                  key={`${attr.trait_type}-${index}`}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                >
                  <p className="text-zinc-400 text-xs leading-none mb-1">{attr.trait_type}</p>
                  <p className="text-white text-xs font-medium truncate">{String(attr.value)}</p>
                </div>
              ))}
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
