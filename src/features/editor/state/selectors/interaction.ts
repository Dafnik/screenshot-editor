import type {EditorStoreState} from '@/features/editor/state/types';

export const selectDrawingState = (state: EditorStoreState) => ({
  isDrawing: state.isDrawing,
  currentStroke: state.currentStroke,
});
