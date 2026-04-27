export interface CanvasContentClientRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function parseCssPixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCanvasContentClientRect(
  canvas: HTMLCanvasElement,
): CanvasContentClientRect | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const styles = getComputedStyle(canvas);
  const borderLeft = parseCssPixelValue(styles.borderLeftWidth);
  const borderRight = parseCssPixelValue(styles.borderRightWidth);
  const borderTop = parseCssPixelValue(styles.borderTopWidth);
  const borderBottom = parseCssPixelValue(styles.borderBottomWidth);

  const left = rect.left + borderLeft;
  const top = rect.top + borderTop;
  const width = rect.width - borderLeft - borderRight;
  const height = rect.height - borderTop - borderBottom;

  if (width <= 0 || height <= 0) return null;

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}
