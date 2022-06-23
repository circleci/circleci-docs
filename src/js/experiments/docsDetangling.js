// Because these pages have experiments we don't want to redirect users to docs-platform for now
const pagesWithExperiments = [
  '/docs/',
  '/docs/2.0/getting-started/',
  '/docs/2.0/first-steps/',
  '/docs/2.0/language-python/',
  '/docs/2.0/language-javascript/',
  '/docs/ja/',
  '/docs/ja/2.0/getting-started/',
  '/docs/ja/2.0/first-steps/',
  '/docs/ja/2.0/language-python/',
  '/docs/ja/2.0/language-javascript/',
];

window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs_detangling_redirect_test',
  groupExperimentName: 'q2_fy23_docs_disco_experiment_group_test',
  experimentContainer: 'body',
  guestExperiment: true,
  attributes: {
    is_page_docs_disco_experiment: pagesWithExperiments.includes(
      window.location.pathname,
    ),
  },
}).then((variation) => {
  if (variation === 'treatment') {
    const currentUrl = window.location.href;

    window.AnalyticsClient.trackAction('dd_docs-detangling-redirect', {
      url: currentUrl,
      page: window.location.pathname,
    });

    // redirect to docs-platform
    window.location.href = currentUrl.replace(
      'circleci.com/docs',
      'circleci.com/docs2',
    );
  }
});
