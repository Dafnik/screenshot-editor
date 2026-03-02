import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

export function uiReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'SPLIT_VIEW_SIDEBAR_TOGGLE':
      return {
        ...state,
        showSplitViewSidebar: !state.showSplitViewSidebar,
      };
    case 'SPLIT_VIEW_SIDEBAR_SET':
      return {
        ...state,
        showSplitViewSidebar: event.showSplitViewSidebar,
      };
    case 'SELECTED_TEMPLATE_SET':
      return {
        ...state,
        selectedTemplateId: event.selectedTemplateId,
      };
    case 'BLUR_TEMPLATES_SET':
      return {
        ...state,
        blurTemplates: event.blurTemplates,
        selectedTemplateId:
          event.selectedTemplateId === undefined
            ? state.selectedTemplateId
            : event.selectedTemplateId,
      };
    case 'EXPORT_MODAL_OPEN':
      return {...state, showExportModal: true};
    case 'EXPORT_MODAL_CLOSE':
      return {...state, showExportModal: false};
    case 'RESET_PROJECT_MODAL_OPEN':
      return {...state, showResetProjectModal: true};
    case 'RESET_PROJECT_MODAL_CLOSE':
      return {...state, showResetProjectModal: false};
    case 'EXPORT_BASE_NAME_SET':
      return {...state, exportBaseName: event.exportBaseName};
    case 'SHORTCUTS_MODAL_OPEN':
      return {...state, showShortcutsModal: true};
    case 'SHORTCUTS_MODAL_CLOSE':
      return {...state, showShortcutsModal: false};
    case 'SHORTCUTS_MODAL_TOGGLE':
      return {...state, showShortcutsModal: !state.showShortcutsModal};
    case 'LIGHT_SELECTOR_OPEN':
      return {
        ...state,
        showLightSelectorModal: true,
        selectorFirstImage: event.firstImage,
        selectorSecondImage: event.secondImage,
        lightSelectorState: 'awaitingSelection',
      };
    case 'LIGHT_SELECTOR_RESOLVE':
      return {
        ...state,
        showLightSelectorModal: false,
        selectorFirstImage: null,
        selectorSecondImage: null,
        lightSelectorState: event.selection === 'cancel' ? 'cancelled' : 'resolved',
      };
    default:
      return state;
  }
}
