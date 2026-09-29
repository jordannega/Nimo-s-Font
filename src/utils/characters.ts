import { CharacterDef } from '../types';

export const CHARACTERS: CharacterDef[] = [
  // Uppercase (26)
  { char: 'A', unicode: 0x0041, category: 'uppercase', name: 'Latin Capital Letter A' },
  { char: 'B', unicode: 0x0042, category: 'uppercase', name: 'Latin Capital Letter B' },
  { char: 'C', unicode: 0x0043, category: 'uppercase', name: 'Latin Capital Letter C' },
  { char: 'D', unicode: 0x0044, category: 'uppercase', name: 'Latin Capital Letter D' },
  { char: 'E', unicode: 0x0045, category: 'uppercase', name: 'Latin Capital Letter E' },
  { char: 'F', unicode: 0x0046, category: 'uppercase', name: 'Latin Capital Letter F' },
  { char: 'G', unicode: 0x0047, category: 'uppercase', name: 'Latin Capital Letter G' },
  { char: 'H', unicode: 0x0048, category: 'uppercase', name: 'Latin Capital Letter H' },
  { char: 'I', unicode: 0x0049, category: 'uppercase', name: 'Latin Capital Letter I' },
  { char: 'J', unicode: 0x004A, category: 'uppercase', name: 'Latin Capital Letter J' },
  { char: 'K', unicode: 0x004B, category: 'uppercase', name: 'Latin Capital Letter K' },
  { char: 'L', unicode: 0x004C, category: 'uppercase', name: 'Latin Capital Letter L' },
  { char: 'M', unicode: 0x004D, category: 'uppercase', name: 'Latin Capital Letter M' },
  { char: 'N', unicode: 0x004E, category: 'uppercase', name: 'Latin Capital Letter N' },
  { char: 'O', unicode: 0x004F, category: 'uppercase', name: 'Latin Capital Letter O' },
  { char: 'P', unicode: 0x0050, category: 'uppercase', name: 'Latin Capital Letter P' },
  { char: 'Q', unicode: 0x0051, category: 'uppercase', name: 'Latin Capital Letter Q' },
  { char: 'R', unicode: 0x0052, category: 'uppercase', name: 'Latin Capital Letter R' },
  { char: 'S', unicode: 0x0053, category: 'uppercase', name: 'Latin Capital Letter S' },
  { char: 'T', unicode: 0x0054, category: 'uppercase', name: 'Latin Capital Letter T' },
  { char: 'U', unicode: 0x0055, category: 'uppercase', name: 'Latin Capital Letter U' },
  { char: 'V', unicode: 0x0056, category: 'uppercase', name: 'Latin Capital Letter V' },
  { char: 'W', unicode: 0x0057, category: 'uppercase', name: 'Latin Capital Letter W' },
  { char: 'X', unicode: 0x0058, category: 'uppercase', name: 'Latin Capital Letter X' },
  { char: 'Y', unicode: 0x0059, category: 'uppercase', name: 'Latin Capital Letter Y' },
  { char: 'Z', unicode: 0x005A, category: 'uppercase', name: 'Latin Capital Letter Z' },

  // Lowercase (26)
  { char: 'a', unicode: 0x0061, category: 'lowercase', name: 'Latin Small Letter A' },
  { char: 'b', unicode: 0x0062, category: 'lowercase', name: 'Latin Small Letter B' },
  { char: 'c', unicode: 0x0063, category: 'lowercase', name: 'Latin Small Letter C' },
  { char: 'd', unicode: 0x0064, category: 'lowercase', name: 'Latin Small Letter D' },
  { char: 'e', unicode: 0x0065, category: 'lowercase', name: 'Latin Small Letter E' },
  { char: 'f', unicode: 0x0066, category: 'lowercase', name: 'Latin Small Letter F' },
  { char: 'g', unicode: 0x0067, category: 'lowercase', name: 'Latin Small Letter G' },
  { char: 'h', unicode: 0x0068, category: 'lowercase', name: 'Latin Small Letter H' },
  { char: 'i', unicode: 0x0069, category: 'lowercase', name: 'Latin Small Letter I' },
  { char: 'j', unicode: 0x006A, category: 'lowercase', name: 'Latin Small Letter J' },
  { char: 'k', unicode: 0x006B, category: 'lowercase', name: 'Latin Small Letter K' },
  { char: 'l', unicode: 0x006C, category: 'lowercase', name: 'Latin Small Letter L' },
  { char: 'm', unicode: 0x006D, category: 'lowercase', name: 'Latin Small Letter M' },
  { char: 'n', unicode: 0x006E, category: 'lowercase', name: 'Latin Small Letter N' },
  { char: 'o', unicode: 0x006F, category: 'lowercase', name: 'Latin Small Letter O' },
  { char: 'p', unicode: 0x0070, category: 'lowercase', name: 'Latin Small Letter P' },
  { char: 'q', unicode: 0x0071, category: 'lowercase', name: 'Latin Small Letter Q' },
  { char: 'r', unicode: 0x0072, category: 'lowercase', name: 'Latin Small Letter R' },
  { char: 's', unicode: 0x0073, category: 'lowercase', name: 'Latin Small Letter S' },
  { char: 't', unicode: 0x0074, category: 'lowercase', name: 'Latin Small Letter T' },
  { char: 'u', unicode: 0x0075, category: 'lowercase', name: 'Latin Small Letter U' },
  { char: 'v', unicode: 0x0076, category: 'lowercase', name: 'Latin Small Letter V' },
  { char: 'w', unicode: 0x0077, category: 'lowercase', name: 'Latin Small Letter W' },
  { char: 'x', unicode: 0x0078, category: 'lowercase', name: 'Latin Small Letter X' },
  { char: 'y', unicode: 0x0079, category: 'lowercase', name: 'Latin Small Letter Y' },
  { char: 'z', unicode: 0x007A, category: 'lowercase', name: 'Latin Small Letter Z' },

  // Numbers (10)
  { char: '0', unicode: 0x0030, category: 'number', name: 'Digit Zero' },
  { char: '1', unicode: 0x0031, category: 'number', name: 'Digit One' },
  { char: '2', unicode: 0x0032, category: 'number', name: 'Digit Two' },
  { char: '3', unicode: 0x0033, category: 'number', name: 'Digit Three' },
  { char: '4', unicode: 0x0034, category: 'number', name: 'Digit Four' },
  { char: '5', unicode: 0x0035, category: 'number', name: 'Digit Five' },
  { char: '6', unicode: 0x0036, category: 'number', name: 'Digit Six' },
  { char: '7', unicode: 0x0037, category: 'number', name: 'Digit Seven' },
  { char: '8', unicode: 0x0038, category: 'number', name: 'Digit Eight' },
  { char: '9', unicode: 0x0039, category: 'number', name: 'Digit Nine' },

  // Symbols & Punctuation (19)
  { char: '!', unicode: 0x0021, category: 'symbol', name: 'Exclamation Mark' },
  { char: '?', unicode: 0x003F, category: 'symbol', name: 'Question Mark' },
  { char: '.', unicode: 0x002E, category: 'symbol', name: 'Full Stop' },
  { char: ',', unicode: 0x002C, category: 'symbol', name: 'Comma' },
  { char: '-', unicode: 0x002D, category: 'symbol', name: 'Hyphen Minus' },
  { char: '+', unicode: 0x002B, category: 'symbol', name: 'Plus Sign' },
  { char: '=', unicode: 0x003D, category: 'symbol', name: 'Equals Sign' },
  { char: ':', unicode: 0x003A, category: 'symbol', name: 'Colon' },
  { char: ';', unicode: 0x003B, category: 'symbol', name: 'Semicolon' },
  { char: "'", unicode: 0x0027, category: 'symbol', name: 'Apostrophe' },
  { char: '"', unicode: 0x0022, category: 'symbol', name: 'Quotation Mark' },
  { char: '@', unicode: 0x0040, category: 'symbol', name: 'At Sign' },
  { char: '#', unicode: 0x0023, category: 'symbol', name: 'Number Sign' },
  { char: '$', unicode: 0x0024, category: 'symbol', name: 'Dollar Sign' },
  { char: '%', unicode: 0x0025, category: 'symbol', name: 'Percent Sign' },
  { char: '&', unicode: 0x0026, category: 'symbol', name: 'Ampersand' },
  { char: '*', unicode: 0x002A, category: 'symbol', name: 'Asterisk' },
  { char: '(', unicode: 0x0028, category: 'symbol', name: 'Left Parenthesis' },
  { char: ')', unicode: 0x0029, category: 'symbol', name: 'Right Parenthesis' },
];

