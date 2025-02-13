'use client';

import { User } from 'lucide-react';
import { CopyableId } from '@/components/copyable-id';

interface AccountHeaderProps {
  accountId: string;
}

export function AccountHeader({ accountId }: AccountHeaderProps) {
  return (
    <div className="mb-2 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium text-text-primary mb-1">Account Details</h1>
          <div className="flex items-center gap-2">
            <CopyableId id={accountId} />
          </div>
        </div>
      </div>
    </div>
  );
} 