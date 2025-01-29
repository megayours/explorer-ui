'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';

interface JsonViewerProps {
  data: unknown;
  className?: string;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  const [isCopied, setIsCopied] = useState(false);
  const formattedJson = JSON.stringify(data, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn("relative group bg-zinc-800/50 rounded-md border border-zinc-700/50", className)}>
      <button
        onClick={copyToClipboard}
        className="absolute top-1 right-1 p-1 rounded hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
        title="Copy JSON"
      >
        {isCopied ? (
          <CheckIcon className="h-3 w-3 text-green-400" />
        ) : (
          <CopyIcon className="h-3 w-3 text-zinc-400" />
        )}
      </button>
      <pre className="overflow-x-auto p-2 text-xs font-mono text-zinc-300 max-h-[100px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {formattedJson}
      </pre>
    </div>
  );
} 