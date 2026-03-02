import type {StoreApi, UseBoundStore} from 'zustand';
import type {EditorStoreState, PersistedSettings} from '@/features/editor/state/types';
import {persistSettingsSlice} from './hydration';

const DEFAULT_WRITE_DEBOUNCE_MS = 180;

function getPersistedSettingsFromState(state: EditorStoreState): PersistedSettings {
  return {
    splitRatio: state.splitRatio,
    splitDirection: state.splitDirection,
    blurStrokeShape: state.blurStrokeShape,
    brushRadius: state.brushRadius,
    brushStrength: state.brushStrength,
    blurType: state.blurType,
    activeTool: state.activeTool,
    lightImageSide: state.lightImageSide,
    zoom: state.zoom,
  };
}

function arePersistedSettingsEqual(a: PersistedSettings, b: PersistedSettings): boolean {
  return (
    a.splitRatio === b.splitRatio &&
    a.splitDirection === b.splitDirection &&
    a.blurStrokeShape === b.blurStrokeShape &&
    a.brushRadius === b.brushRadius &&
    a.brushStrength === b.brushStrength &&
    a.blurType === b.blurType &&
    a.activeTool === b.activeTool &&
    a.lightImageSide === b.lightImageSide &&
    a.zoom === b.zoom
  );
}

export function installPersistedSettingsSubscription(
  store: UseBoundStore<StoreApi<EditorStoreState>>,
  options: {debounceMs?: number} = {},
): () => void {
  const debounceMs = options.debounceMs ?? DEFAULT_WRITE_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastPersisted = getPersistedSettingsFromState(store.getState());

  const flush = (next: PersistedSettings) => {
    persistSettingsSlice(next);
    lastPersisted = next;
  };

  return store.subscribe((nextState) => {
    const nextPersisted = getPersistedSettingsFromState(nextState);
    if (arePersistedSettingsEqual(lastPersisted, nextPersisted)) return;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      flush(nextPersisted);
      timer = null;
    }, debounceMs);
  });
}
