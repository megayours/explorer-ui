'use client';

import { Globe } from 'lucide-react';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useState, useEffect } from 'react';
import dapps from '@/config/dapps';
import { useRouter } from 'next/navigation';

interface ChainSwitcherProps {
  isHeader?: boolean;
}

export function ChainSwitcher({ isHeader = false }: ChainSwitcherProps) {
  const { selectedChain } = useChain();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.chain-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  const handleChainSwitch = (chain: typeof dapps[0]) => {
    router.push(`/${chain.blockchainRid}`);
    setIsOpen(false);
  };

  return (
    <div className="relative chain-switcher">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          inline-flex items-center justify-center gap-2 
          bg-background border border-border
          hover:border-border-hover transition-all duration-300
          ${isHeader 
            ? 'px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl' 
            : 'px-6 py-3 text-base rounded-xl'
          }
        `}
      >
        <Globe className="h-5 w-5 text-text-secondary" />
        <span className="text-text-primary font-medium">{selectedChain.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            fixed sm:absolute z-50 sm:mt-2
            ${isHeader ? 'top-[4.5rem] sm:top-auto inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2' : 'bottom-0 sm:bottom-auto left-0 sm:left-auto'}
            w-[calc(100%-2rem)] sm:w-auto min-w-[240px] rounded-xl sm:rounded-xl overflow-hidden
            bg-background border border-border shadow-md
          `}>
            <div className="py-2">
              {dapps.map((chain) => (
                <button
                  key={chain.blockchainRid}
                  onClick={() => handleChainSwitch(chain)}
                  className={`
                    w-full px-6 py-4 sm:py-3 text-left transition-colors
                    hover:bg-muted flex items-center gap-3
                    ${selectedChain.blockchainRid === chain.blockchainRid ? 'bg-muted/50' : ''}
                  `}
                >
                  <Globe className="h-5 w-5 text-text-secondary" />
                  <span className="text-text-primary font-medium text-base">{chain.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 