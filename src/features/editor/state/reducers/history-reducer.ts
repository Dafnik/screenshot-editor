import {
  applyHistorySnapshot,
  createHistorySnapshot,
  withHistoryMeta,
} from '@/features/editor/state/history';
import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

export function historyReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'HISTORY_PUSH_SNAPSHOT': {
      const snapshot = createHistorySnapshot(state);
      const history = state.history.slice(0, state.historyIndex + 1);
      history.push(snapshot);
      return {
        ...state,
        ...withHistoryMeta(history, history.length - 1),
      };
    }

    case 'HISTORY_UNDO': {
      if (state.historyIndex <= 0) return state;
      const nextIndex = state.historyIndex - 1;
      const snapshot = state.history[nextIndex];
      if (!snapshot) return state;
      return {
        ...state,
        ...applyHistorySnapshot(snapshot),
        isDrawing: false,
        currentStroke: null,
        ...withHistoryMeta(state.history, nextIndex),
      };
    }

    case 'HISTORY_REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const snapshot = state.history[nextIndex];
      if (!snapshot) return state;
      return {
        ...state,
        ...applyHistorySnapshot(snapshot),
        isDrawing: false,
        currentStroke: null,
        ...withHistoryMeta(state.history, nextIndex),
      };
    }

    default:
      return state;
  }
}
