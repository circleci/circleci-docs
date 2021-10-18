
$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20598037463/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_orb_section_to_docs_landing_page_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test'
  }).then(variation => {
    if (variation === "treatment") {
      $(".orb-bullet").css('visibility', 'hidden');
      $("#orb-section").css('visibility', 'visible');;
      $("#orb-content-swap").replaceWith("<a id=orb-kit href=https://circleci.com/docs/2.0/creating-orbs/#orb-development-kit>" + "Orb Development Kit" + "</a>")

      $("#orb-intro, #orb-concepts, #orb-publish, #orb-faq, #orb-kit").click(function () {
        window.AnalyticsClient.trackAction('docs-orb-bullet', { link: this.id });
      });
    }
  })
})
