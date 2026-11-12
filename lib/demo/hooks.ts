"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getDemoState,
  getServerDemoState,
  subscribeDemoStore,
} from "./store";
import type { DemoState, Permission } from "./types";

/** Short success/error flash for demo CRUD actions. */
export function useFlash(ms = 2400) {
  const [flash, setFlash] = useState<{
    text: string;
    tone: "ok" | "err";
  } | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), ms);
    return () => window.clearTimeout(t);
  }, [flash, ms]);

  return {
    flash,
    ok: (text: string) => setFlash({ text, tone: "ok" }),
    err: (text: string) => setFlash({ text, tone: "err" }),
    clear: () => setFlash(null),
  };
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(
    subscribeDemoStore,
    getDemoState,
    getServerDemoState,
  );
}

export function useSession() {
  return useDemoState().session;
}

export function useSociety(slug: string) {
  const state = useDemoState();
  return state.societies.find((s) => s.slug === slug) ?? null;
}

export function useHasPermission(permission: Permission) {
  const state = useDemoState();
  const session = state.session;
  if (!session) return false;
  // Super Admin can preview every society action in the pitch demo.
  if (session.role === "super_admin") return true;
  if (session.role === "resident") return false;
  if (session.role === "chairman") return true;
  const staff = state.staff.find((s) => s.id === session.staffId);
  return staff?.permissions.includes(permission) ?? false;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Re-export getFlatRate for use in components */
export { getFlatRate } from "./store";
