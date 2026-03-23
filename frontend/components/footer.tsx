import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 pt-24 pb-8 border-t border-white/5 bg-[#030303] overflow-hidden">
      {/* Subtle glow behind footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          {/* Brand & Newsletter */}
          <div className="flex flex-col lg:col-span-5">
            <div className="flex items-center gap-3 mb-8 cursor-pointer w-fit group">
              <div className="bg-white p-1.5 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="text-[#030303] w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">StudyShare</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light mb-8 max-w-sm">
              Manage, track, and grow your knowledge with ease. Built to empower every kind of student—beginners to pros alike.
            </p>
            
            {/* <div className="mt-2 max-w-sm">
              <h4 className="text-white text-sm font-medium mb-3">Subscribe to our newsletter</h4>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 pl-4 focus-within:border-primary/50 transition-colors shadow-inner">
                <input type="email" placeholder="student@university.edu" className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-gray-600 font-light" />
                <button className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full text-xs font-bold transition-colors">
                  Subscribe
                </button>
              </div>
            </div> */}
          </div>
          
          {/* Links Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:col-span-7 lg:pl-16 pt-2">
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-sm font-medium mb-2">Resources</h4>
              <Link href="/docs" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Docs</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-light">About Us</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Pricing</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Contact</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-sm font-medium mb-2">Legal</h4>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Privacy Policy</Link>
              <Link href="/term-of-service" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Terms of Service</Link>
              {/* <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-light">Cookie Policy</Link> */}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col border-t border-white/5 pt-12 pb-4">
          <div className="w-full flex items-center justify-center mb-8 overflow-hidden">
            <div className="text-[#0e121d] text-[clamp(4.5rem,15vw,14rem)] font-black leading-none tracking-tighter select-none pointer-events-none text-center">
              StudyShare
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 text-gray-600 text-xs font-medium">
            <p>© {new Date().getFullYear()} StudyShare Inc. All rights reserved.</p>
            <p>Crafted for Students</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
