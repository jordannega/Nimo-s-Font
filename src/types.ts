export interface CharacterDef {
  char: string;
  unicode: number;
  category: 'uppercase' | 'lowercase' | 'number' | 'symbol';
  name: string;
}

export interface CalibrationSettings {
  offsetX: number;
  offsetY: number;
  cellW: number;
  cellH: number;
  gapX: number;
  gapY: number;
  rotation: number;
}

export interface FilterSettings {
  threshold: number;
  invert: boolean;
  despeckle: boolean;
  boldness: number;
  smoothing: boolean;
}

export interface HandwritingStyle {
  classification: string;
  slant: string;
  weight: string;
  legibility: number;
  vibe: string;
  suggestedFontNames: string[];
}

export interface OcrResult {
  transcription?: string;
  style?: HandwritingStyle;
  gridMetrics?: {
    estimatedRotationDeg?: number;
    filledCount?: number;
    notes?: string;
  };
  detectedCharacters?: Array<{
    char: string;
    confidence: number;
    status?: string;
  }>;
}

export interface FontMetadata {
  fontName: string;
  designer: string;
  version: string;
  ascender: number;
  descender: number;
  letterSpacing: number;
}
