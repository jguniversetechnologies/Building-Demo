"use client";

import { useEffect } from "react";
import { ensureDemoSeeded } from "@/lib/demo/store";

export function DemoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureDemoSeeded();
  }, []);
  return <>{children}</>;
}
