import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

function uniqueValidIndices(indices: number[], length: number): number[] {
  return [...new Set(indices)]
    .filter((index) => Number.isInteger(index))
    .filter((index) => index >= 0 && index < length);
}

export function interactionReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'STROKES_SET_TRANSIENT':
      return {
        ...state,
        blurStrokes: event.blurStrokes,
      };

    case 'STROKES_APPEND': {
      const validStrokes = event.strokes.filter((stroke) => stroke.points.length > 0);
      if (validStrokes.length === 0) return state;
      return {
        ...state,
        blurStrokes: [...state.blurStrokes, ...validStrokes],
        isDrawing: false,
        currentStroke: null,
      };
    }

    case 'STROKES_CLEAR':
      return {
        ...state,
        blurStrokes: [],
        isDrawing: false,
        currentStroke: null,
      };

    case 'STROKES_PATCH_AT_INDICES': {
      const targetIndices = uniqueValidIndices(event.indices, state.blurStrokes.length);
      if (targetIndices.length === 0) return state;

      const hasPatch =
        event.patch.radius !== undefined ||
        event.patch.strength !== undefined ||
        event.patch.blurType !== undefined;
      if (!hasPatch) return state;

      const selectedSet = new Set(targetIndices);
      let hasChanged = false;
      const nextStrokes = state.blurStrokes.map((stroke, index) => {
        if (!selectedSet.has(index)) return stroke;
        let nextStroke = stroke;
        let strokeChanged = false;

        if (event.patch.radius !== undefined && stroke.radius !== event.patch.radius) {
          nextStroke = nextStroke === stroke ? {...nextStroke} : nextStroke;
          nextStroke.radius = event.patch.radius;
          strokeChanged = true;
        }
        if (event.patch.strength !== undefined && stroke.strength !== event.patch.strength) {
          nextStroke = nextStroke === stroke ? {...nextStroke} : nextStroke;
          nextStroke.strength = event.patch.strength;
          strokeChanged = true;
        }
        if (event.patch.blurType !== undefined && stroke.blurType !== event.patch.blurType) {
          nextStroke = nextStroke === stroke ? {...nextStroke} : nextStroke;
          nextStroke.blurType = event.patch.blurType;
          strokeChanged = true;
        }

        if (!strokeChanged) return stroke;
        hasChanged = true;
        return nextStroke;
      });

      if (!hasChanged) return state;
      return {
        ...state,
        blurStrokes: nextStrokes,
        isDrawing: false,
        currentStroke: null,
      };
    }

    case 'STROKE_START':
      if (state.activeTool !== 'blur') return state;
      return {
        ...state,
        isDrawing: true,
        currentStroke: {
          points: event.shape === 'box' ? [event.point, event.point] : [event.point],
          radius: state.brushRadius,
          strength: state.brushStrength,
          blurType: state.blurType,
          shape: event.shape,
        },
      };

    case 'STROKE_ENDPOINT_SET': {
      if (!state.isDrawing || !state.currentStroke) return state;
      if ((state.currentStroke.shape ?? 'brush') !== 'box') return state;
      const startPoint = state.currentStroke.points[0];
      if (!startPoint) return state;
      return {
        ...state,
        currentStroke: {
          ...state.currentStroke,
          points: [startPoint, event.point],
        },
      };
    }

    case 'STROKE_POINTS_APPEND':
      if (!state.isDrawing || !state.currentStroke || event.points.length === 0) return state;
      return {
        ...state,
        currentStroke: {
          ...state.currentStroke,
          points: [...state.currentStroke.points, ...event.points],
        },
      };

    case 'STROKE_FINISH':
      if (!state.currentStroke || state.currentStroke.points.length === 0) {
        return {
          ...state,
          isDrawing: false,
          currentStroke: null,
        };
      }
      return {
        ...state,
        blurStrokes: [...state.blurStrokes, state.currentStroke],
        isDrawing: false,
        currentStroke: null,
      };

    case 'STROKE_CANCEL':
      if (!state.isDrawing && !state.currentStroke) return state;
      return {
        ...state,
        isDrawing: false,
        currentStroke: null,
      };

    case 'SHOW_OUTLINES_SET':
      return {
        ...state,
        showBlurOutlines: event.showBlurOutlines,
      };

    case 'SELECTED_STROKE_INDICES_SET':
      return {
        ...state,
        selectedStrokeIndices: event.selectedStrokeIndices,
      };

    default:
      return state;
  }
}
