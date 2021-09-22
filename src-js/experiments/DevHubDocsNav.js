
$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20616121296/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_merge_devhub_docs_experiment_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test'
  }).then(variation => {
    if (variation === "treatment") {
      $(".dd-global-nav--links").show();
      $(".dd-global-nav--links a").click(function(_) {
        window.AnalyticsClient.trackAction('docs-devhub-nav-merge-link-clicked', {link: this.href})
      })
    }
  })
})
