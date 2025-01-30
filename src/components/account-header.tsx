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
    <div className="mb-8 p-6 rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-800/30 backdrop-blur-xl border border-zinc-700/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
          <User className="h-6 w-6 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium text-white mb-1">Account Overview</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-400 font-mono">{truncatedId}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span className="text-xs text-zinc-400">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 