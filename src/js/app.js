/**
  WARNING: Consider import & execution order carefully in the context of the
  browser & the dom when modifying file
 */
import * as Cookie from 'js-cookie';
import Prism from 'prismjs';

import services from './services';
import '../styles/main.scss';

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = services.AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new services.OptimizelyClient();

import site from './site';

// set to manual so we can start highlighting once DOM is ready
Prism.manual = true;

services.rum.init();

$(() => {
  services.instantsearch.init();
  services.progressbar.init();
  services.sectionShareButton.init();
  services.lang.init();
  site.toc.highlightTocOnScrollOnce();

  // import all experiments
  import(/* webpackPrefetch: true */ './experiments');

  Prism.highlightAll();
  // trackCopyCode service MUST be initialized after PrismJS is initialized
  services.trackCopyCode.init();
  services.trackExperimentEntry.init();
});
