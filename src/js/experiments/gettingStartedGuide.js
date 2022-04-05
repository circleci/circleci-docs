// https://app.optimizely.com/v2/projects/16812830475/experiments/21268663100/variations

/**
 * Changes "Your First Green Build" in the docs sidebar to "Quickstart Guide"
 * Adds a "NEW" badge to the sidebar item as well.
 **/
function addNewBadgeToSidebar() {
  const isGettingStartedPage =
    window.location.pathname == '/docs/2.0/getting-started/';

  const NEW_SIDEBAR_HTML = `
    <a class="${isGettingStartedPage ? 'active' : ''}"
       style="display: flex; align-items: center"
       href="/docs/2.0/getting-started/"
       data-section="getting-started" data-proofer-ignore="">
      <span>Quickstart Guide</span>
      <span class="getting-started-new-badge"> NEW </span>
    </a>
`;

  $("li > a[href='/docs/2.0/getting-started/']").replaceWith(NEW_SIDEBAR_HTML);
}

function showHomePageBadges() {
  const isGettingStartedPage =
    window.location.pathname == '/docs/';

  if (isGettingStartedPage) {
    $(".getting-started-experiment-badges").show();
  }
}

// NOTE: experimentContainer can be updated once we have the other components of this experiment created and in place
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_getting_started_docs_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: 'body',
  guestExperiment: false,
}).then((variation) => {
  if (variation === 'treatment') {
    addNewBadgeToSidebar();
    showHomePageBadges();
    // console.log('IN TREATMENT GROUP');
  }
  if (variation === 'control') {
    // console.log('IN CONTROL GROUP');
  }
});
