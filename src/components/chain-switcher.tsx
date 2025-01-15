'use client';

import { useState } from 'react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import dapps from '@/config/dapps';
import { ChevronDown } from 'lucide-react';

interface ChainSwitcherProps {
  isHeader?: boolean;
}

export function ChainSwitcher({ isHeader = false }: ChainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChain, switchChain } = useChain();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center justify-between gap-2
          rounded-full font-medium transition-all duration-300
          bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 
          text-white
          ${isHeader 
            ? 'px-4 py-2 text-sm min-w-[140px]'
            : 'px-6 py-3 text-base min-w-[200px]'
          }
        `}
      >
        {selectedChain.name}
        <ChevronDown className={isHeader ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute mt-2 rounded-xl overflow-hidden 
            border border-zinc-700/50 bg-zinc-800/95 backdrop-blur-xl shadow-lg z-50
            ${isHeader ? 'right-0 w-48' : 'left-1/2 -translate-x-1/2 w-[200px]'}
          `}>
            <div className="py-1">
              {dapps.map((chain) => (
                <button
                  key={chain.blockchainRid}
                  onClick={() => {
                    switchChain(chain);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left transition-colors
                    ${isHeader ? 'text-sm' : 'text-base'}
                    ${selectedChain.blockchainRid === chain.blockchainRid
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-zinc-300 hover:bg-zinc-700/50'
                    }
                  `}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 