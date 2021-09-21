import * as Cookie from 'js-cookie';
import * as search from './instantsearch.js';
import * as lang from './lang.js'
import OptimizelyClient from './optimizely.js';
import AnalyticsClient from "./analytics.js";
import * as highlightjsBadge from 'highlightjs-badge';

// site files
import './user.js';
import './sidebar.js';
import './nav.js';
import './main.js';
import './hljs-config.js'

// imports all experiments
import * as Experiments from './experiments';

// imported but not used just so webpack picks it up and add it to the `app.bundle.js`
import * as highlightJSBadge from 'highlightjs-badge';

search.init();
lang.init();

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new OptimizelyClient();
