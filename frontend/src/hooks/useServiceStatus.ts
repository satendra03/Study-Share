import { useState, useEffect, useCallback } from 'react';

export type ServiceStatus = 'checking' | 'online' | 'offline';

const HEALTH_URL = "http://localhost:5000/health";
    // (process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000') + '/health';

const POLL_INTERVAL_MS = 30_000; // re-check every 30 s once online
const RETRY_INTERVAL_MS = 5_000; // retry every 5 s when offline

export function useServiceStatus() {
    const [status, setStatus] = useState<ServiceStatus>('checking');
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const check = useCallback(async () => {
        try {
            const res = await fetch(HEALTH_URL, {
                method: 'GET',
                // Short timeout so we don't wait forever if the server is truly down
                signal: AbortSignal.timeout(4000),
            });
            setStatus(res.ok ? 'online' : 'offline');
        } catch {
            setStatus('offline');
        } finally {
            setLastChecked(new Date());
        }
    }, []);

    useEffect(() => {
        check();
    }, [check]);

    // Poll: fast when offline, slow when online
    useEffect(() => {
        const interval = setInterval(check, status === 'offline' ? RETRY_INTERVAL_MS : POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [check, status]);

    return { status, lastChecked, retry: check };
}
