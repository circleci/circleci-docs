import * as Cookie from 'js-cookie';
import * as search from './instantsearch.js';

window.__dummy = '12345';

window.Cookie = Cookie;
search.init();