
$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20598037463/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_orb_section_to_docs_landing_page_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test'
  }).then(variation => {
    if (variation === "treatment") {
      $(".orb-bullet").hide();
      $("#orb-section").show();

      $("#orb-intro").click(function () {
        window.AnalyticsClient.trackAction('docs-orb-bullet', { link: "Getting Started with Orbs" });
      })
      $("#orb-concepts").click(function () {
        window.AnalyticsClient.trackAction('docs-orb-bullet', { link: "Core Concepts" });
      })
      $("#orb-publish").click(function () {
        window.AnalyticsClient.trackAction('docs-orb-bullet', { link: "Publishing Your Orb" });
      })
      $("#orb-faq").click(function () {
        window.AnalyticsClient.trackAction('docs-orb-bullet', { link: "Orbs FAQ" });
      })
    }
  })
})