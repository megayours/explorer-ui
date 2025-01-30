'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import dapps from '@/config/dapps';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useRouter, usePathname } from 'next/navigation';

interface ChainSwitcherProps {
  isHeader?: boolean;
}

export function ChainSwitcher({ isHeader = false }: ChainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChain } = useChain();
  const { disconnectFromChromia } = useChromia();
  const router = useRouter();
  const pathname = usePathname();

  const handleChainSwitch = (chain: typeof dapps[0]) => {    
    // Extract accountId from current path if it exists
    const pathParts = pathname.split('/');
    const accountId = pathParts.length > 2 ? pathParts[2] : null;
    
    // Navigate to the new chain, preserving accountId if it exists
    const newPath = accountId ? `/${chain.blockchainRid}/${accountId}` : `/${chain.blockchainRid}`;
    router.push(newPath);
    
    disconnectFromChromia();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-gradient-to-b from-zinc-800/30 to-zinc-800/30
          backdrop-blur-xl border border-zinc-800/50
          hover:border-zinc-700/50 transition-all duration-300
          ${isHeader ? 'text-sm' : 'text-base min-w-[200px]'}
        `}
      >
        <Globe className={`${isHeader ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="flex-1 text-left">
          <span className="text-zinc-400 block text-xs">Current chain</span>
          <span className="text-white block font-medium">{selectedChain.name}</span>
        </span>
        <ChevronDown className={`${isHeader ? 'h-4 w-4' : 'h-5 w-5'} text-zinc-400`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute z-50 mt-2 w-full min-w-[200px] rounded-xl overflow-hidden
            bg-gradient-to-b from-zinc-800/95 to-zinc-800/95
            backdrop-blur-xl border border-zinc-700/50 shadow-xl
          `}>
            <div className="py-1">
              {dapps.map((chain) => (
                <button
                  key={chain.blockchainRid}
                  onClick={() => handleChainSwitch(chain)}
                  className={`
                    w-full px-4 py-2.5 text-left transition-colors
                    hover:bg-zinc-700/50 flex items-center gap-2
                    ${selectedChain.blockchainRid === chain.blockchainRid ? 'bg-zinc-700/30' : ''}
                  `}
                >
                  <Globe className={`${isHeader ? 'h-4 w-4' : 'h-5 w-5'} text-zinc-400`} />
                  <span className="text-white font-medium">{chain.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 