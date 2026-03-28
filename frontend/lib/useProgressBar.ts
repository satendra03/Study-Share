import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NProgress from 'nprogress';

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: 'ease',
  speed: 500,
});

export function useProgressBar() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleStart = () => {
      // Clear any existing timeout
      clearTimeout(timeout);
      NProgress.start();
    };

    const handleComplete = () => {
      // Add a small delay to prevent flickering on fast transitions
      timeout = setTimeout(() => {
        NProgress.done();
      }, 100);
    };

    // Listen to router events
    const handleRouteChangeStart = () => handleStart();
    const handleRouteChangeComplete = () => handleComplete();
    const handleRouteChangeError = () => handleComplete();

    // Since Next.js 13+ App Router doesn't expose router events directly,
    // we'll use a different approach with navigation events
    // For now, we'll handle this in the Link component

    return () => {
      clearTimeout(timeout);
    };
  }, [router]);

  return {
    start: () => NProgress.start(),
    done: () => NProgress.done(),
    inc: (amount?: number) => NProgress.inc(amount),
  };
}