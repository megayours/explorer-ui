'use client';

import { useEffect, useRef } from 'react';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useChain } from '@/lib/chain-switcher/chain-context';
import { useNFTTransfer } from '@/lib/hooks/use-nft-transfer';

export function ChainChangeHandler() {
  const { selectedChain } = useChain();
  const { chromiaSession, disconnectFromChromia } = useChromia();
  const { isTransferInProgress } = useNFTTransfer();
  const previousChainRef = useRef(selectedChain.blockchainRid);

  useEffect(() => {
    // Only handle actual chain changes
    if (previousChainRef.current !== selectedChain.blockchainRid) {
      console.log(`Chain actually changed from ${previousChainRef.current} to ${selectedChain.blockchainRid}`);
      previousChainRef.current = selectedChain.blockchainRid;

      if (chromiaSession && !isTransferInProgress) {
        console.log('Chain changed and no transfer in progress, disconnecting from Chromia');
        disconnectFromChromia();
        sessionStorage.removeItem('FT_LOGIN_KEY_STORE');
      }
    }
  }, [selectedChain.blockchainRid, disconnectFromChromia, chromiaSession, isTransferInProgress]);

  return null;
} 