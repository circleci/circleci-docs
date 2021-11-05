$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20742690126/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_surfacing_full_example_config_experiment_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test',
  }).then((variation) => {
    if (variation === 'treatment') {
      $('#full-config-example').css('visibility', 'visible');
      $('#full-config-example').click(function () {
        window.AnalyticsClient.trackAction('docs-full-config-example-link', {
          link: this.id,
        });
      });
    }
  });
});
