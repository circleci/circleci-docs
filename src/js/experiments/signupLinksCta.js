import './signupLinksCta.scss';

const isFirstStepsPage = window.location.pathname == '/docs/2.0/first-steps/';

function showExperiment() {
  $(".signup-and-try-experiment-block").toggleClass("show");
}

function handleGithubDropdownClick(){
  const dropdown = $('.gh-signup-dropdown')
  // toggle the popup
  $('.gh-dropdown-button').click((e) => {
    dropdown.toggleClass("show");
    e.stopPropagation()
  })

  // clicking on body closes pop if it is open.
  $('body').click((e) => {
    dropdown.removeClass("show");
  })
}

/**
 * query all signup buttons by class
 * add click listener to track to amplitude before navigating to new page
 * */
function handleClickedLink() {
  $(".track-signup-link").each(function() {
    $(this).click((e) => {
      console.log("event was ", e.target.innerText);
      e.stopPropagation()
    })
  })

}


window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs_knowledge_base_pt2_test', // TODO: replace
  groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
  experimentContainer: '.full-height-sticky',
}).then((variation) => {
  variation = "treatment"; // TODO remove when experiment is setup
  if (variation === 'treatment' && isFirstStepsPage) {
    showExperiment()
    handleGithubDropdownClick();
    handleClickedLink();
  }
});
