'use client';

import { useState, useEffect, useRef } from 'react';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { createMegaYoursClient, Project } from '@megayours/sdk';
import { createClient } from 'postchain-client';
import { env } from '@/env';
import { useChain } from '@/lib/chain-switcher/chain-context';

interface PendingTransfer {
  sourceBlockchainRid: string;
  targetBlockchainRid: string;
  project: Project;
  collection: string;
  tokenId: bigint;
  onSuccess?: () => void;
}

export function useNFTTransfer() {
  const { chromiaSession, connectToChromia, disconnectFromChromia, isLoading: isChromiaLoading } = useChromia();
  const { selectedChain } = useChain();
  const [isTransferring, setIsTransferring] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null);
  const transferInProgressRef = useRef(false);

  useEffect(() => {
    // When we get a session and have a pending transfer, execute it
    if (chromiaSession && pendingTransfer && !isChromiaLoading) {
      
      // Verify session is for the correct chain
      if (chromiaSession.blockchainRid.toString('hex').toLowerCase() !== pendingTransfer.sourceBlockchainRid.toLowerCase()) {
        console.log('Session is for wrong chain, disconnecting and reconnecting...');
        disconnectFromChromia();
        void connectToChromia();
        return;
      }

      const executePendingTransfer = async () => {
        try {
          setIsTransferring(true);
          const client = createMegaYoursClient(chromiaSession);
          console.log(`Creating client for target chain: ${pendingTransfer.targetBlockchainRid}`);
          console.log(`useNFTTransfer: Session before transfer - auth descriptor: ${chromiaSession.account.authenticator.keyHandlers[0].authDescriptor.id.toString('hex')}`);
          const targetChain = await createClient({
            directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
            blockchainRid: pendingTransfer.targetBlockchainRid
          });

          await client.transferCrosschain(
            targetChain,
            client.account.id,
            pendingTransfer.project,
            pendingTransfer.collection,
            pendingTransfer.tokenId,
            BigInt(1)
          );
          
          console.log(`Transfer executed`);
          
          // Call onSuccess if provided
          pendingTransfer.onSuccess?.();
        } catch (error) {
          console.error('Transfer failed:', error);
          throw error;
        } finally {
          setIsTransferring(false);
          setPendingTransfer(null);
          transferInProgressRef.current = false;
        }
      };

      void executePendingTransfer();
    }
  }, [chromiaSession, pendingTransfer, connectToChromia, disconnectFromChromia, isChromiaLoading]);

  const transfer = async (
    targetBlockchainRid: string,
    project: Project,
    collection: string,
    tokenId: bigint,
    onSuccess?: () => void
  ) => {
    const sourceChainRid = selectedChain.blockchainRid;
    
    // Set transfer in progress flag immediately
    console.log('Setting transfer in progress');
    transferInProgressRef.current = true;
    
    // Always store the transfer details and trigger authentication to ensure we have a fresh session
    console.log(`Storing transfer details and ensuring fresh session`);
    setPendingTransfer({ 
      sourceBlockchainRid: sourceChainRid,
      targetBlockchainRid, 
      project, 
      collection, 
      tokenId, 
      onSuccess 
    });

    try {
      // If we have a session but it's for the wrong chain, disconnect first
      if (chromiaSession && chromiaSession.blockchainRid.toString('hex').toLowerCase() !== sourceChainRid.toLowerCase()) {
        console.log(`Session is for wrong chain, disconnecting first...`);
        disconnectFromChromia();
      }

      // Always trigger a fresh connection
      await connectToChromia();
    } catch (error) {
      // If anything fails during setup, make sure to clear the in-progress flag
      transferInProgressRef.current = false;
      throw error;
    }
  };

  return {
    transfer,
    isTransferring,
    isTransferInProgress: transferInProgressRef.current
  };
} 