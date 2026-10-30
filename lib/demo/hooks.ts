"use client";

import { useSyncExternalStore } from "react";
import {
  getDemoState,
  getServerDemoState,
  subscribeDemoStore,
} from "./store";
import type { DemoState, Permission } from "./types";

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
  if (session.role === "super_admin") return false;
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
