import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Palette,
  ArrowRight,
  Sliders
} from 'lucide-react';
import Modal from '../components/Modal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full space-y-16 py-12 px-4 sm:px-8 lg:px-12">
      {/* Hero Section */}
      <section className="w-full text-center space-y-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>React 18/19 + Vite + Tailwind CSS + Lucide + Sonner</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Complete Production-Ready <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            React Starter Setup
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
          Pre-configured with modern routing, beautiful Lucide icons, smooth animated popup modals, and interactive toast notifications.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Demo Popup</span>
          </button>

          <button
            onClick={() => toast.success('🎉 Congratulations! Setup is fully working!')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Test Toast Notification</span>
          </button>
        </div>
      </section>

      {/* Interactive Toast Tester Grid */}
      <section className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Bell className="w-7 h-7 text-indigo-400" />
            Popup & Toast Notification Types
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Click the buttons below to test different types of interactive toasts & popups across full screen width.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <button
            onClick={() => toast.success('Operation completed successfully!', { description: 'Your data has been saved to the database.' })}
            className="flex items-center justify-between p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 transition-all text-left font-medium cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>Success Toast</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => toast.error('Error encountered!', { description: 'Please check your connection and retry.' })}
            className="flex items-center justify-between p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-all text-left font-medium cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5" />
              <span>Error Toast</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => toast.warning('Warning detected!', { description: 'Disk space is running low.' })}
            className="flex items-center justify-between p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 transition-all text-left font-medium cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Warning Toast</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => {
              const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Guidelya' }), 2000));
              toast.promise(promise, {
                loading: 'Loading data...',
                success: (data) => `${data.name} loaded successfully!`,
                error: 'Error loading data',
              });
            }}
            className="flex items-center justify-between p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 transition-all text-left font-medium cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <span>Promise Toast</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </section>

      {/* Feature Highlights Full Width */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white">Tailwind CSS Ready</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pre-configured with Tailwind utility classes, full-width responsive support, and dark styling.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white">Lucide Icons & Popups</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Rich 1000+ modern SVG icons + smooth animated modal dialogs & toast alerts.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white">React Router v7</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Multi-page routing with layout nesting, dynamic routes, and navigation components.
          </p>
        </div>
      </section>

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="✨ Interactive Modal Popup"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Yeh popup <strong>Framer Motion</strong> aur <strong>Tailwind CSS</strong> se bna hai. Isme smooth entry/exit animations, background blur backdrop, aur ESC key support enabled hai!
          </p>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300">
            Popup / Dialog is working seamlessly!
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Action confirmed from modal!');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              Confirm Action
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
