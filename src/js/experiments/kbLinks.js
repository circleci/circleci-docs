window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs_knowledge_base_pt2_test',
  groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
  experimentContainer: '.full-height-sticky',
}).then((variation) => {
  if (variation === 'treatment') {
    const sidebar = $('.has-experiment-links');
    sidebar.addClass('reveal');
  }

  $('.experimental-link').click(function () {
    window.AnalyticsClient.trackAction(
      'docs-experimental-knowledgebase-link-clicked',
      {
        link: $(this).attr('href'),
        title: $(this).text(),
        location: window.location.href,
      },
    );
  });
});
