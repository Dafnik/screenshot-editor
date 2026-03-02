import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';
import {documentReducer} from './document-reducer';
import {historyReducer} from './history-reducer';
import {interactionReducer} from './interaction-reducer';
import {libraryReducer} from './library-reducer';
import {toolReducer} from './tool-reducer';
import {uiReducer} from './ui-reducer';
import {viewportReducer} from './viewport-reducer';

function clampFinite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function enforceInvariants(state: AppState): AppState {
  const zoom = Math.max(10, Math.min(500, clampFinite(state.zoom, 100)));
  const panX = clampFinite(state.panX, 0);
  const panY = clampFinite(state.panY, 0);
  const isEditing = state.image1 ? state.isEditing : false;
  const selectedStrokeIndices = state.selectedStrokeIndices.filter(
    (index) => Number.isInteger(index) && index >= 0 && index < state.blurStrokes.length,
  );

  return {
    ...state,
    zoom,
    panX,
    panY,
    isEditing,
    selectedStrokeIndices,
  };
}

export function reduceEditorState(state: AppState, event: AppEvent): AppState {
  const afterDocument = documentReducer(state, event);
  const afterTool = toolReducer(afterDocument, event);
  const afterViewport = viewportReducer(afterTool, event);
  const afterInteraction = interactionReducer(afterViewport, event);
  const afterLibrary = libraryReducer(afterInteraction, event);
  const afterUi = uiReducer(afterLibrary, event);
  const afterHistory = historyReducer(afterUi, event);
  return enforceInvariants(afterHistory);
}
