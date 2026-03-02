import type {PersistedSettings} from '@/features/editor/state/types';
import {readStorageItem, removeStorageItem, writeStorageItem} from './adapter';
import {decodePersistedState, encodePersistedState} from './codec';
import {SETTINGS_STORAGE_KEY, type HydrationStatus} from './schema';

let hydrationStatus: HydrationStatus = 'not_started';
let hydrationReason: string | null = null;

export function getHydrationStatus() {
  return {status: hydrationStatus, reason: hydrationReason};
}

export function clearPersistedSettings(): void {
  removeStorageItem(SETTINGS_STORAGE_KEY);
}

export function persistSettingsSlice(settings: PersistedSettings): boolean {
  return writeStorageItem(SETTINGS_STORAGE_KEY, encodePersistedState(settings));
}

export function hydratePersistedSettings(): Partial<PersistedSettings> {
  hydrationStatus = 'hydrating';
  hydrationReason = null;

  const raw = readStorageItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    hydrationStatus = 'hydrated';
    hydrationReason = 'empty';
    return {};
  }

  const decoded = decodePersistedState(raw);
  if (!decoded.ok) {
    // Hard reset policy for corrupt or incompatible data.
    clearPersistedSettings();
    hydrationStatus = 'hydrated';
    hydrationReason = decoded.reason;
    return {};
  }

  hydrationStatus = 'hydrated';
  hydrationReason = 'ok';
  return decoded.settings;
}
