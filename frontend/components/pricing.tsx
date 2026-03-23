import { CheckCircle2 } from "lucide-react";

export function Pricing({ noBorderTop = false }: { noBorderTop?: boolean }) {
  return (
    <section className={`relative z-10 max-w-7xl mx-auto px-6 py-24 ${noBorderTop ? '' : 'border-t border-white/5'}`}>
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">Choose the perfect Plan for Your Studies</h2>
        <p className="text-gray-400 text-lg font-light leading-relaxed mb-10">Find the plan that fits your learning needs perfectly. Whether you're just starting out or preparing for big exams, we've got you covered with flexible options.</p>
        <div className="inline-flex items-center p-1.5 bg-[#111111] rounded-full border border-white/10">
          <button className="px-6 py-2 bg-primary rounded-full text-sm font-medium text-white shadow-sm">Monthly</button>
          <button className="px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">Annually</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col">
          <div className="w-8 h-8 rounded-full border-4 border-gray-600 mb-6 flex items-center justify-center"><div className="w-2 h-2 bg-gray-600 rounded-full"></div></div>
          <h3 className="text-xl font-medium text-white">Basic</h3>
          <p className="text-gray-500 text-sm mb-6">Best for personal use.</p>
          <div className="text-5xl font-light text-white mb-8">Free</div>
          <button className="w-full py-3 rounded-full border border-gray-700 text-white font-medium hover:bg-white/5 transition-colors mb-8">Get Started</button>
          <div className="text-sm font-medium text-white mb-4">What you will get</div>
          <ul className="space-y-3">
            {["Basic note uploads", "PDF reading", "5 AI queries/day", "Standard text search"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-light"><CheckCircle2 className="w-4 h-4 text-gray-500" /> {item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-linear-to-b from-[#0e172e] to-[#040814] border border-[#2a3b7e] rounded-3xl p-8 flex flex-col shadow-[0_0_40px_-15px_rgba(92,85,249,0.3)] relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-full border-4 border-white mb-6 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
            <h3 className="text-xl font-medium text-white">Pro</h3>
            <p className="text-indigo-200/60 text-sm mb-6">For power learners & pros.</p>
            <div className="text-5xl font-light text-white mb-8 flex items-end gap-1">$12 <span className="text-base text-gray-400 font-normal mb-1">/ per month</span></div>
            <button className="w-full py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-colors mb-8">Get Started</button>
            <div className="text-sm font-medium text-white mb-4">What you will get</div>
            <ul className="space-y-3">
              {["Unlimited note uploads", "Advanced document parsing", "Unlimited AI chat", "Export chat logs"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-light"><CheckCircle2 className="w-4 h-4 text-gray-400" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
