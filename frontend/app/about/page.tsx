"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { Hero } from "@/components/Hero";
import { TeamGrid } from "@/components/TeamGrid";
import { Footer } from "@/components/footer";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { Pricing } from "@/components/pricing";
import { FaqSection } from "@/components/FaqSection";
import { faqs } from "@/lib/data";

const teamMembers = [
  {
    id: 1,
    name: "Emma Brooks",
    role: "Content Creator",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Ethan Collins",
    role: "Frontend Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Ryan Mitchell",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  // {
  //   id: 4,
  //   name: "Sarah Jenkins",
  //   role: "UX Researcher",
  //   image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  // },
  // {
  //   id: 5,
  //   name: "David Chen",
  //   role: "Backend Engineer",
  //   image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  // },
  // {
  //   id: 6,
  //   name: "Jessica Park",
  //   role: "Marketing Lead",
  //   image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  // }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30">
      <div className="relative w-full overflow-hidden pb-12">
        {/* Background Grid strictly for Hero */}
        <div className="absolute top-0 left-0 z-0 h-175 w-full pointer-events-auto bg-[#030303]">
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

        {/* Hero Section */}
        <Hero 
          badgeText="New Version Available Now"
          title={<>Where Learning Meets <span className="text-gray-300">Innovation</span></>}
          description="We combine cutting-edge technology with educational expertise to make managing knowledge effortless, secure, and smart. Our mission is to empower you with tools that turn every study session into an opportunity."
          // primaryActionText=""
          // onPrimaryAction={handleSignIn}
        />
      </div>

      {/* Team Grid */}
      <TeamGrid 
        title="Our Team"
        description="Start strong, stay informed, and grow with confidence. We make managing knowledge effortless with a smart, guided process."
        members={teamMembers}
      />

      {/* Pricing */}
      <Pricing />

      {/* FAQs */}
      <FaqSection 
        title="Have Questions About Our Platform? Explore Answers to Your Most Common Concerns"
        description="Find quick solutions to common queries and learn more about how our learning platform works."
        items={faqs}
        contactText="My question is not here."
        contactActionLabel="Contact Us"
        onContactAction={() => console.log('Contact Us')}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
