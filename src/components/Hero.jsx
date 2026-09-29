import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

import heroCompression from '../assets/hero_compression.jpg';
import heroOversized from '../assets/hero_oversized.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: heroCompression, alt: 'Guidelya Xtreme Compression Gymwear' },
    { image: heroOversized, alt: 'Guidelya Heavyweight Oversized Tees' },
    { image: heroJoggers, alt: 'Guidelya Tapered Gym Joggers and Lowers' },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Autoplay slider smoothly every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const scrollToCategories = () => {
    const section = document.getElementById('categories-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[520px] bg-black overflow-hidden select-none rounded-none">
      {/* 1. ULTRA HIGH QUALITY PURE FULL-HEIGHT IMAGES SLIDES */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* 2. MINIMALIST SLIDE INDICATORS */}
      <div className="absolute bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-[2px] transition-all duration-300 rounded-none cursor-pointer ${
              currentSlide === idx 
                ? 'w-10 bg-red-600' 
                : 'w-4 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* 3. PROMINENT BOUNCING SCROLL DOWN ARROW BUTTON */}
      <button
        onClick={scrollToCategories}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-white/80 hover:text-red-500 transition-colors cursor-pointer group"
        aria-label="Scroll to Categories"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 group-hover:border-red-600 flex items-center justify-center animate-bounce transition-colors">
          <ChevronDown className="w-5 h-5 text-white group-hover:text-red-500 stroke-[2.2]" />
        </div>
      </button>
    </section>
  );
}
