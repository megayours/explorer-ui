import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_ALCHEMY_ID: z.string().min(1),
    NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL: z.string().url().optional(),
    NEXT_PUBLIC_NODE_URL_POOL: z.string().url().optional(),
    NEXT_PUBLIC_CHAIN_ID: z.coerce.number().optional(),
    NEXT_PUBLIC_MEGA_CHAIN_DASHBOARD_URL: z.string().url(),
  },

  server: {
    MINT_PRIVATE_KEY: z.string().min(1),
    MINT_CONTRACT_ADDRESS: z.string().min(1)
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"],
    NEXT_PUBLIC_ALCHEMY_ID: process.env["NEXT_PUBLIC_ALCHEMY_ID"],
    NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL:
      process.env["NEXT_PUBLIC_DIRECTORY_NODE_URL_POOL"],
    NEXT_PUBLIC_NODE_URL_POOL: process.env["NEXT_PUBLIC_NODE_URL_POOL"],
    NEXT_PUBLIC_CHAIN_ID: process.env["NEXT_PUBLIC_CHAIN_ID"],
    NEXT_PUBLIC_MEGA_CHAIN_DASHBOARD_URL:process.env["NEXT_PUBLIC_MEGA_CHAIN_DASHBOARD_URL"],
  },
});
