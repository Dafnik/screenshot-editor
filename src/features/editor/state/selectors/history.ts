import type {EditorStoreState} from '@/features/editor/state/types';

export const selectCanUndo = (state: EditorStoreState) => state.canUndo;
export const selectCanRedo = (state: EditorStoreState) => state.canRedo;
