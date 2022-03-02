const isFirstStepsPage = window.location.pathname == '/docs/2.0/first-steps/';

function handleGithubDropdownClick(){
  const dropdown = $('.gh-signup-dropdown')
  // toggle the popup
  $('.gh-dropdown-button').click((e) => {
    dropdown.addClass("show");
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
      window.AnalyticsClient.trackAction("dd_first-steps-signup-cta_test", {
        button: e.target.innerText
      });
    })
  })
}

// https://app.optimizely.com/v2/projects/16812830475/experiments/21253750305/variations
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_first-steps-signup-cta_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: '.sign-up-and-try-circleci',
  guestExperiment: true,
}).then((variation) => {
  if (variation === 'treatment') {
    $(".signup-and-try-experiment-block").toggleClass("show");
    handleGithubDropdownClick();
    handleClickedLink();
  }
});
