import React from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Edit2,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { FilterSettings, CharacterDef } from '../types';
import { CHARACTERS } from '../utils/characters';
import { binarizeCanvas, analyzeGlyphTopology } from '../utils/imageProcessing';

interface Step3VectorizeProps {
  extractedBitmaps: HTMLCanvasElement[];
  filterSettings: FilterSettings;
  onUpdateFilters: (newFilters: FilterSettings) => void;
  onOpenGlyphEditor: (idx: number) => void;
  onProceedToStep4: () => void;
  onSynthesizeMissing: () => void;
}

export const Step3Vectorize: React.FC<Step3VectorizeProps> = ({
  extractedBitmaps,
  filterSettings,
  onUpdateFilters,
  onOpenGlyphEditor,
  onProceedToStep4,
  onSynthesizeMissing,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="heading-font text-2xl font-bold text-white flex items-center gap-2">
            Step 3: Process Image & Fine-Tune Glyphs
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Adjust binarization contrast, stroke boldness, and despeckle noise. Click any letter to open the high-precision pixel editor.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSynthesizeMissing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Complete Missing</span>
          </button>

          <button
            onClick={onProceedToStep4}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2"
          >
            <span>Build Font & Sandbox</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Image Processing Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shadow-xl">
        {/* Binarization Threshold */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Binarization Threshold</span>
            <span className="font-mono text-indigo-400 font-bold">{filterSettings.threshold}</span>
          </div>
          <input
            type="range"
            min="30"
            max="230"
            value={filterSettings.threshold}
            onChange={(e) =>
              onUpdateFilters({ ...filterSettings, threshold: parseInt(e.target.value) })
            }
            className="w-full accent-indigo-500"
          />
          <span className="text-[10px] text-slate-500 block mt-1">Adjust stroke vs paper background contrast</span>
        </div>

        {/* Invert Filter */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Invert Image</span>
            <span className="text-[10px] text-slate-400">White ink on dark paper</span>
          </div>
          <input
            type="checkbox"
            checked={filterSettings.invert}
            onChange={(e) =>
              onUpdateFilters({ ...filterSettings, invert: e.target.checked })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {/* Despeckle / Noise reduction */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Noise Despeckle</span>
            <span className="text-[10px] text-slate-400">Remove stray dust specks</span>
          </div>
          <input
            type="checkbox"
            checked={filterSettings.despeckle}
            onChange={(e) =>
              onUpdateFilters({ ...filterSettings, despeckle: e.target.checked })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {/* Stroke Boldness */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Stroke Boldness</span>
            <span className="font-mono text-indigo-400 font-bold">
              {filterSettings.boldness > 0 ? `+${filterSettings.boldness}` : filterSettings.boldness}
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="3"
            step="1"
            value={filterSettings.boldness}
            onChange={(e) =>
              onUpdateFilters({ ...filterSettings, boldness: parseInt(e.target.value) })
            }
            className="w-full accent-indigo-500"
          />
          <span className="text-[10px] text-slate-500 block mt-1">Thicken or thin stroke contours</span>
        </div>
      </div>

      {/* Extracted Character Cards Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-slate-200 text-sm">
              Vectorized Glyph Cards ({extractedBitmaps.length} Glyphs)
            </h2>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
              Ready for Compilation
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">Click any card to open the fine-tuning editor modal</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2.5 max-h-[560px] overflow-y-auto p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80">
          {CHARACTERS.map((charDef, idx) => {
            const cropCvs = extractedBitmaps[idx];
            if (!cropCvs) return null;

            const binGrid = binarizeCanvas(cropCvs, filterSettings);
            const { confidence, strokePixels } = analyzeGlyphTopology(binGrid);

            // Generate card preview data URL
            const previewCvs = document.createElement('canvas');
            previewCvs.width = 128;
            previewCvs.height = 128;
            const pCtx = previewCvs.getContext('2d');
            if (pCtx) {
              const imgData = pCtx.createImageData(128, 128);
              const data = imgData.data;
              for (let i = 0; i < 128 * 128; i++) {
                const v = binGrid[i] === 1 ? 0 : 255;
                data[i * 4] = v;
                data[i * 4 + 1] = v;
                data[i * 4 + 2] = v;
                data[i * 4 + 3] = 255;
              }
              pCtx.putImageData(imgData, 0, 0);
            }

            return (
              <div
                key={charDef.char}
                onClick={() => onOpenGlyphEditor(idx)}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-2 flex flex-col items-center space-y-1.5 cursor-pointer transition group relative hover:scale-105 shadow-sm"
              >
                <div className="w-full aspect-square bg-white rounded-xl border border-slate-700/60 overflow-hidden flex items-center justify-center p-1 shadow-inner relative">
                  <img
                    src={previewCvs.toDataURL()}
                    alt={charDef.char}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition flex items-center justify-center">
                    <Edit2 className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full px-0.5">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 font-mono">
                    {charDef.char}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold px-1 rounded ${
                      strokePixels > 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {strokePixels > 30 ? `${confidence}%` : 'empty'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
