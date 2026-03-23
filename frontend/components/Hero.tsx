import { ReactNode } from "react";
import { ArrowRight, Zap } from "lucide-react";

export interface HeroProps {
  badgeText: string;
  title: ReactNode;
  description: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  trustMetrics?: {
    amount: string;
    text: string;
    avatars: string[];
  };
  logos?: ReactNode[];
}

export function Hero({ badgeText, title, description, primaryActionText, onPrimaryAction, trustMetrics, logos }: HeroProps) {
  return (
    <>
      <section className="relative z-10 flex flex-col justify-center items-center text-center px-4 pt-28 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm shadow-sm">
          <span>{badgeText}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 max-w-4xl leading-[1.1]">
          {title}
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {primaryActionText && onPrimaryAction && (
            <button
              onClick={onPrimaryAction}
              className="flex items-center gap-3 bg-primary cursor-pointer hover:bg-[#4d46db] text-white px-7 py-3.5 rounded-full font-medium transition-all shadow-[0_0_30px_-5px_var(--primary)] text-sm md:text-base"
            >
              {primaryActionText} <div className="bg-white rounded-full p-0.5 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-[#5C55F9]" strokeWidth={3} /></div>
            </button>
          )}

          {trustMetrics && (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {trustMetrics.avatars.map((avatar, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-[3px] border-[#030303] bg-gray-600 overflow-hidden relative">
                    <img src={avatar} alt="avatar" className={`object-cover h-full w-full ${i === 2 ? 'grayscale' : ''}`} />
                  </div>
                ))}
              </div>
              <div className="text-left leading-tight">
                <div className="text-white font-semibold flex items-center gap-1 text-sm"><Zap className="w-3 h-3 fill-current" /> {trustMetrics.amount}</div>
                <div className="text-gray-500 text-xs font-medium">{trustMetrics.text}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Logos Strip */}
      {logos && logos.length > 0 && (
        <div className="relative z-10 pt-10 pb-20 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale px-6">
          {logos.map((logo, i) => <div key={i}>{logo}</div>)}
        </div>
      )}
    </>
  );
}
