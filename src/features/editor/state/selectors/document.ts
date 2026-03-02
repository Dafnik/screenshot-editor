import type {EditorStoreState} from '@/features/editor/state/types';

export const selectCanvasSize = (state: EditorStoreState) => ({
  width: state.imageWidth || 800,
  height: state.imageHeight || 600,
});

export const selectActiveImages = (state: EditorStoreState) => ({
  image1: state.image1,
  image2: state.image2,
});
