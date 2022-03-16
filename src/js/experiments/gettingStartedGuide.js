// https://app.optimizely.com/v2/projects/16812830475/experiments/21268663100/variations

// NOTE: experimentContainer can be updated once we have the other components of this experiment created and in place
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_getting_started_docs_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: 'body',
  guestExperiment: false,
}).then((variation) => {
  if (variation === 'treatment') {
    // console.log('IN TREATMENT GROUP');
  }
  if (variation === 'control') {
    // console.log('IN CONTROL GROUP');
  }
});
