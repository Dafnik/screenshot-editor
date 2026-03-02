import {DEFAULT_SETTINGS} from '@/features/editor/state/types';
import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

export function viewportReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'ZOOM_SET': {
      const zoom = Number.isFinite(event.zoom)
        ? Math.max(10, Math.min(500, event.zoom))
        : DEFAULT_SETTINGS.zoom;
      return {
        ...state,
        zoom,
      };
    }

    case 'PAN_SET':
      return {
        ...state,
        panX: Number.isFinite(event.panX) ? event.panX : 0,
        panY: Number.isFinite(event.panY) ? event.panY : 0,
      };

    default:
      return state;
  }
}
