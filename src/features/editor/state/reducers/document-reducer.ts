import {withHistoryMeta} from '@/features/editor/state/history';
import {orderBySidePreference} from '@/features/editor/state/store/helpers';
import {DEFAULT_SETTINGS} from '@/features/editor/state/types';
import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

export function documentReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'DOCUMENT_INITIALIZE': {
      const {image1, image2, width, height, exportBaseName} = event.payload;
      return {
        ...state,
        image1,
        image2,
        imageWidth: width,
        imageHeight: height,
        splitRatio: image2 ? state.splitRatio : DEFAULT_SETTINGS.splitRatio,
        splitDirection: image2 ? state.splitDirection : DEFAULT_SETTINGS.splitDirection,
        blurStrokes: [],
        isDrawing: false,
        currentStroke: null,
        isEditing: true,
        panX: 0,
        panY: 0,
        showExportModal: false,
        showResetProjectModal: false,
        exportBaseName: exportBaseName ?? null,
        showShortcutsModal: false,
        showLightSelectorModal: false,
        selectorFirstImage: null,
        selectorSecondImage: null,
        lightSelectorState: 'idle',
        showSplitViewSidebar: Boolean(image2),
        selectedTemplateId: null,
        selectedStrokeIndices: [],
        isShiftPressed: false,
        ...withHistoryMeta([], -1),
      };
    }

    case 'PROJECT_RESET':
      return {
        ...state,
        image1: null,
        image2: null,
        imageWidth: 0,
        imageHeight: 0,
        blurStrokes: [],
        isDrawing: false,
        currentStroke: null,
        isEditing: false,
        showExportModal: false,
        showResetProjectModal: false,
        exportBaseName: null,
        showShortcutsModal: false,
        showLightSelectorModal: false,
        selectorFirstImage: null,
        selectorSecondImage: null,
        lightSelectorState: 'idle',
        showSplitViewSidebar: false,
        selectedTemplateId: null,
        selectedStrokeIndices: [],
        showBlurOutlines: false,
        isShiftPressed: false,
        panX: 0,
        panY: 0,
        ...withHistoryMeta([], -1),
      };

    case 'SETTINGS_RESET':
      return {
        ...state,
        splitRatio: DEFAULT_SETTINGS.splitRatio,
        splitDirection: DEFAULT_SETTINGS.splitDirection,
        brushRadius: DEFAULT_SETTINGS.brushRadius,
        brushStrength: DEFAULT_SETTINGS.brushStrength,
        blurType: DEFAULT_SETTINGS.blurType,
        blurStrokeShape: DEFAULT_SETTINGS.blurStrokeShape,
        activeTool: DEFAULT_SETTINGS.activeTool,
        isShiftPressed: false,
        lightImageSide: DEFAULT_SETTINGS.lightImageSide,
        zoom: DEFAULT_SETTINGS.zoom,
        showBlurOutlines: false,
      };

    case 'SPLIT_DIRECTION_SET':
      return {
        ...state,
        splitDirection: event.splitDirection,
      };

    case 'SPLIT_RATIO_SET':
      return {
        ...state,
        splitRatio: Math.max(10, Math.min(90, event.splitRatio)),
      };

    case 'LIGHT_IMAGE_SIDE_SET':
      return {
        ...state,
        lightImageSide: event.lightImageSide,
      };

    case 'DOCUMENT_IMAGES_SET':
      return {
        ...state,
        image1: event.image1,
        image2: event.image2,
      };

    case 'SECOND_IMAGE_SET':
      return {
        ...state,
        image2: event.image2,
        showSplitViewSidebar: event.image2 ? true : state.showSplitViewSidebar,
      };

    default:
      return state;
  }
}

export function reorderImagesByLightSide(
  state: AppState,
  lightImageSide: AppState['lightImageSide'],
): Pick<AppState, 'image1' | 'image2'> | null {
  if (!state.image1 || !state.image2) return null;

  const currentLight = state.lightImageSide === 'left' ? state.image1 : state.image2;
  const currentDark = state.lightImageSide === 'left' ? state.image2 : state.image1;
  return orderBySidePreference(currentLight, currentDark, lightImageSide);
}
