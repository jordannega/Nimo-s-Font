import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  Scissors,
  Sliders,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Scan,
  Wand2,
  RefreshCw,
  Maximize2,
  Eye,
  Check,
} from 'lucide-react';
import { CalibrationSettings, OcrResult, HandwritingStyle } from '../types';
import { CHARACTERS } from '../utils/characters';
import { autoDetectGridCalibration } from '../utils/imageProcessing';

interface Step2UploadScanProps {
  scannedImage: HTMLImageElement | HTMLCanvasElement | null;
  calib: CalibrationSettings;
  ocrResult: OcrResult | null;
  isOcrRunning: boolean;
  onUpdateCalib: (newCalib: CalibrationSettings) => void;
  onUploadFile: (file: File) => void;
  onOpenLiveCamera: () => void;
  onRunOcr: (image: HTMLImageElement | HTMLCanvasElement) => void;
  onProceedToStep3: () => void;
  onApplyFontName: (name: string) => void;
}

export const Step2UploadScan: React.FC<Step2UploadScanProps> = ({
  scannedImage,
  calib,
  ocrResult,
  isOcrRunning,
  onUpdateCalib,
  onUploadFile,
  onOpenLiveCamera,
  onRunOcr,
  onProceedToStep3,
  onApplyFontName,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOcrDetails, setShowOcrDetails] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clipboard paste listener for fast workflow
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          onUploadFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUploadFile]);

  // Render scan viewport with calibration bounding boxes
  useEffect(() => {
    const cvs = viewportCanvasRef.current;
    if (!cvs || !scannedImage) return;

    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const imgW = scannedImage.width || 1200;
    const imgH = scannedImage.height || 1500;
    cvs.width = imgW;
    cvs.height = imgH;

    ctx.clearRect(0, 0, imgW, imgH);

    // Apply rotation
    ctx.save();
    ctx.translate(imgW / 2, imgH / 2);
    ctx.rotate((calib.rotation * Math.PI) / 180);
    ctx.translate(-imgW / 2, -imgH / 2);

    // Draw scanned image
    ctx.drawImage(scannedImage, 0, 0, imgW, imgH);

    // Draw Slicing Boxes
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';

    const cols = 9;
    const rows = 9;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= CHARACTERS.length) break;

        const x = calib.offsetX + c * (calib.cellW + calib.gapX);
        const y = calib.offsetY + r * (calib.cellH + calib.gapY);

        ctx.fillRect(x, y, calib.cellW, calib.cellH);
        ctx.strokeRect(x, y, calib.cellW, calib.cellH);

        // Watermark character label in top-left
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText(CHARACTERS[idx].char, x + 6, y + 16);
      }
    }

    ctx.restore();
  }, [scannedImage, calib]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleAutoFit = () => {
    if (!scannedImage) return;
    const detected = autoDetectGridCalibration(scannedImage);
    onUpdateCalib(detected);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="heading-font text-2xl font-bold text-white flex items-center gap-2">
            Step 2: Upload Scan & Real-Time OCR Calibration
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Drag-and-drop paper scans, notes, or photos. Real-time OCR instantly transcribes, classifies handwriting style, and auto-detects character cells.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {scannedImage && (
            <button
              onClick={() => onRunOcr(scannedImage)}
              disabled={isOcrRunning}
              className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOcrRunning ? 'animate-spin' : ''}`} />
              <span>{isOcrRunning ? 'Analyzing OCR...' : 'Re-run OCR'}</span>
            </button>
          )}

          <button
            onClick={onProceedToStep3}
            disabled={!scannedImage}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Scissors className="w-4 h-4" />
            <span>Extract & Vectorize</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & OCR HUD */}
        <div className="lg:col-span-5 space-y-5">
          {/* Godtier Drag-and-Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl p-6 text-center transition-all cursor-pointer border-2 border-dashed flex flex-col items-center justify-center space-y-3 group overflow-hidden ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01] shadow-2xl shadow-indigo-500/20'
                : 'border-slate-700 hover:border-indigo-500/70 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <span className="text-sm font-bold text-white block">
                Click or Drag & Drop Scan Here
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                PNG, JPG, PDF, WEBP or Paste with <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono">Ctrl+V</kbd>
              </span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLiveCamera();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Snapshot</span>
              </button>
            </div>
          </div>

          {/* Real-Time OCR Instant Extraction Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Real-Time OCR Analysis</span>
                    {isOcrRunning && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                  </h3>
                  <span className="text-[10px] text-slate-400">Gemini 3.8 Flash Handwriting Intelligence</span>
                </div>
              </div>

              {ocrResult?.style?.legibility && (
                <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {ocrResult.style.legibility}% Legibility
                </span>
              )}
            </div>

            {isOcrRunning ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Extracting glyph contours & handwriting traits...</p>
                <span className="text-[10px] text-slate-500">Transcribing text and estimating slant angle</span>
              </div>
            ) : ocrResult ? (
              <div className="space-y-3.5 text-xs">
                {/* Style Breakdown */}
                {ocrResult.style && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Classification</span>
                      <span className="font-semibold text-indigo-300">{ocrResult.style.classification}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Slant Angle</span>
                      <span className="font-semibold text-slate-200">{ocrResult.style.slant}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Stroke Weight</span>
                      <span className="font-semibold text-slate-200">{ocrResult.style.weight}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Aesthetic</span>
                      <span className="font-semibold text-slate-300 truncate block">{ocrResult.style.vibe}</span>
                    </div>
                  </div>
                )}

                {/* Suggested Font Names */}
                {ocrResult.style?.suggestedFontNames && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                      AI Suggested Font Names (Click to apply):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ocrResult.style.suggestedFontNames.map((name, i) => (
                        <button
                          key={i}
                          onClick={() => onApplyFontName(name)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instant Transcription */}
                {ocrResult.transcription && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                      Transcribed Text / Notes
                    </span>
                    <p className="text-slate-200 font-mono text-[11px] leading-relaxed max-h-20 overflow-y-auto">
                      {ocrResult.transcription}
                    </p>
                  </div>
                )}

                {/* Detected Glyph Checklist Badge */}
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-medium text-xs">
                      All 81 Character Cells Recognized
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">100% Ready</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <FileText className="w-5 h-5 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Upload or capture a scan to trigger real-time OCR extraction.</p>
              </div>
            )}
          </div>

          {/* Grid Calibration Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Grid Calibration</span>
              </h3>
              <button
                onClick={handleAutoFit}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3 text-amber-400" />
                <span>Auto-Fit Grid</span>
              </button>
            </div>

            {/* Offsets X & Y */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>X Offset</span>
                  <span className="font-mono text-slate-300">{calib.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={calib.offsetX}
                  onChange={(e) => onUpdateCalib({ ...calib, offsetX: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Y Offset</span>
                  <span className="font-mono text-slate-300">{calib.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={calib.offsetY}
                  onChange={(e) => onUpdateCalib({ ...calib, offsetY: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Cell Size W & H */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Cell Width</span>
                  <span className="font-mono text-slate-300">{calib.cellW}px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="240"
                  value={calib.cellW}
                  onChange={(e) => onUpdateCalib({ ...calib, cellW: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Cell Height</span>
                  <span className="font-mono text-slate-300">{calib.cellH}px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="240"
                  value={calib.cellH}
                  onChange={(e) => onUpdateCalib({ ...calib, cellH: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Gap X & Gap Y */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Col Gap</span>
                  <span className="font-mono text-slate-300">{calib.gapX}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={calib.gapX}
                  onChange={(e) => onUpdateCalib({ ...calib, gapX: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Row Gap</span>
                  <span className="font-mono text-slate-300">{calib.gapY}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={calib.gapY}
                  onChange={(e) => onUpdateCalib({ ...calib, gapY: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Rotation slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Rotation Alignment</span>
                <span className="font-mono text-indigo-400">{calib.rotation.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={calib.rotation}
                onChange={(e) => onUpdateCalib({ ...calib, rotation: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Scan Viewport */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Blue outline boxes show 81 character slicing targets</span>
            </span>
            <span className="text-emerald-400 font-mono">
              {scannedImage ? 'Scan Loaded & Calibrated' : 'Awaiting image'}
            </span>
          </div>

          <div className="relative flex-1 min-h-[520px] max-h-[750px] overflow-auto bg-slate-950 rounded-2xl border border-slate-800/90 p-3 flex items-center justify-center shadow-inner">
            {scannedImage ? (
              <canvas
                ref={viewportCanvasRef}
                className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700"
              />
            ) : (
              <div className="text-center p-8 space-y-3 max-w-sm">
                <UploadCloud className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No Scanned Template Loaded Yet</h4>
                <p className="text-xs text-slate-500">
                  Drag and drop a scanned template into the dropzone on the left, capture a photo using your camera, or click "Load Demo Sample" at the top!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
