'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useGammaChain } from '@/lib/hooks/use-gamma-chain'
import type { NFT } from '@/types/nft'
import { Property } from '@megayours/sdk'
import { ArrowRightLeft } from 'lucide-react'

interface NFTCardProps {
  nft: NFT
}

export function NFTCard({ nft }: NFTCardProps) {
  const [isTransferring, setIsTransferring] = useState(false)
  const [actions] = useGammaChain()

  if (!nft) return null

  const handleTransfer = async () => {
    const blockchainRid = prompt("Enter the target blockchain RID:")
    if (!blockchainRid) return

    try {
      setIsTransferring(true)
      await actions.transferToken(
        blockchainRid,
        nft.project,
        nft.collectionName,
        BigInt(nft.tokenId)
      )
      alert("Transfer successful!")
    } catch (error) {
      console.error("Transfer failed:", error)
      alert("Transfer failed. Check console for details.")
    } finally {
      setIsTransferring(false)
    }
  }

  const getAttributes = (properties: { [key: string]: string | number | boolean | Property | Property[] }): any => {
    if (properties.attributes) {
      return properties.attributes as Property[]
    }
    return Object.entries(properties)
      .filter(([key]) => key !== 'name' && key !== 'description' && key !== 'image')
      .map(([key, value]) => ({ trait_type: key, value: value }))
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

        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className="w-full px-4 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 
                   hover:border-zinc-600/50 transition-all duration-300 text-sm font-medium text-white
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {isTransferring ? "Transferring..." : "Transfer"}
        </button>
      </div>
    </div>
  )
}
