import { getDefaultConfig } from "connectkit";
import { createConfig, http, ResolvedRegister } from "wagmi";
import { mainnet } from "wagmi/chains";
import { env } from "@/env";
import { polygonAmoy } from "./networks";

export function getConfig(): ResolvedRegister["config"] {
  return createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: [polygonAmoy, mainnet],
      transports: {
        // RPC URL for each chain
        [mainnet.id]: http(
          `https://eth-mainnet.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_ID}`,
        ),
        [polygonAmoy.id]: http(polygonAmoy.rpcUrls.default.http[0]),
      },

      // Required API Keys
      walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

      // Required App Info
      appName: "MegaYours",
      appDescription: "MegaYours",
      appUrl: "https://megayours.com",
      appIcon: "https://megayours.com/logo.png",
    }),
  );
}
