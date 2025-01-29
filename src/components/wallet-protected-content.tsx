'use client';

import { useAccount } from 'wagmi';
import { ReactNode } from 'react';

interface WalletProtectedContentProps {
  children: ReactNode;
}

export function WalletProtectedContent({ children }: WalletProtectedContentProps) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
} 