export const DEMO_PRESETS: Record<string, { name: string; font: string; desc: string }> = {
  cursive: {
    name: 'Caveat Cursive',
    font: '600 180px "Caveat", cursive',
    desc: 'Fluid expressive personal cursive handwriting with natural ligature balance',
  },
  reenie: {
    name: 'Whimsical Quill',
    font: '600 190px "Reenie Beanie", cursive',
    desc: 'Light, playful, elongated strokes with whimsical personality',
  },
  kalam: {
    name: 'Artisan Script',
    font: '700 170px "Kalam", cursive',
    desc: 'Warm and organic handwriting with balanced proportions',
  },
  architect: {
    name: 'Draftsman Print',
    font: '600 160px "Patrick Hand", cursive',
    desc: 'Clear, legible architect blueprint lettering',
  },
};

export function drawPrintableTemplate(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 1200;
  canvas.height = 1500;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 1500);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px "Outfit", sans-serif';
  ctx.fillText('GLYPHFORGE HANDWRITING FONT MATRIX (9x9)', 80, 80);

  ctx.fillStyle = '#64748b';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText('Write one letter per box in dark black ink. Fiducial corner targets allow auto-calibration and real-time OCR.', 80, 114);

  // Corner Fiducial Targets
  drawFiducialTarget(ctx, 40, 40);
  drawFiducialTarget(ctx, 1160, 40);
  drawFiducialTarget(ctx, 40, 1460);
  drawFiducialTarget(ctx, 1160, 1460);

  // 9x9 Grid layout
  const cols = 9;
  const rows = 9;
  const cellW = 110;
  const cellH = 110;
  const gapX = 12;
  const gapY = 12;
  const startX = 80;
  const startY = 160;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= CHARACTERS.length) break;

      const x = startX + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);

      // Cell border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellW, cellH);

      // Baseline guide line
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x + 6, y + cellH * 0.74);
      ctx.lineTo(x + cellW - 6, y + cellH * 0.74);
      ctx.stroke();

      // Cap-height guide line
      ctx.beginPath();
      ctx.moveTo(x + 6, y + cellH * 0.28);
      ctx.lineTo(x + cellW - 6, y + cellH * 0.28);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top corner glyph hint
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(CHARACTERS[idx].char, x + 7, y + 18);
    }
  }
}

function drawFiducialTarget(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y + 20);
  ctx.stroke();

  // Solid center dot
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}
