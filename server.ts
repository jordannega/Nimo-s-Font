import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Real-Time OCR & Handwriting Document Extraction API
app.post('/api/ocr/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', mode = 'template-sheet' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request payload.' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/, '');

    const promptText = mode === 'document-notes'
      ? `You are an expert handwriting OCR engine and forensic document examiner.
Analyze this uploaded handwritten document or note.
1. Transcribe the full handwritten text completely and accurately.
2. Identify unique individual letters/glyphs visible in the sample (A-Z, a-z, 0-9, punctuation).
3. Analyze the handwriting characteristics: classification (e.g. Elegant Script, Casual Print, Architect Sans, Messy Cursive), estimated slant angle, stroke boldness, legibility score (0-100), and suggest 3 artistic font names for this handwriting.
Return strict JSON with this structure:
{
  "transcription": "full transcribed text here",
  "style": {
    "classification": "Cursive / Sans / Serif / Calligraphy style",
    "slant": "e.g. 10 deg forward tilt",
    "weight": "Light / Medium / Bold",
    "legibility": 92,
    "vibe": "description of mood and feel",
    "suggestedFontNames": ["Name 1", "Name 2", "Name 3"]
  },
  "extractedGlyphs": [
    { "char": "A", "confidence": 98, "quality": "crisp" }
  ]
}`
      : `You are an expert handwriting OCR and typography analysis engine.
The user has uploaded a handwriting font template or grid scan sheet.
Examine this image and extract:
1. Overall handwriting style metrics: classification (e.g., Spencerian Cursive, Casual Ballpoint, Block Architect, Playful Felt-Tip), slant, stroke weight, legibility score (1-100), and 3 creative font family names.
2. Estimated grid deskew angle in degrees (between -10 and 10, 0 if upright).
3. Transcribe or verify any detected characters in the boxes. If you can identify characters, list them with confidence scores.
Return strict JSON with this structure:
{
  "transcription": "Overview of characters detected on sheet",
  "style": {
    "classification": "Style classification",
    "slant": "Slant angle description",
    "weight": "Thin / Regular / Bold",
    "legibility": 95,
    "vibe": "Description of aesthetic",
    "suggestedFontNames": ["FontName 1", "FontName 2", "FontName 3"]
  },
  "gridMetrics": {
    "estimatedRotationDeg": 0,
    "filledCount": 81,
    "notes": "Grid alignment observation"
  },
  "detectedCharacters": [
    { "char": "A", "confidence": 99, "status": "clear" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('OCR Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process OCR request',
    });
  }
});

// Single Glyph OCR verification endpoint
app.post('/api/ocr/recognize-glyph', async (req, res) => {
  try {
    const { imageBase64, expectedChar } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: `What character is written in this single glyph image? Expected character is "${expectedChar}".
Return JSON:
{
  "recognizedChar": "...",
  "matchesExpected": true or false,
  "confidence": 95,
  "alternativeGuesses": ["...", "..."],
  "strokeAdvice": "concise tip if stroke is broken or baseline is skewed"
}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite middleware for dev or static serving for prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GlyphForge server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
