import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  Printer,
  ChevronLeft,
  ChevronRight,
  Pen,
  Eraser,
  Trash2,
  Undo2,
  ArrowRight,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { CHARACTERS, drawPrintableTemplate } from '../utils/characters';
import { isCanvasOccupied } from '../utils/imageProcessing';

interface Step1TemplateDrawProps {
  charCanvases: HTMLCanvasElement[];
  selectedCharIndex: number;
  onSelectCharIndex: (idx: number) => void;
  onUpdateCanvas: (idx: number, canvas: HTMLCanvasElement) => void;
  onProceedToStep2: () => void;
  onFillPreset: (presetKey: string) => void;
}

export const Step1TemplateDraw: React.FC<Step1TemplateDrawProps> = ({
  charCanvases,
  selectedCharIndex,
  onSelectCharIndex,
  onUpdateCanvas,
  onProceedToStep2,
  onFillPreset,
}) => {
  const [mode, setMode] = useState<'draw' | 'template'>('draw');
  const [activeCategory, setActiveCategory] = useState<'all' | 'uppercase' | 'lowercase' | 'number' | 'symbol'>('all');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const drawPadRef = useRef<HTMLCanvasElement | null>(null);
  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentChar = CHARACTERS[selectedCharIndex];

  // Sync active character to canvas
  useEffect(() => {
    const pad = drawPadRef.current;
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);

    const src = charCanvases[selectedCharIndex];
    if (src) {
      ctx.drawImage(src, 0, 0, 300, 300);
    }
    setHistory([]);
  }, [selectedCharIndex, charCanvases]);

  // Draw template sheet canvas when template mode is active
  useEffect(() => {
    if (mode === 'template' && templateCanvasRef.current) {
      drawPrintableTemplate(templateCanvasRef.current);
    }
  }, [mode]);

  const saveToState = () => {
    const pad = drawPadRef.current;
    if (!pad) return;
    const copy = document.createElement('canvas');
    copy.width = 300;
    copy.height = 300;
    const ctx = copy.getContext('2d');
    if (ctx) {
      ctx.drawImage(pad, 0, 0);
      onUpdateCanvas(selectedCharIndex, copy);
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pad = drawPadRef.current;
    if (!pad) return { x: 0, y: 0 };
    const rect = pad.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (pad.width / rect.width),
      y: (clientY - rect.top) * (pad.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pad = drawPadRef.current;
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (ctx) {
      setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, 300, 300)]);
    }
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const pad = drawPadRef.current;
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = tool === 'pen' ? '#000000' : '#ffffff';

    ctx.beginPath();
    ctx.arc(x, y, penSize / 2, 0, Math.PI * 2);
    ctx.fill();

    saveToState();
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToState();
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const pad = drawPadRef.current;
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (!ctx) return;
    const previous = history[history.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
    saveToState();
  };

  const handleClear = () => {
    const pad = drawPadRef.current;
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, 300, 300)]);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);
    saveToState();
  };

  const filteredCharacters = CHARACTERS.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  const filledCount = charCanvases.filter((cvs) => isCanvasOccupied(cvs)).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="heading-font text-2xl font-bold text-white flex items-center gap-2">
            Step 1: Choose Template or Draw Digitally
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Draw characters directly on screen with full typography guides, or download the printable 9x9 matrix sheet.
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setMode('draw')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              mode === 'draw'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Draw Digitally</span>
          </button>
          <button
            onClick={() => setMode('template')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              mode === 'template'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Printable Sheet</span>
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Character Grid Matrix */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Character Grid</span>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                  {filledCount}/81 Drawn
                </span>
              </h2>

              <button
                onClick={() => onFillPreset('cursive')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Autofill Cursive</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex space-x-1 border-b border-slate-800 pb-2 text-[11px] overflow-x-auto">
              {[
                { id: 'all', label: 'All (81)' },
                { id: 'uppercase', label: 'A-Z' },
                { id: 'lowercase', label: 'a-z' },
                { id: 'number', label: '0-9' },
                { id: 'symbol', label: 'Symbols' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-9 gap-1.5 overflow-y-auto max-h-[460px] p-1.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
              {filteredCharacters.map((c) => {
                const originalIndex = CHARACTERS.findIndex((item) => item.char === c.char);
                const isSelected = selectedCharIndex === originalIndex;
                const isDrawn = isCanvasOccupied(charCanvases[originalIndex]);

                return (
                  <button
                    key={c.char}
                    type="button"
                    onClick={() => onSelectCharIndex(originalIndex)}
                    className={`aspect-square rounded-lg border font-semibold text-xs flex flex-col items-center justify-center transition relative ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20 text-white ring-2 ring-indigo-500/50 scale-105 z-10'
                        : isDrawn
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{c.char}</span>
                    {isDrawn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute bottom-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Click any letter cell to draw or touch up its strokes.
            </div>
          </div>

          {/* Right Column: Canvas Studio Pad */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
            {/* Header info for selected char */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <span className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 heading-font text-2xl font-bold flex items-center justify-center shadow-inner">
                  {currentChar.char}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Drawing Character "{currentChar.char}"
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentChar.name} (U+{currentChar.unicode.toString(16).padStart(4, '0').toUpperCase()})
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectCharIndex(Math.max(0, selectedCharIndex - 1))}
                  disabled={selectedCharIndex === 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-40"
                  title="Previous character"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectCharIndex(Math.min(CHARACTERS.length - 1, selectedCharIndex + 1))}
                  disabled={selectedCharIndex === CHARACTERS.length - 1}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1 shadow transition disabled:opacity-40"
                  title="Next character"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    tool === 'pen'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Pen className="w-3.5 h-3.5" />
                  <span>Pen</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    tool === 'eraser'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <span className="text-xs text-slate-400">Size</span>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    value={penSize}
                    onChange={(e) => setPenSize(parseInt(e.target.value))}
                    className="w-20 accent-indigo-500"
                  />
                  <span className="text-xs text-slate-500 w-5">{penSize}px</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700/60 transition disabled:opacity-40"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs flex items-center space-x-1 border border-slate-700/60 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Drawing Pad Canvas */}
            <div className="relative w-full aspect-square max-w-[360px] mx-auto bg-white rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Guideline Overlays */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 opacity-30 select-none">
                <div className="border-b border-dashed border-sky-600 text-[10px] text-sky-800 font-mono font-medium pt-1">
                  CAP HEIGHT
                </div>
                <div className="border-b border-dashed border-indigo-600 text-[10px] text-indigo-800 font-mono font-medium">
                  X-HEIGHT
                </div>
                <div className="border-b-2 border-amber-600 text-[10px] text-amber-800 font-mono font-bold pb-0.5">
                  BASELINE
                </div>
                <div className="border-b border-dashed border-rose-600 text-[10px] text-rose-800 font-mono font-medium pb-2">
                  DESCENDER
                </div>
              </div>

              {/* Faint character watermark guide */}
              <div className="absolute inset-0 flex items-center justify-center text-[180px] font-bold text-slate-300/40 select-none pointer-events-none">
                {currentChar.char}
              </div>

              <canvas
                ref={drawPadRef}
                width={300}
                height={300}
                className="w-full h-full relative z-10 cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>

            {/* Done & proceed button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Tip: Keep letters rested on the baseline for clean proportional typesetting.
              </span>
              <button
                onClick={onProceedToStep2}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center space-x-2"
              >
                <span>Use Drawn Glyphs ({filledCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 1B: Printable Template Generator */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-semibold text-white text-base">Printable Grid Sheet (9x9 Matrix)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Print or download this standardized sheet. Write in each cell with black pen, then photograph or scan it in Step 2 for real-time OCR extraction!
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const cvs = templateCanvasRef.current;
                  if (!cvs) return;
                  const a = document.createElement('a');
                  a.href = cvs.toDataURL('image/png');
                  a.download = 'glyphforge-handwriting-template.png';
                  a.click();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Sheet PNG</span>
              </button>
              <button
                onClick={() => {
                  const cvs = templateCanvasRef.current;
                  if (!cvs) return;
                  const win = window.open('', '_blank');
                  if (win) {
                    win.document.write(`
                      <html>
                        <head><title>Print GlyphForge Template</title></head>
                        <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#fff;">
                          <img src="${cvs.toDataURL('image/png')}" style="width:100%;max-width:850px;"/>
                        </body>
                      </html>
                    `);
                    win.document.close();
                    setTimeout(() => win.print(), 500);
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>

          {/* Template Sheet Preview */}
          <div className="w-full overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
            <canvas
              ref={templateCanvasRef}
              width={1200}
              height={1500}
              className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
