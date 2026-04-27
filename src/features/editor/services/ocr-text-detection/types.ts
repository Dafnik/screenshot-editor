import type {EmailBoundingBox} from '@/features/editor/lib/email-blur-strokes';
import type {SplitDirection} from '@/features/editor/state/types';

export interface DetectTextInImageOptions {
  image1: string;
  image2: string | null;
  imageWidth: number;
  imageHeight: number;
  splitDirection: SplitDirection;
  splitRatio: number;
}

export interface OcrWord {
  text?: unknown;
  bbox?: {
    x0?: unknown;
    y0?: unknown;
    x1?: unknown;
    y1?: unknown;
    x?: unknown;
    y?: unknown;
    w?: unknown;
    h?: unknown;
    width?: unknown;
    height?: unknown;
  };
}

export interface OcrLine {
  words?: OcrWord[];
  text?: unknown;
  bbox?: OcrWord['bbox'];
}

export interface OcrParagraph {
  lines?: OcrLine[] | null;
}

export interface OcrBlock {
  paragraphs?: OcrParagraph[] | null;
}

export interface OcrData {
  blocks?: OcrBlock[] | null;
  words?: OcrWord[];
  lines?: OcrLine[];
}

export interface OcrWorker {
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  recognize: (
    image: HTMLCanvasElement,
    options?: Record<string, unknown>,
    output?: Record<string, boolean>,
  ) => Promise<{data?: OcrData}>;
  terminate: () => Promise<unknown>;
}

export interface DetectedTextMatch {
  text: string;
  box: EmailBoundingBox;
}

export interface PhoneWord {
  text: string;
  normalizedText: string;
  standalonePhone: string | null;
  box: EmailBoundingBox;
}

export interface WordSegment {
  word: PhoneWord;
  start: number;
  end: number;
}

export interface WordRow {
  words: PhoneWord[];
  top: number;
  bottom: number;
}
