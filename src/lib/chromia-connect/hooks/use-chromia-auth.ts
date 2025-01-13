import { useChromia } from "../chromia-context";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { injected } from 'wagmi/connectors'
import { useQueryClient } from "@tanstack/react-query";

export type ChromiaAuthState = {
  isConnected: boolean;
  isLoading: boolean;
  authStatus: "connected" | "notRegistered" | "disconnected";
  walletAddress?: string;
  ensName?: string;
};

export type ChromiaAuthActions = {
  connect: () => void;
  authenticate: () => void;
  logout: () => void;
};

export function useChromiaAuth(): [ChromiaAuthState, ChromiaAuthActions] {
  const { authStatus, connectToChromia, disconnectFromChromia, isLoading } = useChromia();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const queryClient = useQueryClient();

  const state: ChromiaAuthState = {
    isConnected,
    isLoading,
    authStatus,
    walletAddress: address,
  };

  const actions: ChromiaAuthActions = {
    connect: () => {
      queryClient.invalidateQueries();
      connect({ connector: injected() });
    },
    authenticate: () => {
      connectToChromia();
    },
    logout: async () => {
      disconnect(undefined, {
        onSettled: () => {
          disconnectFromChromia();
          queryClient.invalidateQueries();
          sessionStorage.removeItem("FT_LOGIN_KEY_STORE");
        },
      });
    },
  };

  return [state, actions];
}