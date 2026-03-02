import {create} from 'zustand';
import {RESET_AUTO_BLUR_SETTINGS_EVENT} from '@/features/editor/lib/events';
import {
  createTemplateId,
  normalizeTemplateName,
  orderBySidePreference,
} from '@/features/editor/state/store/helpers';
import {
  denormalizeTemplateToStrokes,
  normalizeStrokesForTemplate,
  saveBlurTemplates,
} from '@/features/editor/state/blur-templates-storage';
import {saveAutoBlurDefaults} from '@/features/editor/state/auto-blur-defaults-storage';
import {saveAutoBlurCustomTexts} from '@/features/editor/state/auto-blur-custom-text-storage';
import {saveSkipResetProjectConfirmation} from '@/features/editor/state/reset-project-confirmation-storage';
import {createBaseState} from '@/features/editor/state/store/base-state';
import {reduceEditorState} from '@/features/editor/state/reducers/reducer-root';
import {
  hydratePersistedSettings,
  getHydrationStatus,
} from '@/features/editor/state/storage/hydration';
import {installPersistedSettingsSubscription} from '@/features/editor/state/storage/persist-subscription';
import type {AppEvent} from './events';
import type {ActionResult, EditorStoreState} from './types';

let splitRatioDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function clearSplitRatioTimer() {
  if (splitRatioDebounceTimer) {
    clearTimeout(splitRatioDebounceTimer);
    splitRatioDebounceTimer = null;
  }
}

const baseState = createBaseState(hydratePersistedSettings());

