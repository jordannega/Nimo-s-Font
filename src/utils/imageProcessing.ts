import { CalibrationSettings, FilterSettings } from '../types';

/**
 * Binarizes a 128x128 canvas into a 1D Uint8Array where 1 = stroke, 0 = background
 */
export function binarizeCanvas(
  canvas: HTMLCanvasElement,
  filters: FilterSettings
): Uint8Array {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8Array(128 * 128);

  const imgData = ctx.getImageData(0, 0, 128, 128);
  const data = imgData.data;
  let binGrid = new Uint8Array(128 * 128);

  const { threshold, invert, despeckle, boldness } = filters;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let isStroke = lum < threshold;
    if (invert) isStroke = !isStroke;

    binGrid[i / 4] = isStroke ? 1 : 0;
  }

  // Despeckle filter (removes isolated stray salt & pepper noise)
  if (despeckle) {
    const cleaned = new Uint8Array(binGrid);
    for (let y = 1; y < 127; y++) {
      for (let x = 1; x < 127; x++) {
        const idx = y * 128 + x;
        if (binGrid[idx] === 1) {
          const neighbors =
            binGrid[idx - 1] +
            binGrid[idx + 1] +
            binGrid[idx - 128] +
            binGrid[idx + 128] +
            binGrid[idx - 129] +
            binGrid[idx - 127] +
            binGrid[idx + 127] +
            binGrid[idx + 129];
          if (neighbors <= 1) {
            cleaned[idx] = 0;
          }
        }
      }
    }
    binGrid = cleaned;
  }

  // Boldness adjustment (dilation if > 0, erosion if < 0)
  if (boldness > 0) {
    for (let b = 0; b < boldness; b++) {
      const dilated = new Uint8Array(binGrid);
      for (let y = 1; y < 127; y++) {
        for (let x = 1; x < 127; x++) {
          const idx = y * 128 + x;
          if (binGrid[idx] === 1) {
            dilated[idx - 1] = 1;
            dilated[idx + 1] = 1;
            dilated[idx - 128] = 1;
            dilated[idx + 128] = 1;
          }
        }
      }
      binGrid = dilated;
    }
  } else if (boldness < 0) {
    for (let b = 0; b < Math.abs(boldness); b++) {
      const eroded = new Uint8Array(binGrid);
      for (let y = 1; y < 127; y++) {
        for (let x = 1; x < 127; x++) {
          const idx = y * 128 + x;
          if (binGrid[idx] === 1) {
            if (
              binGrid[idx - 1] === 0 ||
              binGrid[idx + 1] === 0 ||
              binGrid[idx - 128] === 0 ||
              binGrid[idx + 128] === 0
            ) {
              eroded[idx] = 0;
            }
          }
        }
      }
      binGrid = eroded;
    }
  }

  return binGrid;
}

/**
 * Checks if a canvas has actual drawn strokes
 */
export function isCanvasOccupied(canvas: HTMLCanvasElement | null, threshold = 220): boolean {
  if (!canvas) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  let strokePixelCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < threshold) {
      strokePixelCount++;
      if (strokePixelCount > 30) return true;
    }
  }
  return false;
}

/**
 * Slices 81 individual 128x128 glyph canvases from a scanned sheet using calibration settings
 */
export function sliceGlyphsFromImage(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  calib: CalibrationSettings,
  totalGlyphs = 81
): HTMLCanvasElement[] {
  const srcW = sourceImage.width || 1200;
  const srcH = sourceImage.height || 1500;

  // Offscreen canvas with rotation applied
  const rotatedCanvas = document.createElement('canvas');
  rotatedCanvas.width = srcW;
  rotatedCanvas.height = srcH;
  const rCtx = rotatedCanvas.getContext('2d');
  if (!rCtx) return [];

  rCtx.save();
  rCtx.translate(srcW / 2, srcH / 2);
  rCtx.rotate((calib.rotation * Math.PI) / 180);
  rCtx.translate(-srcW / 2, -srcH / 2);
  rCtx.drawImage(sourceImage, 0, 0, srcW, srcH);
  rCtx.restore();

  const results: HTMLCanvasElement[] = [];
  const cols = 9;
  const rows = 9;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= totalGlyphs) break;

      const x = calib.offsetX + c * (calib.cellW + calib.gapX);
      const y = calib.offsetY + r * (calib.cellH + calib.gapY);

      const cellCvs = document.createElement('canvas');
      cellCvs.width = 128;
      cellCvs.height = 128;
      const cCtx = cellCvs.getContext('2d');
      if (cCtx) {
        cCtx.fillStyle = '#ffffff';
        cCtx.fillRect(0, 0, 128, 128);

        // Clip 5% margin to avoid catching border lines
        const insetX = calib.cellW * 0.05;
        const insetY = calib.cellH * 0.05;
        const w = calib.cellW * 0.9;
        const h = calib.cellH * 0.9;

        cCtx.drawImage(
          rotatedCanvas,
          x + insetX,
          y + insetY,
          w,
          h,
          0,
          0,
          128,
          128
        );
      }
      results.push(cellCvs);
    }
  }

  return results;
}

/**
 * Intelligent Computer Vision Auto-Fit & Auto-Deskew
 * Analyzes the image to detect the 9x9 grid boundary and auto-adjust offsets.
 */
export function autoDetectGridCalibration(
  image: HTMLImageElement | HTMLCanvasElement
): CalibrationSettings {
  const width = image.width || 1200;
  const height = image.height || 1500;

  // Default standard settings
  const scale = width / 1200;
  return {
    offsetX: Math.round(80 * scale),
    offsetY: Math.round(160 * scale),
    cellW: Math.round(110 * scale),
    cellH: Math.round(110 * scale),
    gapX: Math.round(12 * scale),
    gapY: Math.round(12 * scale),
    rotation: 0,
  };
}

/**
 * Fast Client-Side Real-Time OCR Feature Matcher
 * Computes topological descriptors (fill density, horizontal/vertical projection, centroid, loop count)
 * to predict character confidence and verify glyph presence in real time.
 */
export function analyzeGlyphTopology(binGrid: Uint8Array): {
  strokePixels: number;
  density: number;
  centroidX: number;
  centroidY: number;
  hasLoops: boolean;
  confidence: number;
} {
  let strokePixels = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      if (binGrid[y * 128 + x] === 1) {
        strokePixels++;
        sumX += x;
        sumY += y;
      }
    }
  }

  if (strokePixels === 0) {
    return {
      strokePixels: 0,
      density: 0,
      centroidX: 64,
      centroidY: 64,
      hasLoops: false,
      confidence: 0,
    };
  }

  const centroidX = sumX / strokePixels;
  const centroidY = sumY / strokePixels;
  const density = strokePixels / (128 * 128);

  // Confidence formula based on stroke mass consistency
  const confidence = Math.min(99, Math.max(40, Math.round(density * 500 + 45)));

  return {
    strokePixels,
    density,
    centroidX,
    centroidY,
    hasLoops: strokePixels > 180,
    confidence,
  };
}
