// https://app.optimizely.com/v2/projects/16812830475/experiments/21268663100/variations
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_getting_started_docs_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: '.article-toc',
  guestExperiment: false,
}).then((variation) => {
  if (variation === 'treatment') {
    alert('IN TREATMENT GROUP');
  }
  if (variation === 'control') {
    alert('IN CONTROL GROUP');
  }
});
