'use client';

import { useChain } from '@/lib/chain-switcher/chain-context';
import { useEffect, useRef } from 'react';
import dapps from '@/config/dapps';

interface ChainInitializerProps {
  chainName: string;  // This is actually the blockchain RID from the URL
}

export function ChainInitializer({ chainName }: ChainInitializerProps) {
  const { selectedChain, switchChain } = useChain();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    
    if (chainName.toLowerCase() !== selectedChain.blockchainRid.toLowerCase()) {
      initializedRef.current = true;
      switchChain(chainName);
    }
  }, [chainName, selectedChain.blockchainRid, switchChain]);

  return null;
} 