'use client';

import { useEffect } from 'react';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useChain } from '@/lib/chain-switcher/chain-context';

export function ChainChangeHandler() {
  const { selectedChain } = useChain();
  const { chromiaSession, disconnectFromChromia } = useChromia();

  useEffect(() => {
    if (chromiaSession) {
      disconnectFromChromia();
      sessionStorage.removeItem('FT_LOGIN_KEY_STORE');
    }
  }, [selectedChain.blockchainRid, disconnectFromChromia, chromiaSession]);

  return null;
} 