import React, { useRef, useState, useEffect } from 'react';
import { X, Pen, Eraser, Trash2, Check, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { CharacterDef } from '../types';

interface GlyphEditorModalProps {
  isOpen: boolean;
  charDef: CharacterDef | null;
  glyphCanvas: HTMLCanvasElement | null;
  onClose: () => void;
  onSave: (updatedCanvas: HTMLCanvasElement) => void;
}

export const GlyphEditorModal: React.FC<GlyphEditorModalProps> = ({
  isOpen,
  charDef,
  glyphCanvas,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    recognizedChar?: string;
    matchesExpected?: boolean;
    confidence?: number;
    strokeAdvice?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !glyphCanvas) return;
    setAiAnalysis(null);

    // Copy image onto modal canvas
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 260, 260);
          ctx.drawImage(glyphCanvas, 0, 0, 260, 260);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, glyphCanvas]);

  if (!isOpen || !charDef) return null;

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height),
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    handleDraw(e);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);
    ctx.fillStyle = tool === 'pen' ? '#000000' : '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
  };

  const handleAiVerify = async () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    setIsAnalyzing(true);
    try {
      const base64 = cvs.toDataURL('image/png');
      const res = await fetch('/api/ocr/recognize-glyph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          expectedChar: charDef.char,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    // Downscale back to 128x128
    const targetCvs = document.createElement('canvas');
    targetCvs.width = 128;
    targetCvs.height = 128;
    const tCtx = targetCvs.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(cvs, 0, 0, 128, 128);
      onSave(targetCvs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 heading-font text-2xl font-bold flex items-center justify-center shadow-inner">
              {charDef.char}
            </span>
            <div>
              <h3 className="font-bold text-white text-base">Glyph Fine-Tuning</h3>
              <p className="text-xs text-slate-400">
                {charDef.name} (U+{charDef.unicode.toString(16).padStart(4, '0').toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas & Controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative bg-white rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl w-[260px] h-[260px]">
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 opacity-30 select-none">
              <div className="border-b border-dashed border-sky-600 text-[9px] text-sky-700 font-mono">CAP HEIGHT</div>
              <div className="border-b border-dashed border-indigo-600 text-[9px] text-indigo-700 font-mono">X-HEIGHT</div>
              <div className="border-b-2 border-amber-600 text-[9px] text-amber-700 font-mono font-bold">BASELINE</div>
              <div className="border-b border-dashed border-rose-600 text-[9px] text-rose-700 font-mono">DESCENDER</div>
            </div>

            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="w-full h-full cursor-crosshair touch-none relative z-10"
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleStopDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDraw}
              onTouchEnd={handleStopDraw}
            />
          </div>

          {/* Tools */}
          <div className="flex items-center justify-between w-full bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setTool('pen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  tool === 'pen' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Pen className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  tool === 'eraser' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Erase</span>
              </button>
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-500">Size</span>
                <input
                  type="range"
                  min="2"
                  max="18"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-16 accent-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
              title="Clear canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Character Recognition check */}
          <div className="w-full bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Glyph OCR Check</span>
              </span>
              <button
                onClick={handleAiVerify}
                disabled={isAnalyzing}
                className="text-[11px] font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-500/40 transition flex items-center gap-1 disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span>Verify OCR</span>
              </button>
            </div>
            {aiAnalysis ? (
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span>Recognized:</span>
                  <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                    "{aiAnalysis.recognizedChar}"
                  </span>
                  <span
                    className={`font-semibold ${
                      aiAnalysis.matchesExpected ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    ({aiAnalysis.confidence}% confidence)
                  </span>
                </div>
                {aiAnalysis.strokeAdvice && (
                  <p className="text-[10px] text-slate-400">{aiAnalysis.strokeAdvice}</p>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">
                Click Verify OCR to check if the AI recognizes this character accurately.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Glyph</span>
          </button>
        </div>
      </div>
    </div>
  );
};
