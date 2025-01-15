'use client';

import { useRouter } from 'next/navigation';
import { useChromia } from '@/lib/chromia-connect/chromia-context';
import { useEffect } from 'react';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { chromiaSession, isLoading } = useChromia();

    useEffect(() => {
      if (!isLoading && !chromiaSession) {
        router.replace('/');
      }
    }, [chromiaSession, isLoading, router]);

    // Show nothing while checking authentication
    if (isLoading || !chromiaSession) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 