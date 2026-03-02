import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

export function toolReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'ACTIVE_TOOL_SET':
      return {
        ...state,
        activeTool: event.activeTool,
      };
    case 'SHIFT_PRESSED_SET':
      return {
        ...state,
        isShiftPressed: event.isShiftPressed,
      };
    case 'BRUSH_RADIUS_SET':
      return {
        ...state,
        brushRadius: event.brushRadius,
      };
    case 'BRUSH_STRENGTH_SET':
      return {
        ...state,
        brushStrength: event.brushStrength,
      };
    case 'BLUR_TYPE_SET':
      return {
        ...state,
        blurType: event.blurType,
      };
    case 'BLUR_STROKE_SHAPE_SET':
      return {
        ...state,
        blurStrokeShape: event.blurStrokeShape,
      };
    default:
      return state;
  }
}
