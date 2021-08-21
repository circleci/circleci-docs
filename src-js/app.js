import * as Cookie from 'js-cookie';
import * as search from './instantsearch.js';
import * as lang from './lang.js'

const optimizely = require('@optimizely/optimizely-sdk');

window.Cookie = Cookie;
search.init();
lang.init();

var optimizelyClient = optimizely.createInstance({
  datafile: window.optimizelyDatafile,
});

optimizelyClient.onReady().then(() => {
  console.log("Optimizely Ready:):)", window.userData);
});