import * as Cookie from 'js-cookie';
import * as search from './instantsearch.js';
import * as lang from './lang.js'
import OptimizelyClient from './optimizelyClient.js';
import * as highlightJSBadge from 'highlightjs-badge';

window.Cookie = Cookie;
search.init();
lang.init();

window.OptimizelyClient = new OptimizelyClient();