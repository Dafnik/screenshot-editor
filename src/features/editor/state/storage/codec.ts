import {DEFAULT_SETTINGS, type PersistedSettings} from '@/features/editor/state/types';
import {PERSIST_VERSION, type PersistedSettingsEnvelope} from './schema';

const VALID_SPLIT_DIRECTIONS = new Set([
  'horizontal',
  'vertical',
  'diagonal-tl-br',
  'diagonal-tr-bl',
]);
const VALID_BLUR_STROKE_SHAPES = new Set(['brush', 'box']);
const VALID_BLUR_TYPES = new Set(['normal', 'pixelated']);
const VALID_ACTIVE_TOOLS = new Set(['drag', 'select', 'blur']);
const VALID_LIGHT_SIDES = new Set(['left', 'right']);

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function sanitizePersistedSettings(
  input: Partial<Record<keyof PersistedSettings, unknown>>,
): PersistedSettings {
  const splitDirection = VALID_SPLIT_DIRECTIONS.has(String(input.splitDirection))
    ? (input.splitDirection as PersistedSettings['splitDirection'])
    : DEFAULT_SETTINGS.splitDirection;
  const blurStrokeShape = VALID_BLUR_STROKE_SHAPES.has(String(input.blurStrokeShape))
    ? (input.blurStrokeShape as PersistedSettings['blurStrokeShape'])
    : DEFAULT_SETTINGS.blurStrokeShape;
  const blurType = VALID_BLUR_TYPES.has(String(input.blurType))
    ? (input.blurType as PersistedSettings['blurType'])
    : DEFAULT_SETTINGS.blurType;
  const activeTool = VALID_ACTIVE_TOOLS.has(String(input.activeTool))
    ? (input.activeTool as PersistedSettings['activeTool'])
    : DEFAULT_SETTINGS.activeTool;
  const lightImageSide = VALID_LIGHT_SIDES.has(String(input.lightImageSide))
    ? (input.lightImageSide as PersistedSettings['lightImageSide'])
    : DEFAULT_SETTINGS.lightImageSide;

  return {
    splitRatio: clampNumber(input.splitRatio, DEFAULT_SETTINGS.splitRatio, 10, 90),
    splitDirection,
    blurStrokeShape,
    brushRadius: clampNumber(input.brushRadius, DEFAULT_SETTINGS.brushRadius, 5, 100),
    brushStrength: clampNumber(input.brushStrength, DEFAULT_SETTINGS.brushStrength, 1, 30),
    blurType,
    activeTool,
    lightImageSide,
    zoom: clampNumber(input.zoom, DEFAULT_SETTINGS.zoom, 10, 500),
  };
}

export function encodePersistedState(settings: PersistedSettings): string {
  const envelope: PersistedSettingsEnvelope = {
    version: PERSIST_VERSION,
    savedAt: Date.now(),
    settings: sanitizePersistedSettings(settings),
  };
  return JSON.stringify(envelope);
}

export type DecodePersistedResult =
  | {ok: true; settings: PersistedSettings}
  | {ok: false; reason: 'invalid-json' | 'invalid-shape' | 'unsupported-version'};

export function decodePersistedState(raw: string): DecodePersistedResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return {ok: false, reason: 'invalid-json'};
  }

  if (!parsed || typeof parsed !== 'object') {
    return {ok: false, reason: 'invalid-shape'};
  }

  const envelope = parsed as Partial<PersistedSettingsEnvelope>;
  if (envelope.version !== PERSIST_VERSION) {
    return {ok: false, reason: 'unsupported-version'};
  }
  if (!envelope.settings || typeof envelope.settings !== 'object') {
    return {ok: false, reason: 'invalid-shape'};
  }

  return {
    ok: true,
    settings: sanitizePersistedSettings(
      envelope.settings as Partial<Record<keyof PersistedSettings, unknown>>,
    ),
  };
}
