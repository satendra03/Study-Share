/**
 * Analytics utility — wraps Firebase Analytics with safe SSR guards.
 * All functions are no-ops on the server or when measurementId is missing.
 *
 * Usage:
 *   import { trackEvent } from '@/src/lib/analytics';
 *   trackEvent('file_upload', { file_type: 'pdf' });
 */

import { getFirebaseAnalytics } from './firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// ── Page Views ──────────────────────────────────────────────────────────────
export function trackPageView(path: string) {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;
    logEvent(analytics, 'page_view', { page_path: path });
}

// ── Generic Event ────────────────────────────────────────────────────────────
export function trackEvent(eventName: string, params?: Record<string, any>) {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;
    logEvent(analytics, eventName, params);
}

// ── User Identity ────────────────────────────────────────────────────────────
export function identifyUser(userId: string, name?: string) {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;
    setUserId(analytics, userId);
    if (name) setUserProperties(analytics, { display_name: name });
}

export function clearUser() {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;
    setUserId(analytics, '');
}

// ── Pre-defined Events (type-safe, named constants) ──────────────────────────
export const AnalyticsEvents = {
    // Auth
    LOGIN: 'login',
    LOGOUT: 'logout',

    // Files
    FILE_UPLOAD: 'file_upload',
    FILE_DELETE: 'file_delete',
    FILE_DOWNLOAD: 'file_download',

    // Chatbot
    CHAT_SESSION_CREATE: 'chat_session_create',
    CHAT_SESSION_DELETE: 'chat_session_delete',
    CHAT_MESSAGE_SEND: 'chat_message_send',

    // Landing
    CTA_CLICK: 'cta_click',
} as const;
