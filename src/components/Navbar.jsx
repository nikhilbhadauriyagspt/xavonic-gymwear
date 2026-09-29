import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Compass, 
  Menu, 
  X, 
  ChevronDown, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* 100% Full Width Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between h-18">
        
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            Guidelya<span className="text-indigo-500">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Menu Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-slate-800/60 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Side Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">
            Sign In
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (100% Full Width) */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full px-4 sm:px-8 py-4 space-y-2 bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            <button className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              Sign In
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
