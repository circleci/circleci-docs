/* eslint-disable no-unused-vars */

import * as Cookie from 'js-cookie';
import * as highlightjsBadge from 'highlightjs-badge';
// site files
import OptimizelyClient from './services/optimizely.js';
import AnalyticsClient from './services/analytics.js';
import * as search from './services/instantsearch.js';
import * as lang from './services/lang.js';
import * as Site from './site';

// imports all experiments
import * as Experiments from './experiments';

search.init();
lang.init();

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new OptimizelyClient();
