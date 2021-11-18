export function isProduction() {
  return window.location.origin === 'https://circleci.com';
}

export function isUnsupportedBrowser() {
  if (typeof window === 'undefined') return true;
  const ua = window?.navigator?.userAgent;
  const msie = ua.indexOf('MSIE ');
  return msie > 0;
}

/**
 * checks if an item is in the viewport
 * shamelessly borrowed from https://stackoverflow.com/a/7557433
 * */
export function isElementInViewport(el) {
  if (!(el instanceof HTMLElement)) {
    return false;
  }

  // Special bonus for those using jQuery
  if (typeof jQuery === 'function' && el instanceof jQuery) {
    el = el[0];
  }
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
