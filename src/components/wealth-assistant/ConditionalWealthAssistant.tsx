"use client";

import { usePathname } from "next/navigation";
import FloatingWealthAssistant from "./FloatingWealthAssistant";

export default function ConditionalWealthAssistant() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <FloatingWealthAssistant />;
}