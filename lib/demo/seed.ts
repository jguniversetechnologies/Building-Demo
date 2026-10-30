import seedJson from "@/data/seed.json";
import type { DemoState } from "./types";
import { DEMO_STATE_VERSION } from "./types";

export function createSeedState(): DemoState {
  const raw = seedJson as Omit<DemoState, "session"> & { session: null };
  return {
    ...structuredClone(raw),
    version: DEMO_STATE_VERSION,
    session: null,
  };
}
