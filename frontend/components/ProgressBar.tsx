'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 150,
  minimum: 0.08,
  easing: 'ease',
  speed: 400,
});

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement)?.closest('a');
      if (!element || !(element instanceof HTMLAnchorElement)) return;

      if (element.target === '_blank' || element.hasAttribute('download')) return;

      try {
        const url = new URL(element.href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      // Prevent starting when targeting same route
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      const targetUrl = `${element.pathname}${element.search}`;
      if (currentUrl === targetUrl) return;

      NProgress.start();
    };

    document.addEventListener('click', handleAnchorClick, true);

    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, []);

  useEffect(() => {
    // Complete progress when location changes (route transition done)
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 70);

    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  return null;
}

export function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}