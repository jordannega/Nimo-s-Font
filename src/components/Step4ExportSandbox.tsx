import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileDown,
  Layers,
  Sliders,
  Type,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FontMetadata } from '../types';
import opentype from 'opentype.js';

interface Step4ExportSandboxProps {
  fontMetadata: FontMetadata;
  compiledFont: opentype.Font | null;
  fontBlobUrl: string | null;
  onUpdateMetadata: (meta: FontMetadata) => void;
  onRecompileFont: () => void;
}

export const Step4ExportSandbox: React.FC<Step4ExportSandboxProps> = ({
  fontMetadata,
  compiledFont,
  fontBlobUrl,
  onUpdateMetadata,
  onRecompileFont,
}) => {
  const [fontSize, setFontSize] = useState<number>(44);
  const [paperTheme, setPaperTheme] = useState<'lined' | 'grid' | 'white' | 'dark'>('lined');
  const [inkColor, setInkColor] = useState<string>('#1e1b4b'); // deep navy ink
  const [sampleText, setSampleText] = useState<string>(
    'The quick brown fox jumps over the lazy dog!\nPack my box with five dozen liquor jugs.\n0123456789 - Ready for production!'
  );
  const [isCopiedCss, setIsCopiedCss] = useState<boolean>(false);
  const [isWritingAnimation, setIsWritingAnimation] = useState<boolean>(false);
  const [animatedText, setAnimatedText] = useState<string>('');
  const animationTimerRef = useRef<any>(null);

  // Trigger celebratory confetti on initial load of Step 4 if font compiled
  useEffect(() => {
    if (compiledFont) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#10b981'],
      });
    }
  }, [compiledFont]);

  // Clean animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, []);

  const handleDownloadTtf = () => {
    if (!compiledFont) {
      onRecompileFont();
    }
    if (compiledFont) {
      compiledFont.download(`${fontMetadata.fontName.replace(/\s+/g, '_')}.ttf`);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleCopyCss = () => {
    const css = `@font-face {
  font-family: '${fontMetadata.fontName}';
  src: url('${fontMetadata.fontName.replace(/\s+/g, '_')}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}`;
    navigator.clipboard.writeText(css);
    setIsCopiedCss(true);
    setTimeout(() => setIsCopiedCss(false), 2000);
  };

  const handleStartAnimation = () => {
    if (isWritingAnimation) {
      setIsWritingAnimation(false);
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      return;
    }

    setIsWritingAnimation(true);
    setAnimatedText('');
    const fullText = sampleText;
    let currIdx = 0;

    if (animationTimerRef.current) clearInterval(animationTimerRef.current);

    animationTimerRef.current = setInterval(() => {
      currIdx++;
      if (currIdx <= fullText.length) {
        setAnimatedText(fullText.slice(0, currIdx));
      } else {
        clearInterval(animationTimerRef.current);
        setIsWritingAnimation(false);
      }
    }, 45);
  };

  // Export note area as PNG image
  const handleExportNoteImage = () => {
    const noteEl = document.getElementById('sandbox-note-area');
    if (!noteEl) return;

    // Use a canvas to render simple note preview
    const cvs = document.createElement('canvas');
    cvs.width = 1000;
    cvs.height = 700;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = paperTheme === 'dark' ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, 1000, 700);

    ctx.fillStyle = inkColor;
    ctx.font = `${fontSize * 1.5}px "GeneratedCustomFont", cursive, sans-serif`;

    const lines = (isWritingAnimation ? animatedText : sampleText).split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 60, 100 + i * (fontSize * 1.8));
    });

    const a = document.createElement('a');
    a.href = cvs.toDataURL('image/png');
    a.download = `${fontMetadata.fontName.replace(/\s+/g, '_')}_sample.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="heading-font text-2xl font-bold text-white flex items-center gap-2">
          Step 4: Generate Font & Live Sandbox
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Export your real binary .TTF font file to use on your operating system, Word, Photoshop, Figma, or website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Font Metadata & Download Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-xl">
          <h2 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-400" />
            <span>Font Metadata & Export</span>
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Font Name</label>
              <input
                type="text"
                value={fontMetadata.fontName}
                onChange={(e) => onUpdateMetadata({ ...fontMetadata, fontName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Designer / Author</label>
              <input
                type="text"
                value={fontMetadata.designer}
                onChange={(e) => onUpdateMetadata({ ...fontMetadata, designer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Ascender</label>
                <input
                  type="number"
                  value={fontMetadata.ascender}
                  onChange={(e) =>
                    onUpdateMetadata({ ...fontMetadata, ascender: parseInt(e.target.value) || 800 })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Descender</label>
                <input
                  type="number"
                  value={fontMetadata.descender}
                  onChange={(e) =>
                    onUpdateMetadata({ ...fontMetadata, descender: parseInt(e.target.value) || -200 })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Letter Spacing / Tracking</span>
                <span className="font-mono text-indigo-400">{fontMetadata.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-20"
                max="80"
                value={fontMetadata.letterSpacing}
                onChange={(e) =>
                  onUpdateMetadata({ ...fontMetadata, letterSpacing: parseInt(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Primary Download Button */}
          <button
            onClick={handleDownloadTtf}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-indigo-500/25 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .TTF Font File</span>
          </button>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCss}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              {isCopiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedCss ? 'CSS Copied' : 'Copy CSS'}</span>
            </button>
            <button
              onClick={handleExportNoteImage}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Note PNG</span>
            </button>
          </div>

          {/* Instruction Box */}
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Universal Desktop & Web Compatible</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Double-click the downloaded <strong className="text-white">.TTF</strong> file on Windows or macOS to install it system-wide. It will appear right in Microsoft Word, Google Docs, Apple Pages, Figma, and Photoshop!
            </p>
          </div>
        </div>

        {/* Right Column: Live Sandbox & Paper Text Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col shadow-xl">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Live Font Sandbox</span>
              </h2>

              <button
                onClick={handleStartAnimation}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                  isWritingAnimation
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {isWritingAnimation ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isWritingAnimation ? 'Pause Write' : 'Pen Animation'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Size Slider */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-400">Size</span>
                <input
                  type="range"
                  min="22"
                  max="90"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-20 accent-indigo-500"
                />
                <span className="text-[11px] text-slate-300 font-mono w-7">{fontSize}px</span>
              </div>

              {/* Ink Color Picker */}
              <div className="flex items-center space-x-1">
                {[
                  { color: '#0f172a', name: 'Black' },
                  { color: '#1e1b4b', name: 'Navy' },
                  { color: '#451a03', name: 'Sepia' },
                  { color: '#4f46e5', name: 'Violet' },
                  { color: '#ffffff', name: 'White' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setInkColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-5 h-5 rounded-full border transition ${
                      inkColor === c.color ? 'ring-2 ring-indigo-400 scale-110' : 'border-slate-700'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Paper Background Style */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPaperTheme('lined')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    paperTheme === 'lined' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Lined
                </button>
                <button
                  onClick={() => setPaperTheme('grid')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    paperTheme === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setPaperTheme('white')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    paperTheme === 'white' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Plain
                </button>
                <button
                  onClick={() => setPaperTheme('dark')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    paperTheme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-medium">Quick Text:</span>
            <button
              onClick={() =>
                setSampleText('The quick brown fox jumps over the lazy dog!\nPack my box with five dozen liquor jugs.')
              }
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Pangram
            </button>
            <button
              onClick={() =>
                setSampleText('ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 !?.,-+=@#$')
              }
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              A-Z Matrix
            </button>
            <button
              onClick={() =>
                setSampleText(
                  'Dear friend,\nI am writing to you using my very own custom handwriting font created with GlyphForge!\nEvery stroke and curve is uniquely mine.'
                )
              }
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Personal Letter
            </button>
          </div>

          {/* Interactive Typing Sandbox Area */}
          <div
            id="sandbox-note-area"
            className={`flex-1 min-h-[380px] p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-hidden relative transition-colors duration-200 ${
              paperTheme === 'lined'
                ? 'paper-lined'
                : paperTheme === 'grid'
                ? 'paper-grid'
                : paperTheme === 'dark'
                ? 'paper-dark'
                : 'bg-white'
            }`}
          >
            <textarea
              value={isWritingAnimation ? animatedText : sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Type anything here to test your custom handwriting font..."
              className="w-full h-full bg-transparent resize-none focus:outline-none transition-all"
              style={{
                fontFamily: `'GeneratedCustomFont', cursive, sans-serif`,
                fontSize: `${fontSize}px`,
                color: inkColor,
                lineHeight: paperTheme === 'lined' ? '36px' : '1.4',
              }}
            />

            <div className="pt-3 border-t border-slate-400/20 flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <span>Rendering via dynamic OpenType @font-face</span>
              <span>{(isWritingAnimation ? animatedText : sampleText).length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
