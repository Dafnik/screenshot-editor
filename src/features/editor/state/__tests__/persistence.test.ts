import {beforeEach, describe, expect, it, vi} from 'vitest';
import {create} from 'zustand';
import {
  decodePersistedState,
  encodePersistedState,
  sanitizePersistedSettings,
} from '@/features/editor/state/storage/codec';
import {
  clearPersistedSettings,
  getHydrationStatus,
  hydratePersistedSettings,
  persistSettingsSlice,
} from '@/features/editor/state/storage/hydration';
import {installPersistedSettingsSubscription} from '@/features/editor/state/storage/persist-subscription';
import {SETTINGS_STORAGE_KEY} from '@/features/editor/state/storage/schema';
import {DEFAULT_SETTINGS, type EditorStoreState} from '@/features/editor/state/types';
import {useEditorStore} from '@/features/editor/state/use-editor-store';

describe('editor settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedSettings();
  });

  it('sanitizes invalid values to safe defaults', () => {
    const sanitized = sanitizePersistedSettings({
      splitRatio: Number.NaN,
      splitDirection: 'bogus',
      blurStrokeShape: 'invalid',
      brushRadius: Number.POSITIVE_INFINITY,
      brushStrength: -4,
      blurType: 'invalid',
      activeTool: 'invalid',
      lightImageSide: 'invalid',
      zoom: 0,
    });

    expect(sanitized).toEqual({
      ...DEFAULT_SETTINGS,
      splitRatio: 50,
      brushStrength: 1,
      zoom: 10,
    });
  });

  it('encodes and decodes persisted settings payload', () => {
    const encoded = encodePersistedState({
      ...DEFAULT_SETTINGS,
      splitRatio: 66,
      zoom: 130,
    });
    const decoded = decodePersistedState(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.settings.splitRatio).toBe(66);
      expect(decoded.settings.zoom).toBe(130);
    }
  });

  it('hard-resets storage when payload is invalid', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{bad');
    const hydrated = hydratePersistedSettings();
    expect(hydrated).toEqual({});
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
    expect(getHydrationStatus().status).toBe('hydrated');
  });

  it('hydrates saved settings from storage', () => {
    persistSettingsSlice({...DEFAULT_SETTINGS, brushRadius: 37, zoom: 140});
    const hydrated = hydratePersistedSettings();
    expect(hydrated.brushRadius).toBe(37);
    expect(hydrated.zoom).toBe(140);
  });

  it('persists debounced settings updates via subscription', () => {
    vi.useFakeTimers();

    const store = create<EditorStoreState>(() => useEditorStore.getState());
    const unsubscribe = installPersistedSettingsSubscription(store, {debounceMs: 50});

    store.setState({...store.getState(), splitRatio: 77});
    vi.advanceTimersByTime(10);
    store.setState({...store.getState(), splitRatio: 78});
    vi.advanceTimersByTime(60);

    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const decoded = raw ? decodePersistedState(raw) : null;
    expect(decoded && decoded.ok).toBe(true);
    if (decoded && decoded.ok) {
      expect(decoded.settings.splitRatio).toBe(78);
    }

    unsubscribe();
    vi.useRealTimers();
  });
});
