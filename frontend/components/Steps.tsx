import { ReactNode } from "react";

export interface StepItem {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface StepsProps {
  title: ReactNode;
  description: string;
  steps: StepItem[];
}

export function Steps({ title, description, steps }: StepsProps) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 mb-10">
      <div className="mb-16 max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">{title}</h2>
        <p className="text-gray-400 text-lg font-light leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-linear-to-br from-[#0e0e0e] to-[#0a1128] border border-[#1a2342] rounded-[2rem] p-8 pb-10 relative overflow-hidden group">
            <div className="absolute right-0 -bottom-10 text-[240px] font-bold text-white/2 group-hover:text-white/4 transition-all duration-500 leading-none tracking-tighter select-none">
              {i + 1}
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-auto pb-24">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
