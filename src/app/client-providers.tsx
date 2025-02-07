"use client";

import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import type React from "react";
import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { getConfig as getWagmiConfig } from "@/config/wagmi-config";
import { ChromiaProvider } from "@/lib/chromia-connect/chromia-context";
import { env } from "@/env";
import { ChromiaConfig } from "@/lib/chromia-connect/types";
import { ChainProvider, useChain } from "@/lib/chain-switcher/chain-context";
import dapps from "@/config/dapps";
import { ChainChangeHandler } from '@/components/chain-change-handler';

const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationKey =
          typeof mutation.options.mutationKey?.[0] === "string"
            ? mutation.options.mutationKey[0]
            : "unknown";

        if (process.env.NODE_ENV === "development") {
          console.error(
            `[mutation error for mutationKey ${mutationKey}]`,
            error,
            mutation,
          );
        }
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        const queryKey =
          typeof query.queryKey[0] === "string" ? query.queryKey[0] : "unknown";

        if (process.env.NODE_ENV === "development") {
          console.error(`[query error for queryKey ${queryKey}]`, error, query);
        }
      },
    }),
  });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = (): QueryClient => {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

interface ClientProvidersProps extends React.PropsWithChildren<{}> {
  initialBlockchainRid?: string;
}

function ChromiaProviderWithChain({ children }: { children: React.ReactNode }) {
  const { selectedChain } = useChain();
  const [key, setKey] = useState(0);

  const config: ChromiaConfig = {
    ...(env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL 
      ? { directoryNodeUrlPool: env.NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL } 
      : { nodeUrlPool: env.NEXT_PUBLIC_NODE_URL_POOL }),
    blockchainRid: selectedChain.blockchainRid,
  };

  // Force ChromiaProvider to reinitialize when chain changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [selectedChain.blockchainRid]);

  return (
    <ChromiaProvider key={key} config={config}>
      {children}
    </ChromiaProvider>
  );
}

export const ClientProviders: React.FunctionComponent<ClientProvidersProps> = ({ 
  children, 
  initialBlockchainRid = dapps[0].blockchainRid
}) => {
  const [wagmiConfig] = useState(() => getWagmiConfig());
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <ChainProvider initialBlockchainRid={initialBlockchainRid}>
            <ChromiaProviderWithChain>
              <ChainChangeHandler />
              {children}
            </ChromiaProviderWithChain>
          </ChainProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
