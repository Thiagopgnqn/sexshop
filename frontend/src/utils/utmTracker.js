/**
 * UTM & Attribution Tracker for Tienda Nocturna
 * Captures utm_source, utm_medium, and utm_campaign from first visit and stores in sessionStorage.
 * Adheres to first-touch attribution within session without storing personal data.
 */

const STORAGE_KEY = 'nocturna_utm_attribution';

export function captureUTM(searchString) {
  if (typeof window === 'undefined') return null;
  try {
    const rawSearch =
      typeof searchString === 'string' && searchString
        ? searchString
        : window.location.search;
    const params = new URLSearchParams(rawSearch);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');

    if (utm_source || utm_medium || utm_campaign) {
      const existing = sessionStorage.getItem(STORAGE_KEY);
      if (!existing) {
        const attribution = {
          utm_source: utm_source ? utm_source.slice(0, 100) : null,
          utm_medium: utm_medium ? utm_medium.slice(0, 100) : null,
          utm_campaign: utm_campaign ? utm_campaign.slice(0, 100) : null,
          capturedAt: new Date().toISOString(),
          landingUrl: window.location.pathname + window.location.search,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
        return attribution;
      }
    }
    const current = sessionStorage.getItem(STORAGE_KEY);
    return current ? JSON.parse(current) : null;
  } catch (e) {
    console.warn('Error capturando UTM:', e);
    return null;
  }
}

export function getStoredUTM() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      utm_source: parsed.utm_source || null,
      utm_medium: parsed.utm_medium || null,
      utm_campaign: parsed.utm_campaign || null,
    };
  } catch {
    return {};
  }
}

export function clearStoredUTM() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Error limpiando UTM:', err);
  }
}

// Auto-capture on initial script load if window is available
if (typeof window !== 'undefined') {
  try {
    captureUTM();
  } catch (err) {
    console.warn('Error en auto-capture UTM:', err);
  }
}
