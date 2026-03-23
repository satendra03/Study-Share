"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, BookOpen, Layers, Search, MessageSquare, Shield, Clock, HelpCircle, FileText } from "lucide-react";
import Link from "next/link";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { testimonials, faqs } from "@/lib/data";

import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { Steps } from "@/components/Steps";
import { FeatureGrid } from "@/components/FeatureGrid";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";
import { LandingNavbar } from "@/components/LandingNavbar";

export default function LandingPage() {
  const { firebaseUser, appUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser && appUser?.isProfileComplete) {
      router.push("/dashboard");
    }
  }, [loading, firebaseUser, appUser, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30">
      {/* Hero Wrapper with Animated Grid Background */}
      <div className="relative w-full overflow-hidden">
        {/* Background Grid strictly for Hero with Fade-in Animation */}
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
        <LandingNavbar onSignIn={handleSignIn} />

        {/* Hero Section */}
        <Hero 
          badgeText="AI-Driven Learning Clarity"
          title={<>Learning moves smarter <span className="text-gray-300">with you</span></>}
          description="Manage, track, and grow your knowledge with ease. Whether you're studying, researching, or coding, we've got you covered. Built to empower every kind of student."
          primaryActionText="Get Started"
          onPrimaryAction={handleSignIn}
          trustMetrics={{
            amount: "20K+",
            text: "Trusted Students",
            avatars: [
              "https://i.pravatar.cc/100?img=33",
              "https://i.pravatar.cc/100?img=47",
              "https://i.pravatar.cc/100?img=12"
            ]
          }}
          logos={[
            <div key="google" className="text-2xl font-bold flex items-center gap-2">Google</div>,
            <div key="microsoft" className="text-xl font-bold tracking-tight">Microsoft</div>,
            <div key="stanford" className="text-xl font-extrabold tracking-tighter">STANFORD</div>,
            <div key="harvard" className="text-xl font-semibold">Harvard</div>,
            <div key="mit" className="text-xl font-bold flex items-center gap-1">MIT <span className="text-sm font-light">Press</span></div>
          ]}
        />
      </div>

      {/* Features Section */}
      <FeatureCards 
        title={<>Transform Your Studies with Smart, Seamless, and AI-Powered Tools</>}
        description="Harness the power of AI to analyze your notes, track progress, and uncover growth opportunities. We simplify complex data so you can make clear, confident learning choices."
        cards={[
          {
            title: "Instant Doc Upload",
            description: "Upload long PDFs and let our background worker extract the data.",
            visual: (
              <div className="mt-auto bg-[#1a1c29] border border-gray-800 rounded-2xl h-56 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl w-[85%] shadow-lg backdrop-blur-sm transform -translate-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-indigo-500/20 p-1.5 rounded flex items-center justify-center"><Zap className="w-3 h-3 text-indigo-400 fill-indigo-400/50" /></div>
                    <div className="text-[11px] font-semibold tracking-wide text-gray-200 uppercase">Processing</div>
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="h-1.5 w-[90%] bg-gray-600/50 rounded-full"></div>
                    <div className="h-1.5 w-[75%] bg-gray-600/50 rounded-full"></div>
                    <div className="h-1.5 w-[85%] bg-gray-600/50 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded shadow">1.2s</div>
              </div>
            )
          },
          {
            title: "Context-Aware AI Chat",
            description: "Don't just read—converse. Ask questions and get answers extracted directly from materials.",
            visual: (
              <div className="mt-auto bg-[#1a1c29] border border-gray-800 rounded-2xl h-56 relative overflow-hidden flex flex-col p-5 shadow-inner">
                <div className="flex flex-col gap-3 w-full mt-auto mb-4">
                  <div className="bg-gray-800/80 border border-gray-700 rounded-xl rounded-tr-sm px-3 py-2.5 w-[70%] self-end">
                    <div className="flex space-x-1.5 justify-end items-center opacity-70">
                      <div className="h-1 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-1 w-8 bg-gray-400 rounded-full"></div>
                      <div className="h-1 w-4 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl rounded-tl-sm px-3 py-2.5 w-[85%]">
                    <div className="space-y-1.5 opacity-80">
                      <div className="h-1 w-full bg-indigo-300 rounded-full"></div>
                      <div className="h-1 w-full bg-indigo-300 rounded-full"></div>
                      <div className="h-1 w-2/3 bg-indigo-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-4 bottom-4 bg-[#0a0c16] border border-gray-700 rounded-lg p-2.5 flex items-center justify-between text-xs text-gray-500 shadow-xl">
                  Ask anything...
                  <div className="bg-[#5C55F9] p-1 rounded aspect-square flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Code Sandbox",
            description: "Write, test, and execute Python and JavaScript code right in your browser next to your notes.",
            className: "bg-linear-to-br from-[#0c1328] to-[#040814] border-[#1a2342] relative overflow-hidden",
            visual: (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="inline-flex items-center gap-1.5 w-fit bg-white/5 text-white/90 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider font-semibold px-4 py-1.5 rounded-full mb-12">
                  <Layers className="w-3.5 h-3.5" /> No Setup Required
                </div>
                <div className="mt-auto relative z-10">
                  <div className="text-6xl md:text-7xl font-extralight text-white mb-4 font-mono tracking-tighter opacity-90">{`</>`}</div>
                </div>
              </>
            )
          }
        ]}
      />

      {/* Steps Section */}
      <Steps 
        title="Your Learning Journey, Simplified in 3 Steps"
        description="Harness the power of AI to analyze your materials, track progress, and uncover growth opportunities. We simplify complex data so you can make clear, confident decisions."
        steps={[
          { title: "Upload Materials", description: "Link your notes, papers, and PDFs securely to get a full knowledge picture.", icon: <BookOpen className="w-7 h-7 text-gray-300/80" strokeWidth={1.5} /> },
          { title: "Get Smart Insights", description: "Our AI breaks down your documents and surfaces what matters—so you can focus on learning.", icon: <Search className="w-7 h-7 text-gray-300/80" strokeWidth={1.5} /> },
          { title: "Take Action", description: "Chat with your documents seamlessly to extract insights and clarify concepts.", icon: <Zap className="w-7 h-7 text-gray-300/80" strokeWidth={1.5} /> },
        ]}
      />

      {/* Feature Grid Section */}
      <FeatureGrid 
        title="Powering Your Learning Future"
        description="Explore the key features designed to simplify, secure, and supercharge your study journey."
        features={[
          { icon: <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Secure Access", desc: "Your data is protected with cutting-edge encryption and secure authentication." },
          { icon: <Clock className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Instant Access", desc: "Get to your reading materials instantly, anytime, anywhere—no delays, no hassle." },
          { icon: <Search className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Smart Search", desc: "Instantly pinpoint the exact paragraphs and topics you need across all your files." },
          { icon: <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Easy Organization", desc: "Track your tasks effortlessly and stay on top of your study goals with AI assistance." },
          { icon: <FileText className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Flexible Materials", desc: "Access notes tailored to your courses with complete syllabus coverage." },
          { icon: <HelpCircle className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "24/7 AI Support", desc: "Our AI tutor is here to help you anytime, ensuring peace of mind and 24/7 assistance." }
        ]}
      />

      {/* Pricing Section */}
      <Pricing />

      {/* Testimonials */}
      <TestimonialsSection 
        title="What Our Students Say"
        items={testimonials}
      />

      {/* FAQ Section */}
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
