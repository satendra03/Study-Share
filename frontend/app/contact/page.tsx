"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

import { ContactForm } from "@/components/ContactForm";
import { ContactInfo } from "@/components/ContactInfo";
import { Footer } from "@/components/footer";

const contactBlocks = [
  {
    title: "Email Address",
    value: "support@studyshare.com",
    subtext: "Assistance hours: Monday - Friday 6 am to 8 pm EST"
  },
  {
    title: "Number",
    value: "+1 (800) 555-0199",
    subtext: "Assistance hours: Monday - Friday 6 am to 8 pm EST"
  }
];

export default function ContactPage() {
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
        <LandingNavbar onSignIn={handleSignIn} />

        {/* Contact Form */}
        <ContactForm 
          badgeText="Connect with Us"
          title={<>Get in touch with us.<br/>We're here to assist you.</>}
          submitText="Leave us a message"
          onSubmit={(e) => {
             console.log("Contact submitted!");
          }}
        />
      </div>

      <ContactInfo 
         badgeText="Contact Info"
         title="We are always happy to assist you"
         blocks={contactBlocks}
      />

      <Footer />
    </main>
  );
}
