/* eslint-disable no-unused-vars */

import * as Cookie from 'js-cookie';
import * as highlightjsBadge from 'highlightjs-badge';
import * as highlightjsLineNumbers from 'highlightjs-line-numbers.js';

import services from './services';
import site from './site';
import '../styles/main.scss';

// imports all experiments
import experiments from './experiments';

services.instantsearch.init();
services.lang.init();
services.rum.init();

// adding "Clients" to the window object so they can be accessed by other js inside Jekyll
window.Cookie = Cookie;
window.AnalyticsClient = services.AnalyticsClient; // because it only has static methods, AnalyticsClient is not instantiated
window.OptimizelyClient = new services.OptimizelyClient();
