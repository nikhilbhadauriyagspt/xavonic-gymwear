import React from 'react';
import { 
  Flame, 
  Compass, 
  Boxes, 
  MessageSquare, 
  Cpu, 
  Smartphone
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Flame,
      title: 'Vite 6 / Lightning Fast',
      description: 'Instant server start, lightning fast HMR (Hot Module Replacement) and optimized production builds.',
      badge: 'Speed'
    },
    {
      icon: Boxes,
      title: 'Tailwind CSS Modern Styling',
      description: 'Utility-first CSS framework for rapid UI development with responsive and modern dark mode design.',
      badge: 'Styling'
    },
    {
      icon: Compass,
      title: 'React Router Routing',
      description: 'Declarative, client-side routing supporting nested views, active route styling, and browser history.',
      badge: 'Routing'
    },
    {
      icon: MessageSquare,
      title: 'Sonner & Popups',
      description: 'Beautiful animated toast notifications and customizable dialog popups with backdrop blur effects.',
      badge: 'Notifications'
    },
    {
      icon: Cpu,
      title: 'Lucide React Icons',
      description: 'Clean, customizable SVG icon set with 1,000+ icons ready to import and use.',
      badge: 'Icons'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Responsive',
      description: 'Fully responsive UI layouts looking great across mobile, tablet, laptop, and desktop screens.',
      badge: 'Responsive'
    }
  ];

  return (
    <div className="w-full py-12 px-4 sm:px-8 lg:px-12 space-y-12">
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Installed & Configured Features
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Everything you requested has been cleanly configured and ready for your project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {feat.badge}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