export const useEditorStore = create<EditorStoreState>()((set, get) => {
  const dispatch = (event: AppEvent) => {
    set((state) => reduceEditorState(state, event));
  };

  const pushHistorySnapshot = () => dispatch({type: 'HISTORY_PUSH_SNAPSHOT'});

  return {
    ...baseState,
    dispatch,

    initializeEditor: (payload) => {
      clearSplitRatioTimer();
      dispatch({type: 'DOCUMENT_INITIALIZE', payload});
      pushHistorySnapshot();
    },

    resetProject: () => {
      clearSplitRatioTimer();
      dispatch({type: 'PROJECT_RESET'});
    },

    resetSettingsToDefaults: () => {
      saveAutoBlurDefaults({email: false, phone: false, customEntries: []});
      saveAutoBlurCustomTexts([]);
      saveSkipResetProjectConfirmation(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(RESET_AUTO_BLUR_SETTINGS_EVENT));
      }
      dispatch({type: 'SETTINGS_RESET'});
    },

    setActiveTool: (activeTool) => dispatch({type: 'ACTIVE_TOOL_SET', activeTool}),
    setIsShiftPressed: (isShiftPressed) => dispatch({type: 'SHIFT_PRESSED_SET', isShiftPressed}),
    setBrushRadius: (brushRadius) => dispatch({type: 'BRUSH_RADIUS_SET', brushRadius}),
    setBrushStrength: (brushStrength) => dispatch({type: 'BRUSH_STRENGTH_SET', brushStrength}),
    setBlurType: (blurType) => dispatch({type: 'BLUR_TYPE_SET', blurType}),
    setBlurStrokeShape: (blurStrokeShape) =>
      dispatch({type: 'BLUR_STROKE_SHAPE_SET', blurStrokeShape}),
    setZoom: (zoom) => dispatch({type: 'ZOOM_SET', zoom}),
    setPan: (panX, panY) => dispatch({type: 'PAN_SET', panX, panY}),

    setSplitDirection: (splitDirection, options) => {
      dispatch({type: 'SPLIT_DIRECTION_SET', splitDirection});
      if (options?.commitHistory ?? true) {
        pushHistorySnapshot();
      }
    },

    setSplitRatio: (value, options) => {
      dispatch({type: 'SPLIT_RATIO_SET', splitRatio: value});
      if (!(options?.debouncedHistory ?? true)) return;

      clearSplitRatioTimer();
      splitRatioDebounceTimer = setTimeout(() => {
        pushHistorySnapshot();
        splitRatioDebounceTimer = null;
      }, 400);
    },

    setLightImageSide: (nextSide, options) => {
      const state = get();
      if (state.lightImageSide === nextSide) return;

      dispatch({type: 'LIGHT_IMAGE_SIDE_SET', lightImageSide: nextSide});

      if (!(options?.reorderImages ?? true)) return;
      if (!state.image1 || !state.image2) return;

      const currentLight = state.lightImageSide === 'left' ? state.image1 : state.image2;
      const currentDark = state.lightImageSide === 'left' ? state.image2 : state.image1;
      const ordered = orderBySidePreference(currentLight, currentDark, nextSide);
      dispatch({type: 'DOCUMENT_IMAGES_SET', image1: ordered.image1, image2: ordered.image2});
      pushHistorySnapshot();
    },

    updateBlurStrokesAtIndices: (indices, patch, options) => {
      const before = get().blurStrokes;
      dispatch({type: 'STROKES_PATCH_AT_INDICES', indices, patch});
      const changed = get().blurStrokes !== before;
      if (changed && (options?.commitHistory ?? false)) {
        pushHistorySnapshot();
      }
      return changed;
    },

    appendBlurStrokes: (strokes, options) => {
      const before = get().blurStrokes;
      dispatch({type: 'STROKES_APPEND', strokes});
      const changed = get().blurStrokes !== before;
      if (changed && (options?.commitHistory ?? true)) {
        pushHistorySnapshot();
      }
      return changed;
    },

    startStroke: (x, y, options) =>
      dispatch({type: 'STROKE_START', point: {x, y}, shape: options?.shape ?? 'brush'}),

    setCurrentStrokeEndpoint: (x, y) => dispatch({type: 'STROKE_ENDPOINT_SET', point: {x, y}}),

    appendStrokePoints: (points) => dispatch({type: 'STROKE_POINTS_APPEND', points}),

    appendStrokePoint: (x, y) => dispatch({type: 'STROKE_POINTS_APPEND', points: [{x, y}]}),

    finishStroke: () => {
      const currentStroke = get().currentStroke;
      dispatch({type: 'STROKE_FINISH'});
      if (currentStroke && currentStroke.points.length > 0) {
        pushHistorySnapshot();
      }
    },

    cancelStroke: () => dispatch({type: 'STROKE_CANCEL'}),

    clearBlurStrokes: () => {
      const state = get();
      if (state.blurStrokes.length === 0 && !state.currentStroke) return;
      dispatch({type: 'STROKES_CLEAR'});
      pushHistorySnapshot();
    },

    setShowBlurOutlines: (showBlurOutlines) =>
      dispatch({type: 'SHOW_OUTLINES_SET', showBlurOutlines}),
    setSelectedStrokeIndices: (selectedStrokeIndices) =>
      dispatch({type: 'SELECTED_STROKE_INDICES_SET', selectedStrokeIndices}),

    toggleSplitViewSidebar: () => dispatch({type: 'SPLIT_VIEW_SIDEBAR_TOGGLE'}),
    setSplitViewSidebarOpen: (showSplitViewSidebar) =>
      dispatch({type: 'SPLIT_VIEW_SIDEBAR_SET', showSplitViewSidebar}),
    setSelectedTemplate: (selectedTemplateId) =>
      dispatch({type: 'SELECTED_TEMPLATE_SET', selectedTemplateId}),

    createBlurTemplate: (name) => {
      const state = get();
      const normalizedName = normalizeTemplateName(name);
      if (!normalizedName) {
        return {ok: false, error: 'Template name is required.'} satisfies ActionResult;
      }
      if (state.blurStrokes.length === 0) {
        return {
          ok: false,
          error: 'Create at least one blur stroke before saving a template.',
        } satisfies ActionResult;
      }
      if (!state.imageWidth || !state.imageHeight) {
        return {ok: false, error: 'Image size is not ready yet.'} satisfies ActionResult;
      }

      const nameKey = normalizedName.toLowerCase();
      const exists = state.blurTemplates.some(
        (template) => template.name.trim().toLowerCase() === nameKey,
      );
      if (exists) {
        return {ok: false, error: 'Template name must be unique.'} satisfies ActionResult;
      }

      const now = new Date().toISOString();
      const template = {
        id: createTemplateId(),
        name: normalizedName,
        sourceWidth: state.imageWidth,
        sourceHeight: state.imageHeight,
        strokes: normalizeStrokesForTemplate(
          state.blurStrokes,
          state.imageWidth,
          state.imageHeight,
        ),
        createdAt: now,
        updatedAt: now,
      };

      const blurTemplates = [...state.blurTemplates, template];
      saveBlurTemplates(blurTemplates);
      dispatch({type: 'BLUR_TEMPLATES_SET', blurTemplates, selectedTemplateId: template.id});

      return {ok: true} satisfies ActionResult;
    },

    updateBlurTemplate: (templateId, name) => {
      const state = get();
      const normalizedName = normalizeTemplateName(name);
      if (!normalizedName) {
        return {ok: false, error: 'Template name is required.'} satisfies ActionResult;
      }
      if (state.blurStrokes.length === 0) {
        return {
          ok: false,
          error: 'Create at least one blur stroke before updating a template.',
        } satisfies ActionResult;
      }
      if (!state.imageWidth || !state.imageHeight) {
        return {ok: false, error: 'Image size is not ready yet.'} satisfies ActionResult;
      }

      const target = state.blurTemplates.find((template) => template.id === templateId);
      if (!target) {
        return {ok: false, error: 'Selected template was not found.'} satisfies ActionResult;
      }

      const normalizedKey = normalizedName.toLowerCase();
      const duplicate = state.blurTemplates.some(
        (template) =>
          template.id !== templateId && template.name.trim().toLowerCase() === normalizedKey,
      );
      if (duplicate) {
        return {ok: false, error: 'Template name must be unique.'} satisfies ActionResult;
      }

      const updatedAt = new Date().toISOString();
      const blurTemplates = state.blurTemplates.map((template) => {
        if (template.id !== templateId) return template;
        return {
          ...template,
          name: normalizedName,
          sourceWidth: state.imageWidth,
          sourceHeight: state.imageHeight,
          strokes: normalizeStrokesForTemplate(
            state.blurStrokes,
            state.imageWidth,
            state.imageHeight,
          ),
          updatedAt,
        };
      });

      saveBlurTemplates(blurTemplates);
      dispatch({type: 'BLUR_TEMPLATES_SET', blurTemplates, selectedTemplateId: templateId});
      return {ok: true} satisfies ActionResult;
    },

    reorderBlurTemplates: (fromIndex, toIndex) => {
      const state = get();
      const {blurTemplates} = state;
      if (
        !Number.isInteger(fromIndex) ||
        !Number.isInteger(toIndex) ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= blurTemplates.length ||
        toIndex >= blurTemplates.length
      ) {
        return {ok: false, error: 'Template order index is invalid.'} satisfies ActionResult;
      }

      if (fromIndex === toIndex) return {ok: true} satisfies ActionResult;

      const reorderedTemplates = [...blurTemplates];
      const [movedTemplate] = reorderedTemplates.splice(fromIndex, 1);
      reorderedTemplates.splice(toIndex, 0, movedTemplate);
      saveBlurTemplates(reorderedTemplates);
      dispatch({type: 'BLUR_TEMPLATES_SET', blurTemplates: reorderedTemplates});
      return {ok: true} satisfies ActionResult;
    },

    deleteBlurTemplate: (templateId) => {
      const state = get();
      const exists = state.blurTemplates.some((template) => template.id === templateId);
      if (!exists) {
        return {ok: false, error: 'Selected template was not found.'} satisfies ActionResult;
      }

      const blurTemplates = state.blurTemplates.filter((template) => template.id !== templateId);
      saveBlurTemplates(blurTemplates);
      dispatch({
        type: 'BLUR_TEMPLATES_SET',
        blurTemplates,
        selectedTemplateId:
          state.selectedTemplateId === templateId ? null : state.selectedTemplateId,
      });
      return {ok: true} satisfies ActionResult;
    },

    loadBlurTemplate: (templateId) => {
      const state = get();
      const template = state.blurTemplates.find((item) => item.id === templateId);
      if (!template) {
        return {ok: false, error: 'Selected template was not found.'} satisfies ActionResult;
      }

      const targetWidth = state.imageWidth || template.sourceWidth;
      const targetHeight = state.imageHeight || template.sourceHeight;
      const blurStrokes = denormalizeTemplateToStrokes(template.strokes, targetWidth, targetHeight);
      dispatch({type: 'STROKES_APPEND', strokes: blurStrokes});
      dispatch({type: 'SELECTED_TEMPLATE_SET', selectedTemplateId: templateId});
      pushHistorySnapshot();
      return {ok: true} satisfies ActionResult;
    },

    openExportModal: () => dispatch({type: 'EXPORT_MODAL_OPEN'}),
    closeExportModal: () => dispatch({type: 'EXPORT_MODAL_CLOSE'}),
    openResetProjectModal: () => dispatch({type: 'RESET_PROJECT_MODAL_OPEN'}),
    closeResetProjectModal: () => dispatch({type: 'RESET_PROJECT_MODAL_CLOSE'}),
    setExportBaseName: (name) =>
      dispatch({type: 'EXPORT_BASE_NAME_SET', exportBaseName: name?.trim() || null}),
    openShortcutsModal: () => dispatch({type: 'SHORTCUTS_MODAL_OPEN'}),
    closeShortcutsModal: () => dispatch({type: 'SHORTCUTS_MODAL_CLOSE'}),
    toggleShortcutsModal: () => dispatch({type: 'SHORTCUTS_MODAL_TOGGLE'}),
    openLightSelector: ({firstImage, secondImage}) =>
      dispatch({type: 'LIGHT_SELECTOR_OPEN', firstImage, secondImage}),
    resolveLightSelector: (selection) => dispatch({type: 'LIGHT_SELECTOR_RESOLVE', selection}),
    setDocumentImages: (image1, image2) => {
      dispatch({type: 'DOCUMENT_IMAGES_SET', image1, image2});
      if (image2) {
        dispatch({type: 'SPLIT_VIEW_SIDEBAR_SET', showSplitViewSidebar: true});
      }
    },
    setBlurStrokesTransient: (strokes) =>
      dispatch({type: 'STROKES_SET_TRANSIENT', blurStrokes: strokes}),

    addSecondImage: (image2) => {
      dispatch({type: 'SECOND_IMAGE_SET', image2});
      pushHistorySnapshot();
    },
    removeSecondImage: () => {
      dispatch({type: 'SECOND_IMAGE_SET', image2: null});
      pushHistorySnapshot();
    },

    pushHistorySnapshot,
    undo: () => dispatch({type: 'HISTORY_UNDO'}),
    redo: () => dispatch({type: 'HISTORY_REDO'}),
  };
});

if (typeof window !== 'undefined') {
  installPersistedSettingsSubscription(useEditorStore);
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    const hydration = getHydrationStatus();
    console.debug('[editor:persistence] hydration', hydration);
  }
}

export const useEditorStoreApi = () => useEditorStore;
export const useEditorDispatch = () => useEditorStore((state) => state.dispatch);
