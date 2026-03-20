'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/src/lib/analytics';

/**
 * Drop this inside RootLayout (as a child of AuthProvider).
 * It auto-fires a `page_view` event to Firebase Analytics on every route change.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        trackPageView(pathname);
    }, [pathname]);

    return <>{children}</>;
}
