"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Zap, Shield } from "lucide-react";

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
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-indigo-400 w-6 h-6" />
          <span className="text-xl font-bold text-white">StudyShare</span>
        </div>
        <Button onClick={handleSignIn} variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-950">
          Sign In
        </Button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
            Share Knowledge,<br />
            <span className="text-indigo-400">Ace Together</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Upload notes, PYQs, and materials. Chat with documents using AI. Run code in the sandbox.
          </p>
          <Button onClick={handleSignIn} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-base">
            Get Started with Google
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-16 max-w-5xl mx-auto w-full">
        {[
          { icon: <BookOpen />, title: "Materials", desc: "Browse PYQs, notes, and more by branch & semester" },
          { icon: <Zap />, title: "AI Chat", desc: "Ask questions about any document using AI" },
          { icon: <Shield />, title: "Code Sandbox", desc: "Run Python, JS and more right in the browser" },
          { icon: <Users />, title: "Community", desc: "Students and teachers sharing knowledge together" },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-indigo-400 mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
