"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Full-screen app views (Sophia) hide the site footer. */
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/guide" || pathname.startsWith("/guide/")) return null;
  return <>{children}</>;
}
