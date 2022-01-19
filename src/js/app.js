/**
  WARNING: Consider import & execution order carefully in the context of the
  browser & the dom when modifying file
 */
import * as Cookie from 'js-cookie';
import 'highlightjs-badge';

import services from './services';
import '../styles/main.scss';
import { trackDarkModePreference, checkIfUsersPrint } from './site/main';

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = services.AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new services.OptimizelyClient();

import site from './site';

services.rum.init();
// Temporary service to check if user dark mode preferences
trackDarkModePreference();
// Temporary service to check if users are printing a page
checkIfUsersPrint();

$(() => {
  services.instantsearch.init();
  services.highlightjsBadge.init();
  services.progressbar.init();

  const isGatedPath =
    ['/docs/', '/docs/2.0/'].includes(window.location.pathname) ||
    ['-preview/', 'view/2.0/'].includes(window.location.pathname.slice?.(-9)) ||
    /language-(javascript|python)/gm.test(window.location.pathname);
  if (!isGatedPath) {
    site.toc.highlightTocOnScrollOnce();
  }

  import(/* webpackPrefetch: true */ './experiments').then(
    ({ default: { languageGuides } = {} }) =>
      isGatedPath ? languageGuides() : null,
  ); // ensure languageGuides is loaded; // imports all experiments
});
