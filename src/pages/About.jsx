import React from 'react';
import { CheckCircle, Rocket } from 'lucide-react';

export default function About() {
  const steps = [
    {
      title: 'Vite React App Created',
      desc: 'Blazing fast setup with modern React bundling.'
    },
    {
      title: 'Tailwind CSS Plugin Configured',
      desc: 'Seamless styling using Tailwind classes and responsive full-width design.'
    },
    {
      title: 'Lucide Icons Integrated',
      desc: 'Extensive icon collection imported easily from lucide-react.'
    },
    {
      title: 'Sonner Popups & Modal System',
      desc: 'Interactive notifications and animated popups with escape and backdrop blur.'
    },
    {
      title: 'React Router Routing Added',
      desc: 'Navigation with URL history and active route highlights.'
    }
  ];

  return (
    <div className="w-full py-12 px-4 sm:px-8 lg:px-12 space-y-12">
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">About Project Setup</h1>
        <p className="text-slate-400 text-base sm:text-lg">Project structure and installed dependencies summary.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            Quick Start Commands
          </h2>
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-sm text-indigo-300 space-y-3">
            <p className="text-slate-500"># Start local development server</p>
            <p className="text-emerald-400 font-semibold">npm run dev</p>
            <p className="text-slate-500 pt-2"># Build for production</p>
            <p className="text-emerald-400 font-semibold">npm run build</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Included in this setup
          </h2>
          <div className="space-y-3.5">
            {steps.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
