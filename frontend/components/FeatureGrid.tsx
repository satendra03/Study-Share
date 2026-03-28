import { ReactNode } from "react";

export interface GridFeature {
  icon: ReactNode;
  title: string;
  desc: string;
}

export interface FeatureGridProps {
  title: string;
  description: string;
  features: GridFeature[];
}

export function FeatureGrid({ title, description, features }: FeatureGridProps) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-10">
      <div className="mb-16 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">{title}</h2>
        <p className="text-gray-400 text-lg font-light leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {features.map((feat, i) => (
          <div key={i} className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-linear-to-b from-[#1a2b5e] to-[#040814] border border-blue-900/50 flex items-center justify-center mb-6 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.2)]">
              {feat.icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-3">{feat.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
