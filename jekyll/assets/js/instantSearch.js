// Instant search initialization
var search = instantsearch({
  appId: '06F2EYGKB6',
  apiKey: 'e80a0ac1e290d3b17ff1ea1692b94285', // search-only API Key; safe for front-end code
  indexName: 'documentation',
  routing: true
});

// initialize SearchBox
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    cssClasses: { 
      input: 'instantsearch-search'
    },
    placeholder: 'Search for products'
  })
);

// initialize hits widget
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: 'No results',
      item: '<a href="/docs/{{ url }}">{{ title }}</a>: {{ content }}'
    }
  })
);

search.start();
