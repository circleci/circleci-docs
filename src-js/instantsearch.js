import * as get from 'lodash.get';

const PAGE_LANG = get(window.circleJsConfig, 'page.lang', 'en');
const PAGE_LANG_URL_PREFIX = ((lang) => {
  if (lang === 'en') {
    return ""
  } else {
    return `/${lang}`
  }
})(PAGE_LANG);

const CIMG_BASE_URL = `${window.circleJsConfig.url.devhub}${PAGE_LANG_URL_PREFIX}/images/image`;

const ALGOLIA_APP_ID     = window.circleJsConfig.algolia.appId;
const ALGOLIA_API_KEY    = window.circleJsConfig.algolia.apiKey;
const ALGOLIA_INDEX      = window.circleJsConfig.algolia.indexName;
const ALGOLIA_ORBS_INDEX = window.circleJsConfig.algolia.indexNameOrbs;
const ALGOLIA_CIMGS_INDEX= window.circleJsConfig.algolia.indexNameCimgs;
const ALGOLIA_COLLECTION = ((lang) => {
  // Page language is default language, use default collection
  if (lang === 'en') {
    return 'cci2';
  } else {
    return `cci2_${lang}`;
  }
})(PAGE_LANG);

// Instant search initialization
export function init () {
  const search = instantsearch({
    indexName: ALGOLIA_INDEX,
    searchClient: algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY),
    routing: true,
    searchFunction: function(helper) {
      // don't run search for blank query, including on initial page load
      // https://stackoverflow.com/a/42321947
      if (helper.state.query === '') {
        return;
      }
      helper.search();
    }
  });

  search.addWidgets([
    // adding conditions to filter search
    instantsearch.widgets.configure({
      filters: `collection: ${ALGOLIA_COLLECTION}`,
      hitsPerPage: 25
    }),

    // initialize SearchBox
    instantsearch.widgets.searchBox({
      container: '#search-box',
      cssClasses: {
        input: 'instantsearch-search'
      },
      placeholder: 'Search Documentation',
      showLoadingIndicator: false
    }),

    // initialize hits widget
    instantsearch.widgets.hits({
      container: '#instant-hits',
      escapeHits: true,
      templates: {
        empty: 'No Documentation results',
        item: (item) => {
          let url = item.url;
          if (item.anchor) {
            url += `#${item.anchor}`;
          }

          const snippet = item._snippetResult
          const title = get(snippet, ['title', 'value'], '(untitled)');
          const content = get(snippet, ['content', 'value'], '');
          const titleTag = `<h4 class="result-title">${title}</h4>`;
          const contextTag = snippet.headings ?
            `<p class="result-context">${snippet.headings.map(h => h.value).join(' > ')}</p>` : '';
          const contentTag = `<p class="result-content">${content}</p>`;

          return `
            <a href="/docs${url}">
              <div class="result-item-wrap">
                ${titleTag}
                ${contextTag}
                ${contentTag}
              </div>
            </a>
          `;
        }
      }
    }),

    // add custom hits stats
    // https://www.algolia.com/doc/api-reference/widgets/stats/js/#connector
    instantsearch.connectors.connectStats(function (renderOptions, isFirstrender) {
      const { nbHits } = renderOptions;
      document.querySelector('.hits-count-docs').innerHTML = nbHits;
    })(),

    // add Orbs search
    instantsearch.widgets
      .index({ indexName: ALGOLIA_ORBS_INDEX })
      .addWidgets([
        instantsearch.widgets.configure({
          filters: '' // turn off filter present on base search
        }),
        instantsearch.widgets.hits({
          container: '#instant-hits-orbs',
          escapeHits: true,
          templates: {
            empty: 'No Orbs results',
            item: (item) => {
              const title   = get(item._highlightResult, ['full_name', 'value'], item.full_name);
              const content = get(item._highlightResult, ['description', 'value'], item.description);
              const lastUpdateDate = get(item, ['last_updated_at', 'formatted']);
              const extLinkIcon = `<i class="fa fa-external-link" aria-hidden="true"></i>`;
              const titleTag = `<h4 class="result-title">${title} ${extLinkIcon}</h4>`;
              const contentTag = content ? `<p class="result-content">${content}</p>` : '';
              const contextTag = lastUpdateDate ? `<p class="result-context"><strong>Version Published:</strong> ${lastUpdateDate}</p>` : '';
              const certifiedTag = item.is_certified ? `<span class="result-tag">Certified</span>` : '';
              const partnerTag = item.is_partner ? `<span class="result-tag">Partner</span>` : '';

              return `
                <a href="${item.url}">
                  <div class="result-item-wrap">
                    ${titleTag}
                    ${contextTag}
                    ${contentTag}
                    ${certifiedTag}
                    ${partnerTag}
                  </div>
                </a>
              `;
            }
          }
        }),

        // add custom hits stats
        // https://www.algolia.com/doc/api-reference/widgets/stats/js/#connector
        instantsearch.connectors.connectStats(function (renderOptions, isFirstrender) {
          const { nbHits } = renderOptions;
          document.querySelector('.hits-count-orbs').innerHTML = nbHits;
        })()
      ]),

    // add Convenience Images search
    instantsearch.widgets
      .index({ indexName: ALGOLIA_CIMGS_INDEX })
      .addWidgets([
        instantsearch.widgets.configure({
          filters: '' // turn off filter present on base search
        }),
        instantsearch.widgets.hits({
          container: '#instant-hits-cimgs',
          escapeHits: true,
          templates: {
            empty: 'No Convenience Images results',
            item: (item) => {
              const title   = get(item._highlightResult, ['name', 'value'], item.name);
              const content = get(item._highlightResult, ['description', PAGE_LANG, 'value'], item.description.en);
              const latestVersion = get(item, ['latestVersion']);
              const extLinkIcon = `<i class="fa fa-external-link" aria-hidden="true"></i>`;
              const titleTag = `<h4 class="result-title">${title} ${extLinkIcon}</h4>`;
              const contentTag = content ? `<p class="result-content">${content}</p>` : '';
              const contextTag = latestVersion ? `<p class="result-context"><strong>Latest version:</strong> ${latestVersion}</p>` : '';

              return `
                <a href="${CIMG_BASE_URL}/${item.name}">
                  <div class="result-item-wrap">
                    ${titleTag}
                    ${contextTag}
                    ${contentTag}
                  </div>
                </a>
              `;
            }
          }
        }),

        // add custom hits stats
        // https://www.algolia.com/doc/api-reference/widgets/stats/js/#connector
        instantsearch.connectors.connectStats(function (renderOptions, isFirstrender) {
          const { nbHits } = renderOptions;
          document.querySelector('.hits-count-cimgs').innerHTML = nbHits;
        })()
      ])
  ]);

  search.start();

  // insert search results
  var searchResetButton = document.querySelector("#search-box .ais-SearchBox-reset");
  var searchBox = document.querySelector("input.instantsearch-search");
  var pageBody = document.querySelector('.main-body');
  var mobileNav = document.querySelector('.sidebar-mobile-wrapper');
  var resultDisplay = document.querySelector('#hits-target');
  var form = document.querySelector('.main-searchbar form');

  function renderResults (e) {
    if (searchBox.value.length > 0) {
      window.scrollTo(0, 0);
      pageBody.style.display = "none";
      mobileNav.style.display = "none";
      resultDisplay.style.display = "block";
      window.dispatchEvent(new Event('shown.subnav'));
    } else {
      pageBody.style.display = "flex";
      mobileNav.style.display = "block";
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
    searchBox.value = ''
    renderResults();
  });

  // Scroll results back to top upon tab change
  $(resultDisplay).find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    $("html, body").animate({ scrollTop: 0 });
  });
};
