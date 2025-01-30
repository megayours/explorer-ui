'use client';

import { User, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface AccountHeaderProps {
  accountId: string;
}

export function AccountHeader({ accountId }: AccountHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedId = `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;

  return (
    <div className="mb-8 p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium text-text-primary mb-1">Account Overview</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-text-secondary font-mono">{truncatedId}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-text-secondary" />
              )}
              <span className="text-xs text-text-secondary">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 