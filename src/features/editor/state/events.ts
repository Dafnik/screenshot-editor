import type {AppState} from './app-state';
import type {
  ActiveTool,
  BlurStroke,
  BlurStrokePatch,
  BlurStrokeShape,
  BlurTemplate,
  BlurType,
  InitializeEditorPayload,
  LightImageSide,
  LightSelection,
  Point,
  SplitDirection,
} from './types';

export type AppEvent =
  | {type: 'DOCUMENT_INITIALIZE'; payload: InitializeEditorPayload}
  | {type: 'PROJECT_RESET'}
  | {type: 'SETTINGS_RESET'}
  | {type: 'SPLIT_DIRECTION_SET'; splitDirection: SplitDirection}
  | {type: 'SPLIT_RATIO_SET'; splitRatio: number}
  | {type: 'LIGHT_IMAGE_SIDE_SET'; lightImageSide: LightImageSide}
  | {type: 'DOCUMENT_IMAGES_SET'; image1: string; image2: string | null}
  | {type: 'SECOND_IMAGE_SET'; image2: string | null}
  | {type: 'ACTIVE_TOOL_SET'; activeTool: ActiveTool}
  | {type: 'SHIFT_PRESSED_SET'; isShiftPressed: boolean}
  | {type: 'BRUSH_RADIUS_SET'; brushRadius: number}
  | {type: 'BRUSH_STRENGTH_SET'; brushStrength: number}
  | {type: 'BLUR_TYPE_SET'; blurType: BlurType}
  | {type: 'BLUR_STROKE_SHAPE_SET'; blurStrokeShape: BlurStrokeShape}
  | {type: 'ZOOM_SET'; zoom: number}
  | {type: 'PAN_SET'; panX: number; panY: number}
  | {type: 'STROKES_SET_TRANSIENT'; blurStrokes: BlurStroke[]}
  | {type: 'STROKES_APPEND'; strokes: BlurStroke[]}
  | {type: 'STROKES_CLEAR'}
  | {type: 'STROKES_PATCH_AT_INDICES'; indices: number[]; patch: BlurStrokePatch}
  | {type: 'STROKE_START'; point: Point; shape: BlurStrokeShape}
  | {type: 'STROKE_ENDPOINT_SET'; point: Point}
  | {type: 'STROKE_POINTS_APPEND'; points: Point[]}
  | {type: 'STROKE_FINISH'}
  | {type: 'STROKE_CANCEL'}
  | {type: 'SHOW_OUTLINES_SET'; showBlurOutlines: boolean}
  | {type: 'SELECTED_STROKE_INDICES_SET'; selectedStrokeIndices: number[]}
  | {type: 'SPLIT_VIEW_SIDEBAR_TOGGLE'}
  | {type: 'SPLIT_VIEW_SIDEBAR_SET'; showSplitViewSidebar: boolean}
  | {type: 'SELECTED_TEMPLATE_SET'; selectedTemplateId: string | null}
  | {type: 'BLUR_TEMPLATES_SET'; blurTemplates: BlurTemplate[]; selectedTemplateId?: string | null}
  | {type: 'EXPORT_MODAL_OPEN'}
  | {type: 'EXPORT_MODAL_CLOSE'}
  | {type: 'RESET_PROJECT_MODAL_OPEN'}
  | {type: 'RESET_PROJECT_MODAL_CLOSE'}
  | {type: 'EXPORT_BASE_NAME_SET'; exportBaseName: string | null}
  | {type: 'SHORTCUTS_MODAL_OPEN'}
  | {type: 'SHORTCUTS_MODAL_CLOSE'}
  | {type: 'SHORTCUTS_MODAL_TOGGLE'}
  | {type: 'LIGHT_SELECTOR_OPEN'; firstImage: string; secondImage: string}
  | {type: 'LIGHT_SELECTOR_RESOLVE'; selection: LightSelection}
  | {type: 'HISTORY_PUSH_SNAPSHOT'}
  | {type: 'HISTORY_UNDO'}
  | {type: 'HISTORY_REDO'};

export type AppDispatch = (event: AppEvent) => void;

export type AppReducer = (state: AppState, event: AppEvent) => AppState;
