import { ReactNode } from "react";

export interface ContactInfoBlock {
  title: string;
  value: string;
  subtext: string;
}

export interface ContactInfoProps {
  badgeText: string;
  title: ReactNode;
  blocks: ContactInfoBlock[];
}

export function ContactInfo({ badgeText, title, blocks }: ContactInfoProps) {
  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 -mt-10">
      <div className="bg-[#051124] border border-[#1a2b5e] rounded-[2rem] p-10 md:p-14 flex flex-col lg:flex-row gap-16 justify-between items-start lg:items-center">
        
        <div className="max-w-md">
          <p className="text-gray-300 text-lg mb-6">{badgeText}</p>
          <h2 className="text-3xl md:text-[2.5rem] font-medium tracking-tight text-white leading-[1.15]">
            {title}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
          {blocks.map((block, i) => (
            <div key={i} className="flex flex-col">
              <h3 className="text-white font-medium mb-4">{block.title}</h3>
              <div className="w-5 h-[2px] bg-white mb-6"></div>
              <p className="text-white text-lg mb-2">{block.value}</p>
              <p className="text-gray-400 text-sm font-light leading-relaxed max-w-[200px]">
                {block.subtext}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
