"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/FaqSection";
import { faqs } from "@/lib/data";

export default function PricingPage() {
  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30">
      <div className="relative w-full overflow-hidden pb-12">
        {/* Background Grid strictly for Hero/Nav Area */}
        <div className="absolute top-0 left-0 z-0 h-[700px] w-full pointer-events-auto bg-[#030303]">
          <InteractiveGridPattern
            className="absolute inset-0 h-full w-full opacity-35 mix-blend-screen animate-in fade-in duration-1500 ease-in-out"
            width={60}
            height={60}
            squares={[40, 40]}
            squaresClassName="hover:fill-indigo-500/40 transition-colors duration-500 ease-in-out"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,85,249,0.15),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-t from-[#030303] via-[#030303]/80 to-transparent pointer-events-none" />
        </div>

        {/* Navbar */}
        <LandingNavbar />

        {/* Pricing Component (Acts as Hero here) */}
        <Pricing noBorderTop={true} />
      </div>

      <FaqSection 
        title="Have Questions About Our Platform? Explore Answers to Your Most Common Concerns"
        description="Find quick solutions to common queries and learn more about how our learning platform works."
        items={faqs}
        contactText="My question is not here."
        contactActionLabel="Contact Us"
        onContactAction={() => window.location.href = '#'}
      />
      
      <Footer />
    </main>
  );
    }