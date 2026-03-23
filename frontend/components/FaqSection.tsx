"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSectionProps {
  title: string;
  description: string;
  items: FaqItem[];
  contactText?: string;
  contactActionLabel?: string;
  onContactAction?: () => void;
}

export function FaqSection({ title, description, items, contactText, contactActionLabel, onContactAction }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-10 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="max-w-md">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="bg-linear-to-b from-[#0b2866] to-[#041133] border border-blue-800/50 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col gap-6">
            {items.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`pb-6 ${i !== items.length - 1 ? 'border-b border-blue-400/20' : ''}`}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{faq.q}</span>
                    <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'text-white' : 'text-gray-400 rotate-180 group-hover:text-gray-300'}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-sm font-light text-blue-100/70 leading-relaxed pr-8 pb-1">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {contactText && contactActionLabel && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-4">
                <span className="text-sm font-light text-blue-200">{contactText}</span>
                <button onClick={onContactAction} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg">
                  {contactActionLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
