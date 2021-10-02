
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
    if (variation === "treatment") {
      // TODO: Fig1 - PR not done until the below section replaces this:
      // $(".dd-global-nav--links").show();
      // $(".dd-global-nav--links a").click(function(_) {
      //   window.AnalyticsClient.trackAction('docs-devhub-nav-merge-link-clicked', {link: this.href})
      // })
    }
  })
})

// this code below is a shim because i'm not in docker:
// TODO: PR not done until the below repalces --Fig1 above

// Add a global experiment class, so that the nested scss auto applies styles.
$(".global-nav--component").addClass("dd-global-nav--component")

$(".dd-global-nav--links").show();
$(".dd-global-nav--links a").click(function(_) {
  window.AnalyticsClient.trackAction('docs-devhub-nav-merge-link-clicked', {link: this.href})
})
