import * as debounce from 'lodash.debounce';

const formatResultSnippet = (snippet) => {
  const titleTag = `<strong>${snippet.title.value}</strong>`;
  const contextTag = snippet.headings ?
    `<p class="context">${snippet.headings.map(h => h.value).join(' > ')}</p>` : '';
  const contentTag = `<p class="content">${snippet.content.value}</p>`;
  return `<div class="result-item-wrap">${titleTag + contextTag + contentTag}</div>`;
}

// Instant search initialization
export function init () {
  var search = instantsearch({
    appId: 'U0RXNGRK45',
    apiKey: 'dd49f5b81d238d474b49645a4daed322', // search-only API Key; safe for front-end code
    indexName: 'documentation',
    routing: true,
    searchParameters: { hitsPerPage: 25 }
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
      queryHook: debounce(function (query, searchFunction) { searchFunction(query); setTimeout(renderResults, 100); }, 500, { 'leading': true, 'trailing': true, 'maxWait': 1000 }) // method to throttle search requests
    })
  );

  // initialize hits widget
  search.addWidget(
    instantsearch.widgets.hits({
      container: '#instant-hits',
      escapeHits: true,
      templates: {
        empty: 'No results',
        item: (item) => {
          let url = item.url;
          if (item.anchor) {
            url += `#${item.anchor}`;
          }
          return `<a href="/docs${url}">${formatResultSnippet(item._snippetResult)}</a>`;
        }
      }
    })
  );

  search.start();

  // insert search results
  var searchResetButton = document.querySelector("#search-box .ais-search-box--reset");
  var searchBox = document.querySelector("input.instantsearch-search");
  var template = document.querySelector("#hits-template");
  var pageBody = document.querySelector('.main-body');
  var resultDisplay = document.querySelector('.hits-target');
  var stateHolder = resultDisplay.cloneNode(true);
  var form = document.querySelector('.main-searchbar form');

  function renderResults (e) {
    resultDisplay.innerHTML = "";
    if (searchBox.value.length > 0) {
      template.querySelector('#search-term-display').innerHTML = searchBox.value;
      var results = template.cloneNode(true);

      resultDisplay.appendChild(results);
      window.scrollTo(0, 0);

      pageBody.style.display = "none";
      resultDisplay.style.display = "block";
    } else {
      resultDisplay.appendChild(stateHolder);

      pageBody.style.display = "flex";
      resultDisplay.style.display = "none";
    }
  };

  searchBox.addEventListener('keyup', renderResults);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    renderResults();
  });

  window.addEventListener('load', renderResults);
  searchResetButton.addEventListener('click', function () {
    setTimeout(function () {
      renderResults();
    }, 100);
  });
};
