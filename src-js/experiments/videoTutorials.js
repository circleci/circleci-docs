$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20790151733/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_video_tab_to_docs_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test',
  }).then((variation) => {
    if (variation === 'treatment') {
      // $('#related-resources').show();
      // // track clicks on each items
      // $('#related-resources li a').click(function () {
      //   window.AnalyticsClient.trackAction('docs-related-resources-clicked', {
      //     page: location.pathname,
      //     link: $(this).attr('href'),
      //     name: $(this).text(),
      //   });
      // });
    }
  });
});
