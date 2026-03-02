import '@testing-library/jest-dom/vitest';
import {afterEach, beforeEach} from 'vitest';
import {cleanup} from '@testing-library/react';
import {useEditorStore} from '@/features/editor/state/use-editor-store';
import {saveBlurTemplates} from '@/features/editor/state/blur-templates-storage';
import {clearPersistedSettings} from '@/features/editor/state/storage/hydration';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

beforeEach(() => {
  localStorage.clear();
  clearPersistedSettings();
  saveBlurTemplates([]);
  useEditorStore.getState().resetProject();
  useEditorStore.getState().resetSettingsToDefaults();
  useEditorStore.getState().dispatch({
    type: 'BLUR_TEMPLATES_SET',
    blurTemplates: [],
    selectedTemplateId: null,
  });
  useEditorStore.getState().setSplitViewSidebarOpen(false);
});

afterEach(() => {
  cleanup();
});
