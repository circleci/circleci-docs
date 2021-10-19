
$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20616121296/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_merge_devhub_docs_experiment_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test',
    attributes: {
      // https://app.optimizely.com/v2/projects/16812830475/audiences/20678820396/#modal
      windowWidth: window.innerWidth ?? 0,
    }
  }).then(variation => {
    if (variation === "treatment" && window.innerWidth >= 992) {
      // we are already telling optimizely to disqualify users on mobile but
      // to keep it consistent we also include window.innerWidth as part of the if
      // in the case someone is forced in "treatment"

      $(".global-nav--component").addClass("dd-global-nav--component")
      $(".dd-global-nav--links").show();

      $(".dd-global-nav--links a").click(function (_) {
        window.AnalyticsClient.trackAction('docs-devhub-nav-merge-link-clicked', { link: this.href })
      });

      // aside.full-height used to adjust the top property for the sidenav while Docs-Devhub merge experiment is running
      $("aside.full-height").css('top', '111px');
    }
  })
});
