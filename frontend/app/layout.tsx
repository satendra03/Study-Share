import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { Navbar } from "@/src/components/Navbar";
import { AnalyticsProvider } from "@/src/components/AnalyticsProvider";
import TopLoader from "@/components/TopLoader";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Study Share — Collaborative Learning Platform",
  description: "Share, learn, and collaborate with AI assistance. Your modern platform for organized study, file management, and AI-powered conversations.",
  keywords: "study, collaboration, learning, AI, file sharing, education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <AuthProvider>
          <AnalyticsProvider>
            <Navbar />
            <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
              {children}
            </main>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
