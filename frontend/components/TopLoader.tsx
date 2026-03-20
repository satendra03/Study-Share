"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Override default nprogress styles
const NPROGRESS_OVERRIDE = `
  #nprogress .bar {
    background: linear-gradient(to right, #4f46e5, #818cf8) !important;
    height: 3px !important;
    box-shadow: 0 0 8px rgba(79, 70, 229, 0.6) !important;
  }
  #nprogress .peg {
    box-shadow: 0 0 10px #4f46e5, 0 0 5px #4f46e5 !important;
  }
  #nprogress .spinner {
    display: none !important;
  }
`;

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.08 });

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Finish on route change
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Start on internal link click
  useEffect(() => {
    // use the DOM MouseEvent since we're listening on document directly
    const handleClick = (e: MouseEvent) => {
      // e.target is typed as EventTarget, which doesn't have `closest`.
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !anchor.target &&
        !anchor.download;

      if (isInternal && href !== pathname) {
        NProgress.start();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return <style>{NPROGRESS_OVERRIDE}</style>;
}