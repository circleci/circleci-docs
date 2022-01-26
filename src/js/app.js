/**
  WARNING: Consider import & execution order carefully in the context of the
  browser & the dom when modifying file
 */
import * as Cookie from 'js-cookie';
//import 'highlightjs-badge';

import services from './services';
import '../styles/main.scss';

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = services.AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new services.OptimizelyClient();

import './site';

services.lang.init();
services.rum.init();

$(() => {
  services.instantsearch.init();
  //services.highlightjsBadge.init();
  services.progressbar.init();
  import(/* webpackPrefetch: true */ './experiments'); // imports all experiments
});
