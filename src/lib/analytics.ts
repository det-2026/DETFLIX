declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const DEFAULT_GA_MEASUREMENT_ID = 'G-DETFLIX2026';

/**
 * Dynamically initializes Google Analytics (gtag.js) script with provided or default ID
 */
export function initGoogleAnalytics(measurementId: string = DEFAULT_GA_MEASUREMENT_ID) {
  if (typeof window === 'undefined') return;
  const id = measurementId?.trim() || DEFAULT_GA_MEASUREMENT_ID;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  const existingScript = document.getElementById('ga-gtag-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true });
    console.log(`[Google Analytics] Initialized with Measurement ID: ${id}`);
  } else {
    window.gtag('config', id, { send_page_view: true });
  }
}

/**
 * Sends custom event to Google Analytics
 */
export function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
