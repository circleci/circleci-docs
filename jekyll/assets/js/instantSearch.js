// Instant search initialization
var search = instantsearch({
  appId: '06F2EYGKB6',
  apiKey: 'e80a0ac1e290d3b17ff1ea1692b94285', // search-only API Key; safe for front-end code
  indexName: 'documentation',
  routing: true
});

search.start();
