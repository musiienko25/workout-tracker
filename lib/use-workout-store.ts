"use client";

import { useSyncExternalStore } from "react";
import {
  getClientSnapshot,
  getServerSnapshot,
  subscribeToStore,
  type StoreSnapshot,
} from "@/lib/storage";

export function useWorkoutStore(): StoreSnapshot {
  return useSyncExternalStore(subscribeToStore, getClientSnapshot, getServerSnapshot);
}
