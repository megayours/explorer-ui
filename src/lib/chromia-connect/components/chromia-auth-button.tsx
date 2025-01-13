import { useChromiaAuth } from "../hooks/use-chromia-auth";
import type { ComponentProps } from "react";

type ButtonStyleProps = {
  /** Base button styles that will be applied to all states */
  className?: string;
  /** Optional different styles for each state */
  variants?: {
    connect?: string;
    authenticate?: string;
    connected?: string;
    notRegistered?: string;
  };
  /** Optional container styles for error messages */
  errorContainerClassName?: string;
  /** Optional styles for error text */
  errorTextClassName?: string;
};

type ChromiaAuthButtonProps = ButtonStyleProps & {
  /** Optional custom text for each state */
  customText?: {
    connect?: string;
    authenticate?: string;
    connected?: (address: string) => string;
    notRegistered?: string;
    notRegisteredSupport?: string;
  };
  /** Optional callback when user needs to be redirected after logout */
  onLogout?: () => void;
} & Omit<ComponentProps<"button">, keyof ButtonStyleProps | "children">;

export function ChromiaAuthButton({ 
  className = "", 
  variants = {},
  errorContainerClassName = "",
  errorTextClassName = "",
  customText = {},
  onLogout,
  ...buttonProps
}: ChromiaAuthButtonProps) {
  const [state, actions] = useChromiaAuth();
  
  const handleLogout = () => {
    actions.logout();
    onLogout?.();
  };

  // Default text for each state
  const text = {
    connect: customText.connect ?? "Connect Wallet",
    authenticate: customText.authenticate ?? "Authenticate",
    connected: (address: string) => customText.connected?.(address) ?? `Disconnect ${address.slice(0, 5)}...${address.slice(-3)}`,
    notRegistered: customText.notRegistered ?? "Not Registered",
  };

  // Handle not registered state
  if (state.authStatus === "notRegistered") {
    return (
      <div className={errorContainerClassName}>
        <p className={errorTextClassName}>{text.notRegistered}</p>
      </div>
    );
  }

  // Get the appropriate variant class based on state
  const variantClass = state.isConnected
    ? state.authStatus === "connected"
      ? variants.connected
      : variants.authenticate
    : variants.connect;

  // Combine classes
  const buttonClass = `${className} ${variantClass ?? ""}`.trim();

  // Get the appropriate action and text based on state
  const { onClick, buttonText } = state.isConnected
    ? state.authStatus === "connected"
      ? { onClick: handleLogout, buttonText: text.connected(state.walletAddress ?? "") }
      : { onClick: actions.authenticate, buttonText: text.authenticate }
    : { onClick: actions.connect, buttonText: text.connect };

  return (
    <button
      {...buttonProps}
      className={buttonClass}
      onClick={onClick}
      disabled={state.isLoading}
    >
      {buttonText}
    </button>
  );
}
