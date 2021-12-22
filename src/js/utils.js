import Cookies from 'js-cookie';

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

// Refreshes a given cookie (if set) with a new expiration date. If cookie is
// not already set, no action will be taken.
export function updateCookieExpiration(cookieName, newExpiration) {
  // Ensure cookie name is a non-empty string. If no cookie name is given,
  // js-cookie will return ALL cookies on the subsequent `get()` call.
  if (typeof cookieName !== 'string' || cookieName.length < 1) {
    return;
  }

  var existingValue = Cookies.get(cookieName);

  // Return early if cookie is not set
  if (existingValue === undefined) {
    return;
  }

  // Re-set cookie with same values and new expiration date
  Cookies.set(cookieName, existingValue, { expires: newExpiration });
}

// change date into how long ago that date is relative to when view page
export function dateHowLongAgo(date) {
  function render(n, unit) {
    return n + ' ' + unit + (n === 1 ? '' : 's') + ' ago';
  }

  let seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / (60 * 60 * 24 * 365));
  if (interval >= 1) {
    return '+1 year ago';
  }
  interval = Math.floor(seconds / (60 * 60 * 24 * 30));
  if (interval >= 1) {
    return render(interval, 'month');
  }
  interval = Math.floor(seconds / (60 * 60 * 24));
  if (interval >= 1) {
    return render(interval, 'day');
  }
  interval = Math.floor(seconds / (60 * 60));
  if (interval >= 1) {
    return render(interval, 'hour');
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return render(interval, 'minute');
  }
  interval = Math.floor(seconds);
  return render(interval, 'second');
}
