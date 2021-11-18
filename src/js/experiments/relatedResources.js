$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20872380274/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_docs_related_resources_mvp_test_rerun_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '#related-resources',
    attributes: {
      // https://app.optimizely.com/v2/projects/16812830475/audiences/20680670160
      windowWidth: window.innerWidth ?? 0,
    },
  }).then((variation) => {
    if (variation === 'treatment') {
      $('#related-resources').show();
      // track clicks on each items
      $('#related-resources li a').click(function () {
        window.AnalyticsClient.trackAction('docs-related-resources-clicked', {
          page: location.pathname,
          link: $(this).attr('href'),
          name: $(this).text(),
        });
      });
    }
  });
});
