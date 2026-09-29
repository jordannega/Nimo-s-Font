import React from 'react';
import { PenTool, Sparkles, RotateCcw, Camera, Printer, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onLoadDemo: (presetKey: string) => void;
  onResetAll: () => void;
  onOpenLiveCamera: () => void;
  drawnCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onSelectStep,
  onLoadDemo,
  onResetAll,
  onOpenLiveCamera,
  drawnCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectStep(1)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="heading-font font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                GlyphForge
              </span>
              <span className="text-[11px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span>AI OCR</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Handwriting to Font & Real-Time OCR Studio</p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Preset Selector */}
          <div className="relative group">
            <button className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700/80 transition flex items-center space-x-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Presets</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 flex flex-col space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Quick Demo Handwriting
              </div>
              <button
                onClick={() => onLoadDemo('cursive')}
                className="text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>Caveat Cursive</span>
                <span className="text-[10px] text-indigo-400">Casual</span>
              </button>
              <button
                onClick={() => onLoadDemo('architect')}
                className="text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>Draftsman Print</span>
                <span className="text-[10px] text-emerald-400">Clean</span>
              </button>
              <button
                onClick={() => onLoadDemo('reenie')}
                className="text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>Whimsical Quill</span>
                <span className="text-[10px] text-purple-400">Fancy</span>
              </button>
              <button
                onClick={() => onLoadDemo('kalam')}
                className="text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span>Artisan Script</span>
                <span className="text-[10px] text-amber-400">Warm</span>
              </button>
            </div>
          </div>

          {/* Camera Scanner Trigger */}
          <button
            onClick={onOpenLiveCamera}
            className="text-xs font-medium bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 hover:text-white px-3 py-2 rounded-lg border border-indigo-700/50 transition flex items-center space-x-1.5 shadow-sm"
            title="Scan paper handwriting using webcam or phone camera"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Camera Scan</span>
          </button>

          {/* Reset All */}
          <button
            onClick={onResetAll}
            className="text-xs font-medium bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-300 px-3 py-2 rounded-lg border border-slate-700/50 hover:border-red-500/30 transition flex items-center space-x-1.5"
            title="Reset character grid"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Step Navigation Bar */}
      <nav className="border-t border-slate-800/80 bg-slate-900/40 py-2.5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 text-xs sm:text-sm">
            {[
              { num: 1, label: 'Template / Draw', sub: `${drawnCount}/81 Glyphs` },
              { num: 2, label: 'Upload & OCR', sub: 'Real-Time Scan' },
              { num: 3, label: 'Vectorize & Edit', sub: 'Filters & Modal' },
              { num: 4, label: 'Export & Sandbox', sub: 'Download .TTF' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => onSelectStep(step.num)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2.5 p-2 rounded-xl border transition cursor-pointer ${
                    isActive
                      ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 border-slate-800/90 bg-slate-900/40 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {step.num}
                  </span>
                  <div className="text-left overflow-hidden">
                    <span className="font-semibold block truncate leading-tight text-xs sm:text-sm">{step.label}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:block leading-tight">{step.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
