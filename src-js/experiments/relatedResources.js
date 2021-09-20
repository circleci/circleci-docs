$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20598037463/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_docs_related_resources_mvp_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test'
  }).then(variation => {
    if (variation === "treatment") {
      $('#related-resources').show();

      $("#related-resources li a").click(function () {
        console.log({
          page: location.pathname,
          link: $(this).attr('href'),
          name: $(this).text()
        });

        // window.AnalyticsClient.trackAction('related-rerouces-clicked', {
        //   page: location.pathname,
        //   link: $(this).attr('href'),
        //   name: $(this).text()
        // });
      });
      //$('#related-resources li').click(())
    }
  })
})
