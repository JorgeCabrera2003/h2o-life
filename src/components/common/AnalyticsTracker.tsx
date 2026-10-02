'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { analytics } from '@/lib/analytics';

export function AnalyticsTracker() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    // Registro de inicio de sesión o visita
    analytics.logEvent('app_session_started', 'system', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Medición de rendimiento (Web Vitals básicos)
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        analytics.logEvent('web_vitals_perf', 'system', {
          loadTimeMs: Math.round(navEntry.loadEventEnd - navEntry.startTime),
          domContentLoadedMs: Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime),
          ttfbMs: Math.round(navEntry.responseStart - navEntry.requestStart),
        });
      }
    }
  }, []);

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
