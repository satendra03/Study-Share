import { ArrowRight } from "lucide-react";
import { FormEvent, ReactNode } from "react";

export interface ContactFormProps {
  badgeText: string;
  title: ReactNode;
  submitText: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

export function ContactForm({ badgeText, title, submitText, onSubmit }: ContactFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
      <div className="mb-20">
        <p className="text-gray-300 text-lg mb-6">{badgeText}</p>
        <h1 className="text-5xl md:text-[4.5rem] font-normal tracking-tight text-white max-w-4xl leading-[1.05]">
          {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="relative">
            <input type="text" id="name" required placeholder="Your Name" className="w-full bg-transparent border-b border-gray-700 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-500" />
          </div>
          <div className="relative">
            <input type="email" id="email" required placeholder="Email Address" className="w-full bg-transparent border-b border-gray-700 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-500" />
          </div>
          <div className="relative">
            <input type="tel" id="phone" placeholder="Phone Number (optional)" className="w-full bg-transparent border-b border-gray-700 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-500" />
          </div>
        </div>

        <div className="relative">
          <textarea id="message" required placeholder="Message" rows={1} className="w-full bg-transparent border-b border-gray-700 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-500 resize-none min-h-[40px] overflow-hidden"></textarea>
        </div>

        <div>
          <button type="submit" className="inline-flex items-center gap-3 bg-[#423ee0] hover:bg-[#5853ff] text-white px-7 py-3.5 rounded-full font-medium transition-colors text-sm shadow-md cursor-pointer">
            {submitText} <div className="bg-white/20 rounded-full p-0.5 flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} /></div>
          </button>
        </div>
      </form>
    </section>
  );
}
