import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Ruler, Info, ArrowRight } from 'lucide-react';

export default function SmartFitFinderModal({ isOpen, onClose, onSelectSize, currentProduct }) {
  const [heightUnit, setHeightUnit] = useState('ft'); // 'ft' | 'cm'
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [heightCm, setHeightCm] = useState(178);

  const [weightKg, setWeightKg] = useState(74);
  const [bodyType, setBodyType] = useState('athletic'); // 'lean' | 'athletic' | 'muscular' | 'broad'
  const [fitPreference, setFitPreference] = useState('athletic'); // 'tight' | 'athletic' | 'relaxed'

  // Calculate Best Matching Size
  const recommendedFit = useMemo(() => {
    let cm = heightUnit === 'ft' ? Math.round(heightFt * 30.48 + heightIn * 2.54) : heightCm;
    let weight = weightKg;

    // Base score based on height & weight BMI estimation
    let score = (weight / ((cm / 100) * (cm / 100))); // BMI estimate

    if (bodyType === 'muscular') score += 2.5;
    if (bodyType === 'broad') score += 2.0;
    if (bodyType === 'lean') score -= 1.5;

    if (fitPreference === 'tight') score -= 1.8;
    if (fitPreference === 'relaxed') score += 2.2;

    let size = 'M';
    let matchAccuracy = 98;

    if (score < 20.5) {
      size = 'S';
      matchAccuracy = 96;
    } else if (score >= 20.5 && score < 24.5) {
      size = 'M';
      matchAccuracy = 98;
    } else if (score >= 24.5 && score < 28.5) {
      size = 'L';
      matchAccuracy = 99;
    } else if (score >= 28.5 && score < 32.5) {
      size = 'XL';
      matchAccuracy = 97;
    } else {
      size = 'XXL';
      matchAccuracy = 95;
    }

    // Verify if size exists in product
    const availableSizes = currentProduct?.sizes || ['S', 'M', 'L', 'XL'];
    if (!availableSizes.includes(size)) {
      size = availableSizes[availableSizes.length - 1] || 'L';
    }

    return {
      size,
      accuracy: matchAccuracy,
      explanation:
        fitPreference === 'tight'
          ? 'Recommended for maximum muscle grip and true second-skin compression.'
          : fitPreference === 'relaxed'
          ? 'Recommended for a roomy drop-shoulder pump cover silhouette.'
          : 'Recommended for an athletic V-taper fit that accentuates shoulders and chest.',
    };
  }, [heightUnit, heightFt, heightIn, heightCm, weightKg, bodyType, fitPreference, currentProduct]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white border border-neutral-200 shadow-2xl rounded-xs overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Smart Fit & Size Finder
                </h3>
                <p className="text-[10px] text-neutral-500 font-normal">
                  Personalized size estimation for {currentProduct?.title || 'Gym Apparel'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Form */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* 1. Height Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                  Your Height
                </label>
                <div className="flex bg-neutral-100 p-0.5 rounded-xs text-[10px] font-semibold border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('ft')}
                    className={`px-2 py-0.5 rounded-2xs cursor-pointer ${heightUnit === 'ft' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'}`}
                  >
                    FT + IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-2 py-0.5 rounded-2xs cursor-pointer ${heightUnit === 'cm' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'}`}
                  >
                    CM
                  </button>
                </div>
              </div>

              {heightUnit === 'ft' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Feet</span>
                    <select
                      value={heightFt}
                      onChange={(e) => setHeightFt(Number(e.target.value))}
                      className="w-full h-9 border border-neutral-300 rounded-xs px-2 text-xs font-semibold outline-none focus:border-neutral-900"
                    >
                      {[4, 5, 6, 7].map((f) => (
                        <option key={f} value={f}>{f} ft</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Inches</span>
                    <select
                      value={heightIn}
                      onChange={(e) => setHeightIn(Number(e.target.value))}
                      className="w-full h-9 border border-neutral-300 rounded-xs px-2 text-xs font-semibold outline-none focus:border-neutral-900"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>{i} in</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="range"
                    min="140"
                    max="215"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-neutral-600 mt-1">
                    <span>140 cm</span>
                    <span className="font-bold text-neutral-900 text-xs">{heightCm} cm</span>
                    <span>215 cm</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Weight Selector */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                  Your Body Weight
                </label>
                <span className="font-mono font-bold text-neutral-900 text-xs">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min="45"
                max="135"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>45 kg</span>
                <span>80 kg</span>
                <span>135 kg</span>
              </div>
            </div>

            {/* 3. Body Build Type */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 block">
                Body Physique
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'lean', label: 'Lean / Slim' },
                  { id: 'athletic', label: 'Athletic V-Taper' },
                  { id: 'muscular', label: 'Muscular / Bulked' },
                  { id: 'broad', label: 'Broad / Solid' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBodyType(b.id)}
                    className={`p-2 border rounded-xs text-center transition-all cursor-pointer ${
                      bodyType === b.id
                        ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-[11px] block">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fit Preference */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 block">
                Preferred Fit Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tight', label: 'Snug Compression' },
                  { id: 'athletic', label: 'Standard Athletic' },
                  { id: 'relaxed', label: 'Loose Pump Cover' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFitPreference(f.id)}
                    className={`p-2 border rounded-xs text-center transition-all cursor-pointer ${
                      fitPreference === f.id
                        ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-[11px] block">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendation Result Card */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Recommended Size</span>
                    <h4 className="text-xl font-black text-neutral-950">SIZE {recommendedFit.size}</h4>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {recommendedFit.accuracy}% Fit Match
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-normal">
                {recommendedFit.explanation}
              </p>
            </div>

          </div>

          {/* Footer CTA */}
          <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSelectSize) onSelectSize(recommendedFit.size);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-xs cursor-pointer"
            >
              <span>Select Size {recommendedFit.size}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
