import { ReactNode } from "react";

export interface FeatureCard {
  title: ReactNode;
  description: string;
  className?: string;
  visual: ReactNode;
}

export interface FeatureCardsProps {
  title: ReactNode;
  description: string;
  cards: FeatureCard[];
}

export function FeatureCards({ title, description, cards }: FeatureCardsProps) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-3xl mb-16">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`border border-white/5 rounded-[2rem] p-8 flex flex-col ${card.className || 'bg-[#0e0e0e]'}`}>
            <h3 className="text-2xl font-medium text-white mb-3">{card.title}</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-light">{card.description}</p>
            {card.visual}
          </div>
        ))}
      </div>
    </section>
  );
}
