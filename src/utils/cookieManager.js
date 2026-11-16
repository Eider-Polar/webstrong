const COOKIE_STORAGE_KEY = 'stronggym_cookie_consent_v1';

export const setBrowserCookie = (name, value, days = 180) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

export const deleteBrowserCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export const getBrowserCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

export const getCookieConsent = () => {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const applyCookiePreferences = ({ decision, preferences, analytics }) => {
  // 1. Cookie técnica obligatoria (guarda el estado del consentimiento en document.cookie)
  setBrowserCookie('stronggym_consent', decision, 365);

  // 2. Cookies de Preferencias (si las acepta, guarda tema/idioma/filtros; si las rechaza, las borra)
  if (preferences) {
    setBrowserCookie('stronggym_pref_theme', 'light', 180);
    setBrowserCookie('stronggym_pref_currency', 'COP', 180);
  } else {
    deleteBrowserCookie('stronggym_pref_theme');
    deleteBrowserCookie('stronggym_pref_currency');
    deleteBrowserCookie('stronggym_last_category');
  }

  // 3. Cookies Analíticas (si las acepta, genera un ID de sesión anónimo y cuenta páginas; si las rechaza, las elimina)
  if (analytics) {
    let sid = getBrowserCookie('stronggym_analytics_sid');
    if (!sid) {
      sid = 'sg_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    }
    const views = parseInt(getBrowserCookie('stronggym_page_views') || '0', 10) + 1;
    setBrowserCookie('stronggym_analytics_sid', sid, 90);
    setBrowserCookie('stronggym_page_views', String(views), 90);
  } else {
    deleteBrowserCookie('stronggym_analytics_sid');
    deleteBrowserCookie('stronggym_page_views');
  }
};
