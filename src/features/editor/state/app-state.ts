import type {
  DocumentSlice,
  HistorySlice,
  InteractionSlice,
  ToolSlice,
  UiSlice,
  ViewportSlice,
} from './types';

export type AppState = DocumentSlice &
  ToolSlice &
  ViewportSlice &
  InteractionSlice &
  UiSlice &
  HistorySlice;
