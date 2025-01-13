"use client";

import { useRouter } from "next/navigation";
import { ChromiaAuthButton } from "@/lib/chromia-connect/components/chromia-auth-button";

const mainButtonStyles = `
  transform transition-all duration-300 ease-in-out 
  hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]
  text-4xl py-12 px-20 
  bg-gradient-to-r from-emerald-400 to-cyan-400 
  hover:from-emerald-300 hover:to-cyan-300
  rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.3)]
  font-bold tracking-wide
  border-2 border-cyan-300/20
`;

const secondaryButtonStyles = `
  transform transition-all duration-200 ease-in-out 
  hover:scale-105 shadow-lg
  bg-gradient-to-r from-rose-500 to-pink-500
  hover:from-rose-400 hover:to-pink-400
  text-white font-medium
  rounded-lg px-4 py-2
`;

export function AuthButtons({ isHeader = false }: { isHeader?: boolean }) {
  const router = useRouter();

  return (
    <ChromiaAuthButton
      className={isHeader ? secondaryButtonStyles : mainButtonStyles}
      errorContainerClassName="text-center space-y-4"
      errorTextClassName={isHeader ? "text-sm text-red-400" : "text-lg text-red-400"}
      onLogout={() => router.push("/")}
    />
  );
}