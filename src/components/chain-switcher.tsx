'use client';

import { Globe } from 'lucide-react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useState } from 'react';
import dapps from '@/config/dapps';
import { useRouter } from 'next/navigation';

interface ChainSwitcherProps {
  isHeader?: boolean;
}

export function ChainSwitcher({ isHeader = false }: ChainSwitcherProps) {
  const { selectedChain } = useChain();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleChainSwitch = (chain: typeof dapps[0]) => {
    router.push(`/${chain.blockchainRid}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-background border border-border
          hover:border-border-hover transition-all duration-300
          ${isHeader ? 'text-sm' : 'text-base'}
        `}
      >
        <Globe className={`${isHeader ? 'h-4 w-4' : 'h-5 w-5'} text-text-secondary`} />
        <span className="text-text-primary block font-medium">{selectedChain.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute z-50 mt-2 w-full min-w-[200px] rounded-xl overflow-hidden
            bg-background border border-border shadow-md
          `}>
            <div className="py-1">
              {dapps.map((chain) => (
                <button
                  key={chain.blockchainRid}
                  onClick={() => handleChainSwitch(chain)}
                  className={`
                    w-full px-4 py-2.5 text-left transition-colors
                    hover:bg-muted flex items-center gap-2
                    ${selectedChain.blockchainRid === chain.blockchainRid ? 'bg-muted/50' : ''}
                  `}
                >
                  <Globe className={`${isHeader ? 'h-4 w-4' : 'h-5 w-5'} text-text-secondary`} />
                  <span className="text-text-primary font-medium">{chain.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 