# GlyphForge 🖋️
### AI Handwriting-to-Font Studio & Real-Time OCR

> Transform personal handwriting, scanned notes, or digital strokes into installable, production-ready **TrueType Font (`.TTF`)** files with real-time OCR, drag-and-drop scanning, and live typing sandbox.

---

## 🌟 Key Features

### 1. 📂 Drag-and-Drop & Multi-Modal Upload
- **Universal Drag-and-Drop Zone**: Upload scanned template sheets, phone photos, or documents (`PNG`, `JPG`, `WEBP`, `SVG`, `PDF`).
- **Direct Clipboard Paste**: Paste screenshots or images directly from your clipboard anywhere on the screen with `Ctrl+V` / `Cmd+V`.
- **Live Camera Scanner**: Capture handwritten paper sheets directly using your webcam or mobile camera with an alignment overlay HUD.
- **One-Click Auto-Fit & Auto-Deskew**: Automatically detects sheet corners and aligns the 9×9 character grid in milliseconds.

### 2. ⚡ Real-Time OCR & Data Extraction (Powered by Gemini)
- **Instant Transcription**: Automatically extracts and reads handwritten text notes.
- **Handwriting Style Analysis**: Evaluates penmanship classification (e.g., *Modern Cursive*, *Draftsman Print*, *Spencerian Script*), estimated slant angle, stroke weight, and legibility rating.
- **Smart Font Name Suggestions**: AI analyzes your handwriting aesthetic and proposes creative, matching typography family names.
- **81-Glyph Verification Matrix**: Checks completeness across A–Z, a–z, 0–9, and punctuation with individual confidence scores.

### 3. 🖌️ Digital Drawing Studio & Printable Sheets
- **In-Browser Digital Drawing Pad**: Draw characters directly on screen with undo/redo, customizable stroke widths, and typography guidelines (Cap Height, X-Height, Baseline, Descender).
- **Printable 9×9 Matrix Template**: Export high-resolution printable PNG sheets with corner fiducial marks for clean scanning.
- **Autofill Handwriting Presets**: Test instantly with presets like *Caveat Cursive*, *Draftsman Print*, *Whimsical Quill*, and *Artisan Script*.

### 4. 🎛️ Image Processing & Fine-Tuning
- **Non-Destructive Filters**: Real-time binarization thresholding, white-on-dark inversion, noise despeckling, and stroke boldness adjustment.
- **Single-Glyph Editor Modal**: High-precision pixel editing, eraser, guideline alignment, and AI OCR single-character verification.
- **AI Auto-Complete Missing Glyphs**: Automatically synthesize matching vector strokes for any omitted characters in the same style.

### 5. 📦 True OpenType `.TTF` Generation & Live Sandbox
- **Binary Font Export**: Generates true OpenType `.TTF` binary font files ready to install on Windows, macOS, Linux, Microsoft Word, Figma, Photoshop, and Web.
- **Interactive Typing Sandbox**: Type live with your newly generated font rendered via dynamic `@font-face`.
- **Paper Themes & Ink Styling**: Switch between College Lined Paper, Dot Grid Journal, Plain White, and Dark Mode, with ink color choices.
- **Animated Handwriting Simulation**: Watch your handwritten text write out stroke-by-stroke on screen.
- **Export Rendered Notes as PNG**: Download your typed handwritten note as a clean image.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Backend**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **Font Generation**: [opentype.js](https://opentype.js.org/)
- **AI & OCR**: [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-3.8-flash`)
- **Icons & Effects**: [Lucide React](https://lucide.dev/), [canvas-confetti](https://www.npmjs.com/package/canvas-confetti), [Motion](https://motion.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm`, `pnpm`, or `yarn`
- *(Optional)* Gemini API Key for server-side AI OCR and style analysis (fallback heuristic OCR works offline without an API key).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/glyphforge.git
   cd glyphforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📖 How It Works

```
Step 1: Choose Template / Draw
   ├── Option A: Draw 81 characters on the canvas pad
   └── Option B: Print the 9x9 handwriting grid sheet
         │
Step 2: Upload Scan & Real-Time OCR
   ├── Drag-and-drop photo / scan / PDF or capture via webcam
   ├── Real-time AI OCR extracts handwriting traits and transcribes text
   └── Auto-fit calibration aligns 81 character slicing boxes
         │
Step 3: Vectorize & Fine-Tune
   ├── Binarize contrast, clean noise, and adjust stroke boldness
   ├── Click any letter to touch up pixels in the fine-tuning editor
   └── Optional: AI synthesizes missing letters in the same style
         │
Step 4: Export & Live Sandbox
   ├── Customize font metadata (Name, Designer, Ascender, Tracking)
   ├── Download installable .TTF font file
   └── Live test in the interactive lined-paper typing sandbox!
```

---

## 💻 Installing Your Font System-Wide

Once you download your `.ttf` file from Step 4:

- **Windows**: Right-click the `.ttf` file and select **Install** or **Install for all users**.
- **macOS**: Double-click the `.ttf` file and click **Install Font** in the Font Book preview.
- **Linux**: Copy the `.ttf` file to `~/.local/share/fonts` and run `fc-cache -f -v`.
- **Apps**: Launch **Microsoft Word**, **Google Docs**, **Figma**, or **Adobe Photoshop**—your custom font name will appear in the font picker dropdown!

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts full-stack development server on port 3000 with `tsx server.ts` |
| `npm run build` | Compiles client assets with Vite into `dist/` |
| `npm run start` | Runs production server |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## 📄 License

This project is licensed under the Apache 2.0 License.
