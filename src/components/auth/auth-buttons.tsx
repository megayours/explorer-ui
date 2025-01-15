"use client";

import { useRouter } from "next/navigation";
import { ChromiaAuthButton } from "@/lib/chromia-connect/components/chromia-auth-button";

const mainButtonStyles = `
  inline-flex items-center justify-center gap-2 px-8 py-3
  rounded-full font-medium transition-all duration-300
  bg-gradient-to-r from-purple-500 to-pink-600 
  hover:opacity-90 text-white shadow-lg shadow-purple-500/20
  text-xl
`;

const secondaryButtonStyles = `
  inline-flex items-center justify-center gap-2 px-6 py-2.5
  rounded-full font-medium transition-all duration-300
  bg-gradient-to-r from-purple-500 to-pink-600 
  hover:opacity-90 text-white shadow-lg shadow-purple-500/20
  text-sm
`;

const errorContainerStyles = `
  px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20
  text-center space-y-2
`;

const mainErrorTextStyles = `
  text-red-400 text-lg
`;

const secondaryErrorTextStyles = `
  text-red-400 text-sm
`;

export function AuthButtons({ isHeader = false }: { isHeader?: boolean }) {
  const router = useRouter();

  return (
    <ChromiaAuthButton
      className={isHeader ? secondaryButtonStyles : mainButtonStyles}
      errorContainerClassName={errorContainerStyles}
      errorTextClassName={isHeader ? secondaryErrorTextStyles : mainErrorTextStyles}
      onLogout={() => router.push("/")}
    />
  );
}