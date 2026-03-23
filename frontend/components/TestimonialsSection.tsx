"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialItem {
  id: string | number;
  quote: string;
  name: string;
  role: string;
  image: string;
}

export interface TestimonialsSectionProps {
  title: string;
  items: TestimonialItem[];
}

export function TestimonialsSection({ title, items }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(2);

  if (!items || items.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const getSafeIndex = (index: number) => {
    return (index + items.length) % items.length;
  };

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-20 text-center">
      <h2 className="text-3xl font-medium tracking-tight text-white mb-16">{title}</h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid items-center mb-16">
          {items.map((t, idx) => (
            <div
              key={t.id}
              className={`col-start-1 row-start-1 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${idx === currentIndex
                  ? 'opacity-100 translate-y-0 z-10 pointer-events-auto'
                  : 'opacity-0 translate-y-4 z-0 pointer-events-none'
                }`}
            >
              <p className="text-3xl md:text-5xl font-light text-white leading-tight mb-10 tracking-tight">
                "{t.quote}"
              </p>

              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-white text-lg">{t.name}</h4>
                <p className="text-gray-500 text-sm">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-6 overflow-hidden">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors hover:bg-white/5 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-end justify-center gap-3 md:gap-4 overflow-hidden py-4 px-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            {[
              items[getSafeIndex(currentIndex - 2)],
              items[getSafeIndex(currentIndex - 1)],
              items[currentIndex],
              items[getSafeIndex(currentIndex + 1)],
              items[getSafeIndex(currentIndex + 2)],
            ].map((testi, slotIndex) => {
              if (!testi) return null;
              return (
                <div
                  key={`${slotIndex}-${testi.id}`}
                  onClick={() => setCurrentIndex(items.findIndex(t => t.id === testi.id))}
                  className={`rounded-2xl overflow-hidden shrink-0 cursor-pointer transition-all duration-300 ease-out ${slotIndex === 2
                      ? "w-20 h-20 md:w-24 md:h-24 bg-blue-500 ring-[3px] ring-primary ring-offset-4 ring-offset-[#030303] shadow-[0_0_20px_rgba(92,85,249,0.5)] transform -translate-y-2 grayscale-0 opacity-100"
                      : slotIndex === 1 || slotIndex === 3
                        ? "w-16 h-16 md:w-20 md:h-20 bg-gray-800 grayscale opacity-70 hover:opacity-100 transform translate-y-0"
                        : "w-16 h-16 md:w-20 md:h-20 bg-gray-800 grayscale opacity-50 hover:opacity-100 transform translate-y-0"
                    }`}
                >
                  <img src={testi.image} className={`w-full h-full object-cover transition-opacity duration-300 ${slotIndex === 2 ? 'mix-blend-luminosity brightness-110' : ''}`} alt={testi.name || ""} />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors hover:bg-white/5 shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
