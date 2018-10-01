import * as debounce from 'lodash.debounce';

// Instant search initialization
export function init () {
  var search = instantsearch({
    appId: 'U0RXNGRK45',
    apiKey: 'dd49f5b81d238d474b49645a4daed322', // search-only API Key; safe for front-end code
    indexName: 'documentation',
    routing: true
  });

  // adding conditions to filter search
  search.addWidget(
    instantsearch.widgets.configure({
      filters: "collection: cci2" 
    })
  );

  // initialize SearchBox
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      cssClasses: {
        input: 'instantsearch-search'
      },
      placeholder: 'Search Documentation',
      queryHook: debounce(function (query, searchFunction) { searchFunction(query); }, 500, { 'leading': true, 'trailing': true }) // method to throttle search requests
    })
  );

  // initialize SearchBox
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#mobile-search-box',
      cssClasses: {
        input: 'instantsearch-search'
      },
      placeholder: 'Search Documentation'
    })
  );

  // initialize hits widget
  search.addWidget(
    instantsearch.widgets.hits({
      container: '#instant-hits',
      templates: {
        empty: 'No results',
        item: '<a href="/docs{{ url }}"><div class="result-item-wrap"><strong>{{ title }}</strong><br><p>{{ content }}</p></div>'
      }
    })
  );

  search.start();

  (function () {
    // insert search results
    var searchResetButton = document.querySelector("#search-box .ais-search-box--reset");
    var searchBox = document.querySelector("input.instantsearch-search");
    var template = document.querySelector("#hits-template");
    var resultContainer = document.querySelector('.main-body');
    var resultDisplay = document.querySelector('.main-body');
    var stateHolder = resultDisplay.cloneNode(true);

    var renderResults = function (e) {
      resultDisplay.innerHTML = "";
      if (searchBox.value.length > 0) {
        template.querySelector('#search-term-display').innerHTML = searchBox.value;
        var results = template.cloneNode(true);

        resultDisplay.appendChild(results);
      } else {
        resultDisplay.appendChild(stateHolder);
      }
    };

    searchBox.addEventListener('keyup', renderResults);
    window.addEventListener('load', renderResults);
    searchResetButton.addEventListener('click', function () {
      resultDisplay.innerHTML = "";
      resultDisplay.appendChild(stateHolder);
    });
  }());
};