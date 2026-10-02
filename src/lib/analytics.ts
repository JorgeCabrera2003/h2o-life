/**
 * H2O Life Telemetry & Analytics Module
 * Compatible with Google Analytics 4 (GA4) and internal offline event logging.
 */

export interface TelemetryEvent {
  id: string;
  name: string;
  category: 'pos' | 'cart' | 'client' | 'tank' | 'closure' | 'navigation' | 'system';
  properties?: Record<string, unknown>;
  timestamp: string;
}

const STORAGE_KEY = 'h2o_telemetry_events_v1';
const MAX_LOGGED_EVENTS = 150;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

class AnalyticsService {
  private isClient = typeof window !== 'undefined';

  /**
   * Log an event both locally and to Google Analytics (if configured)
   */
  public logEvent(
    name: string,
    category: TelemetryEvent['category'],
    properties?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const event: TelemetryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      category,
      properties,
      timestamp,
    };

    // 1. Google Analytics 4 tracking
    if (this.isClient && typeof window.gtag === 'function') {
      window.gtag('event', name, {
        event_category: category,
        ...properties,
      });
    }

    // 2. Local telemetry buffer for offline auditing
    if (this.isClient) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list: TelemetryEvent[] = stored ? JSON.parse(stored) : [];
        list.unshift(event);
        if (list.length > MAX_LOGGED_EVENTS) {
          list.length = MAX_LOGGED_EVENTS;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Analytics local storage warning:', e);
      }
    }
  }

  /**
   * Retrieve recent telemetry events
   */
  public getStoredEvents(): TelemetryEvent[] {
    if (!this.isClient) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear local telemetry log
   */
  public clearEvents(): void {
    if (this.isClient) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const analytics = new AnalyticsService();
