import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./nprogress.css";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ProgressBar } from "@/components/ProgressBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthInitializer } from "@/components/AuthInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyShare",
  description: "Share and discover study materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
          integrity="sha512-42kB9yDlYiCEfx2xVwq0q7hT4uf26FUgSIZBK8uiaEnTdShXjwr8Ip1V4xGJMg3mHkUt9nNuTDxunHF0/EgxLQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <ProgressBar />
        <QueryProvider>
          <TooltipProvider>
            <AuthInitializer>
              {children}
              <Toaster />
            </AuthInitializer>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
