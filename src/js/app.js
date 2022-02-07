/**
  WARNING: Consider import & execution order carefully in the context of the
  browser & the dom when modifying file
 */
import * as Cookie from 'js-cookie';
import Prism from 'prismjs';

import services from './services';
import '../styles/main.scss';
import { trackDarkModePreference, checkIfUsersPrint } from './site/main';

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = services.AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new services.OptimizelyClient();

import site from './site';

// set to manual so we can start highlighting once DOM is ready
Prism.manual = true;

services.rum.init();
// Temporary service to check if user dark mode preferences
trackDarkModePreference();
// Temporary service to check if users are printing a page
checkIfUsersPrint();

$(() => {
  services.instantsearch.init();
  services.progressbar.init();
  services.sectionShareButton.init();
  services.lang.init();

  // Boolean whether or not URL is in Guided Tour experiment
  const isGatedPath =
    ['/docs/', '/docs/2.0/'].includes(window.location.pathname) ||
    ['-preview/', 'view/2.0/'].includes(window.location.pathname.slice?.(-9)) ||
    /language-(javascript|python)/gm.test(window.location.pathname);
  if (!isGatedPath) {
    /** If URL is not in Guided Tour experiment, then we can attach eventListeners
     *  for highlighting the Table of Contents in the sidebar as user scrolls.
     *
     *  If URL is in Guided Tour experiment, then it must wait for experiment
     *  logic to complete before attaching eventListeners since the ToC is
     *  different in treatment vs control.
     */
    site.toc.highlightTocOnScrollOnce();
  }

  import(/* webpackPrefetch: true */ './experiments').then(
    ({ default: { languageGuides } = {} }) =>
      isGatedPath ? languageGuides() : null,
  ); // ensure languageGuides is loaded; // imports all experiments

  Prism.highlightAll();
});
