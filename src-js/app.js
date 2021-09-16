import * as Cookie from 'js-cookie';
import * as search from './instantsearch.js';
import * as lang from './lang.js'
import OptimizelyClient from './optimizely.js';
import AnalyticsClient from "./analytics.js";

 // imported but not used just so webpack picks it up and add it to the `app.bundle.js`
import * as highlightJSBadge from 'highlightjs-badge';

search.init();
lang.init();

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new OptimizelyClient();