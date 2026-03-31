import Link from "next/link";

export interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  image: string;
  link: string;
}

export interface TeamGridProps {
  title: string;
  description: string;
  members: TeamMember[];
}

export function TeamGrid({ title, description, members }: TeamGridProps) {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-10 border-t border-white/5">
      <div className="mb-16 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed font-light">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {members.map((member) => (
          <Link href={member.link} target="_blank" key={member.id} className="flex flex-col group cursor-pointer">
          <div key={member.id} className="flex flex-col group cursor-pointer">
            <div className="relative w-full aspect-4/3 rounded-[2rem] overflow-hidden mb-5 bg-[#0a0f25] border border-blue-900/30">
              {/* Duotone blue effect using CSS mix-blend modes */}
              <div className="absolute inset-0 bg-linear-to-b from-[#2563eb] to-[#01092e] mix-blend-color z-10 opacity-80 group-hover:opacity-0 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent opacity-80 pointer-events-none z-20 group-hover:opacity-30 transition-opacity duration-500" />
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover object-center grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105 transition-all duration-700 ease-out z-0 relative"
              />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-1 tracking-tight">{member.name}</h3>
            <span className="text-gray-400 flex items-center gap-2 text-sm font-light">{member.role}</span>
          </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
