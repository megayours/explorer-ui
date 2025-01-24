'use client';

import { useState, useEffect } from 'react';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { createMegaYoursClient, Project } from '@megayours/sdk';
import { createClient } from 'postchain-client';
import { env } from '@/env';

interface PendingTransfer {
  targetBlockchainRid: string;
  project: Project;
  collection: string;
  tokenId: bigint;
  onSuccess?: () => void;
}

export function useNFTTransfer() {
  const { chromiaSession, connectToChromia } = useChromia();
  const [isTransferring, setIsTransferring] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null);

  useEffect(() => {
    // When we get a session and have a pending transfer, execute it
    if (chromiaSession && pendingTransfer) {
      const executePendingTransfer = async () => {
        try {
          setIsTransferring(true);
          const client = createMegaYoursClient(chromiaSession);
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
          
          // Call onSuccess if provided
          pendingTransfer.onSuccess?.();
        } catch (error) {
          console.error('Transfer failed:', error);
          throw error;
        } finally {
          setIsTransferring(false);
          setPendingTransfer(null);
        }
      };

      void executePendingTransfer();
    }
  }, [chromiaSession, pendingTransfer]);

  const transfer = async (
    targetBlockchainRid: string,
    project: Project,
    collection: string,
    tokenId: bigint,
    onSuccess?: () => void
  ) => {
    if (!chromiaSession) {
      // Store the transfer details and trigger authentication
      setPendingTransfer({ targetBlockchainRid, project, collection, tokenId, onSuccess });
      await connectToChromia();
      return;
    }

    // If we already have a session, execute transfer immediately
    setIsTransferring(true);
    try {
      const client = createMegaYoursClient(chromiaSession);
      const targetChain = await createClient({
        directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL,
        blockchainRid: targetBlockchainRid
      });

      await client.transferCrosschain(
        targetChain,
        client.account.id,
        project,
        collection,
        tokenId,
        BigInt(1)
      );
      
      // Call onSuccess if provided
      onSuccess?.();
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transfer,
    isTransferring
  };
} 