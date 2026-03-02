import type {PersistedSettings} from '@/features/editor/state/types';

export const SETTINGS_STORAGE_KEY = 'editor-state';
export const PERSIST_VERSION = 1;

export interface PersistedSettingsEnvelope {
  version: number;
  savedAt: number;
  settings: PersistedSettings;
}

export type HydrationStatus = 'not_started' | 'hydrating' | 'hydrated';
