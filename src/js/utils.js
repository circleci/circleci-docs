export function isProduction() {
  return window.location.origin === 'https://circleci.com';
}

export function isUnsupportedBrowser() {
  if (typeof window === 'undefined') return true;
  const ua = window?.navigator?.userAgent;
  const msie = ua.indexOf('MSIE ');
  return msie > 0;
}
