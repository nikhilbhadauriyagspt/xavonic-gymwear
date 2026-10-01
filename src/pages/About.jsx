import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShieldCheck, Zap, Sparkles, ChevronRight, Mail, Phone } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export default function About() {
  const { brand: content, loading, brandName } = useBrand();
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  const faqs = content?.about_faqs || [
    {
      q: 'What makes Xavonic an affordable gym wear brand in India?',
      a: 'Xavonic cuts out unnecessary retail markups by focusing on direct, performance-first manufacturing. You get gym wear with real fabric technology — breathable blends, stretch, moisture-wicking — at an honest price.'
    },
    {
      q: 'Does Xavonic make gym wear for both men and women?',
      a: 'Yes. Xavonic offers dedicated athletic wear for both men and women, including compression fits, oversized drops, stringers, and seamless leggings.'
    },
    {
      q: "What's the difference between activewear and performance gym wear?",
      a: 'Performance gym wear is built specifically for heavy training — with high-tensile compression support, sweat-wicking capillary knit, and squat-proof flexibility.'
    },
    {
      q: 'Is Xavonic gym wear suitable for daily streetwear use?',
      a: 'Yes. Our drop-cut tops, heavyweight oversized tees, and tactical joggers transition seamlessly into everyday streetwear.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-600 selection:text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-14">
      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto space-y-4 mb-10">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link to="/" className="hover:text-red-500 transition-colors">HOME</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500 uppercase">OUR BRAND</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-red-500 uppercase font-semibold">ABOUT US</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500 block mb-1">
              {content?.about_badge || 'Brand Story & Philosophy'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              {content?.about_heading || 'Gym Wear for Men & Women'}
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            {content?.about_tagline || 'Engineered for Performance. Cut for Aesthetics.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Brand Story Hero Card */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div
                className="prose prose-invert max-w-none text-zinc-300 text-sm sm:text-base leading-relaxed
                  prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-bold prose-h3:text-white prose-h3:tracking-tight
                  prose-p:text-zinc-400 prose-p:my-3"
                dangerouslySetInnerHTML={{
                  __html: content?.about_story_html || `
                    <h3>THE ATHLETIC STANDARD</h3>
                    <p>Born from the raw intensity of bodybuilding and athletic training, our apparel is constructed to eliminate the compromise between aesthetic taper and high-tensile durability.</p>
                    <p>Every piece is tested on active lifters to guarantee moisture management, 4-way stretch rebound, and reinforced stress-point stitching.</p>
                  `
                }}
              />

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/collections"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Collection</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-colors inline-flex items-center gap-2"
                >
                  <span>Contact Support</span>
                </Link>
              </div>
            </div>

            {/* Core Values Mini Cards */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-500">
                  <Zap className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct-to-Athlete</h4>
                </div>
                <p className="text-xs text-zinc-400">Zero middleman markups. Premium 240 GSM organic terry fabrics at accessible prices.</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Gym-Tested Quality</h4>
                </div>
                <p className="text-xs text-zinc-400">Squat-proof stretch, fade-resistant color dyes, and double-stitched athletic seams.</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-500">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Aesthetic Fit</h4>
                </div>
                <p className="text-xs text-zinc-400">Tailored specifically to accentuate the upper body taper and provide freedom of movement.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-10 space-y-6">
          <div className="border-b border-zinc-900 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-500">Got Questions?</span>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-900 bg-zinc-900/40 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm text-zinc-200 hover:text-white cursor-pointer"
                  >
                    <span>{idx + 1}. {faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-red-500 shrink-0 ml-3" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Search Terms */}
        {content?.popular_searches && content.popular_searches.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Popular Search Terms
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.popular_searches.map((tag, idx) => (
                <Link
                  key={idx}
                  to={`/collections?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-zinc-900 hover:bg-red-600 hover:text-white text-zinc-400 text-xs font-mono transition-colors border border-zinc-800"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
