import * as debounce from 'lodash.debounce';
import * as get from 'lodash.get';

const ALGOLIA_APP_ID     = window.circleJsConfig.algolia.appId;
const ALGOLIA_API_KEY    = window.circleJsConfig.algolia.apiKey;
const ALGOLIA_INDEX_NAME = window.circleJsConfig.algolia.indexName;
const ALGOLIA_COLLECTION = ((lang) => {
  // Page language is default language or missing, use default collection
  if (typeof lang !== 'string' || lang === 'en') {
    return 'cci2';
  } else {
    return `cci2_${lang}`;
  }
})(get(window.circleJsConfig, 'page.lang'));

const formatResultSnippet = (snippet) => {
  const title = get(snippet, ['title', 'value'], '(untitled)');
  const content = get(snippet, ['content', 'value'], '');
  const titleTag = `<strong>${title}</strong>`;
  const contextTag = snippet.headings ?
    `<p class="context">${snippet.headings.map(h => h.value).join(' > ')}</p>` : '';
  const contentTag = `<p class="content">${content}</p>`;
  return `<div class="result-item-wrap">${titleTag + contextTag + contentTag}</div>`;
}

// Instant search initialization
export function init () {
  var search = instantsearch({
    appId:     ALGOLIA_APP_ID,
    apiKey:    ALGOLIA_API_KEY,
    indexName: ALGOLIA_INDEX_NAME,
    routing: true,
    searchParameters: { hitsPerPage: 25 },
    searchFunction: function(helper) {
      // don't run search for blank query, including on initial page load
      // https://stackoverflow.com/a/42321947
      if (helper.state.query === '') {
        return;
      }
      helper.search();
    }
  });

  // adding conditions to filter search
  search.addWidget(
    instantsearch.widgets.configure({
      filters: `collection: ${ALGOLIA_COLLECTION}`
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
      autofocus: false,
      queryHook: debounce(function (query, searchFunction) {
          searchFunction(query);
          setTimeout(renderResults, 100);
        },
        500,
       { 'leading': true, 'trailing': true, 'maxWait': 1000 }
      ) // method to throttle search requests
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
      template.querySelector('#search-term-display').innerText = searchBox.value;
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
