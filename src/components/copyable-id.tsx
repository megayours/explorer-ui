'use client';

import { useState, useCallback } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface CopyableIdProps {
  id: string;
  truncateLength?: number;
}

export function CopyableId({ id, truncateLength = 6 }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);
  const truncatedId = `${id.slice(0, truncateLength)}...${id.slice(-truncateLength)}`;

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [id]);

  return (
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
  );
} 