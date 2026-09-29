import opentype from 'opentype.js';
import { CharacterDef, FontMetadata } from '../types';

interface VectorizeOptions {
  unitsPerEm?: number;
  ascender?: number;
  descender?: number;
  letterSpacing?: number;
}

/**
 * Traces outer and inner contours of a binary bitmap into an OpenType Path
 */
export function traceBitmapToOpenTypePath(
  binaryGrid: Uint8Array,
  width = 128,
  height = 128,
  options: VectorizeOptions = {}
): { path: opentype.Path; advanceWidth: number } {
  const path = new opentype.Path();
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  const getPixel = (x: number, y: number): number => {
    if (x < 0 || y < 0 || x >= width || y >= height) return 0;
    return binaryGrid[y * width + x];
  };

  // Boundary edge extraction
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      const top = getPixel(x, y - 1);
      const left = getPixel(x - 1, y);
      const curr = getPixel(x, y);

      if (curr !== top) {
        if (curr === 1) {
          edges.push({ x1: x, y1: y, x2: x + 1, y2: y });
        } else {
          edges.push({ x1: x + 1, y1: y, x2: x, y2: y });
        }
      }

      if (curr !== left) {
        if (curr === 1) {
          edges.push({ x1: x, y1: y + 1, x2: x, y2: y });
        } else {
          edges.push({ x1: x, y1: y, x2: x, y2: y + 1 });
        }
      }
    }
  }

  const em = options.unitsPerEm || 1000;
  const ascender = options.ascender || 800;
  const extraSpacing = options.letterSpacing || 0;

  if (edges.length === 0) {
    return { path, advanceWidth: Math.round(500 + extraSpacing) };
  }

  // Construct edge connectivity graph
  const edgeMap = new Map<string, Array<{ x1: number; y1: number; x2: number; y2: number }>>();
  for (const edge of edges) {
    const key = `${edge.x1},${edge.y1}`;
    if (!edgeMap.has(key)) edgeMap.set(key, []);
    edgeMap.get(key)!.push(edge);
  }

  const visited = new Set<string>();
  const loops: Array<Array<{ x: number; y: number }>> = [];

  for (const edge of edges) {
    const edgeKey = `${edge.x1},${edge.y1}->${edge.x2},${edge.y2}`;
    if (visited.has(edgeKey)) continue;

    const loop: Array<{ x: number; y: number }> = [];
    let curr: { x1: number; y1: number; x2: number; y2: number } | null = edge;

    while (curr) {
      const eKey = `${curr.x1},${curr.y1}->${curr.x2},${curr.y2}`;
      if (visited.has(eKey)) break;
      visited.add(eKey);

      loop.push({ x: curr.x1, y: curr.y1 });

      const nextKey = `${curr.x2},${curr.y2}`;
      const candidates = edgeMap.get(nextKey);
      curr = null;
      if (candidates) {
        for (const candidate of candidates) {
          const cKey = `${candidate.x1},${candidate.y1}->${candidate.x2},${candidate.y2}`;
          if (!visited.has(cKey)) {
            curr = candidate;
            break;
          }
        }
      }
    }

    if (loop.length > 2) {
      loops.push(loop);
    }
  }

  // Bounding box for proportional typography
  let minX = width;
  let maxX = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binaryGrid[y * width + x] === 1) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  const lBearing = 40;
  const rBearing = 40;
  const glyphWidthPx = Math.max(1, maxX - minX + 1);
  const scale = (em * 0.72) / height;

  const mapX = (px: number) => lBearing + (px - minX) * scale;
  const mapY = (py: number) => ascender - 110 - py * scale;

  for (const loop of loops) {
    if (loop.length < 3) continue;
    path.moveTo(mapX(loop[0].x), mapY(loop[0].y));
    for (let i = 1; i < loop.length; i++) {
      path.lineTo(mapX(loop[i].x), mapY(loop[i].y));
    }
    path.close();
  }

  const advanceWidth = Math.round(
    Math.max(280, lBearing + glyphWidthPx * scale + rBearing + extraSpacing)
  );

  return { path, advanceWidth };
}

/**
 * Builds an OpenType Font object with full character set, .notdef, and space glyphs
 */
export function buildOpenTypeFont(
  characters: CharacterDef[],
  bitmaps: Uint8Array[],
  meta: FontMetadata
): { font: opentype.Font; blobUrl: string } {
  const ascender = meta.ascender || 800;
  const descender = meta.descender || -200;

  // 1. .notdef glyph
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(80, 0);
  notdefPath.lineTo(80, 700);
  notdefPath.lineTo(480, 700);
  notdefPath.lineTo(480, 0);
  notdefPath.close();

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 560,
    path: notdefPath,
  });

  // 2. space glyph (ASCII 32)
  const spaceGlyph = new opentype.Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: 320 + (meta.letterSpacing || 0),
    path: new opentype.Path(),
  });

  const glyphList: opentype.Glyph[] = [notdefGlyph, spaceGlyph];

  characters.forEach((charDef, idx) => {
    const binGrid = bitmaps[idx];
    if (!binGrid) return;

    const { path, advanceWidth } = traceBitmapToOpenTypePath(binGrid, 128, 128, {
      unitsPerEm: 1000,
      ascender,
      descender,
      letterSpacing: meta.letterSpacing,
    });

    const glyph = new opentype.Glyph({
      name: charDef.char,
      unicode: charDef.unicode,
      advanceWidth,
      path,
    });

    glyphList.push(glyph);
  });

  const font = new opentype.Font({
    familyName: meta.fontName || 'My Custom Font',
    styleName: 'Regular',
    unitsPerEm: 1000,
    ascender,
    descender,
    glyphs: glyphList,
  });

  const arrayBuffer = font.toArrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'font/ttf' });
  const blobUrl = URL.createObjectURL(blob);

  return { font, blobUrl };
}
