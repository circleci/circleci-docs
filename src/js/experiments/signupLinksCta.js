import './signupLinksCta.scss';

const isFirstStepsPage = window.location.href == 'https://circleci.com/docs/2.0/first-steps/'

function showExperiment() {

}

function handleGithubDropdownClick(){

}

function handleClickedLink() {

}


window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs_knowledge_base_pt2_test',
  groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
  experimentContainer: '.full-height-sticky',
}).then((variation) => {
  if (variation === 'treatment' && isFirstStepsPage) {
    console.log("hi there!");
  }
});
