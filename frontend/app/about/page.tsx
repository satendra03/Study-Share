"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { Hero } from "@/components/Hero";
import { TeamGrid } from "@/components/TeamGrid";
import { Footer } from "@/components/footer";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { Pricing } from "@/components/pricing";
import { FaqSection } from "@/components/FaqSection";
import { faqs } from "@/lib/data";
import { link } from "fs";

const teamMembers = [
  {
    id: 1,
    name: "Satendra K. Parteti",
    role: "Frontend Developer",
    link: "https://www.linkedin.com/in/connect-satendra/",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHhVq3jvCrcQA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732160847983?e=1776297600&v=beta&t=G97ODCbfkNWhVm7TntBdDZTljiwCg-GnsP1UJDGI00o"
  },
  {
    id: 2,
    name: "Shivam Devrani",
    role: "Backend Developer",
    link: "https://www.linkedin.com/in/shivam1121/",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQGuw4yvIXvMrw/profile-displayphoto-shrink_400_400/B4DZn9Ua8FGsAg-/0/1760891613531?e=1776297600&v=beta&t=jILnwMig_qZZDGGebpC52zS7fOF6zSM2-3o7RcYhnR0"
  },
  {
    id: 3,
    name: "Krish Gupta",
    role: "UI UX Designer",
    link: "https://www.linkedin.com/in/krish-gupta-65ba85250/",
    image: "https://media.licdn.com/dms/image/v2/D5603AQEj4Ypk6-Gd_Q/profile-displayphoto-shrink_400_400/B56ZTVHroMGsAY-/0/1738742348887?e=1776297600&v=beta&t=q8ZFojGqdOzxOM7d7EWkQxld2ri1R0GTLH9JDTDbxaQ"
  },
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
