function renderExperimentalKnowledgeBaseLinks() {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20790151733/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_docs_knowledge_base_pt2_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '.full-height-sticky',
  }).then((variation) => {
    if (variation === 'treatment') {
      const sidebar = $('.has-experiment-links');
      sidebar.addClass('reveal');
    }
  });
}

function trackExperimentalKnowledgeBaseLinks() {
  $('.experimental-link').click(function () {
    window.AnalyticsClient.trackAction(
      'docs-experimental-knowledgebase-link-clicked',
      {
        link: $(this).children('a').first().attr('href'),
        title: $(this).text(),
        location: window.location.href,
      },
    );
  });
}

$(() => {
  renderExperimentalKnowledgeBaseLinks();
  trackExperimentalKnowledgeBaseLinks();
});
