const LS_KEY = "timesVisited"
const SHOW_POPUP_AFTER_N_TIMES = 3

function openPopup() {
  $(".popup-bg").addClass("popup-bg-show");
  $(".popup-content").addClass("popup-content-show");

  window.AnalyticsClient.trackAction('dd_docs-popup-cta_test__popup_seen');
}

function closePopup() {
  $(".popup-bg").removeClass("popup-bg-show");
  $(".popup-content").removeClass("popup-content-show");
}


/**
 * Get the Number of timesVisited from localStorage
 * if it doesn't exist, create it and set to 1.
 * */
function getTimesVisited() {
  let timesVisited = parseInt(localStorage.getItem(LS_KEY));
  if (!timesVisited || isNaN(timesVisited)) {
    timesVisited = 1
    localStorage.setItem(LS_KEY, timesVisited);
  }
  return timesVisited;
}

function incrementTimesVisited() {
  const timesVisited = getTimesVisited()
  if (timesVisited == SHOW_POPUP_AFTER_N_TIMES)  {
    localStorage.setItem(LS_KEY, 0)
  } else {
    localStorage.setItem(LS_KEY, timesVisited + 1 )
  }
}

// https://app.optimizely.com/v2/projects/16812830475/experiments/21253750305/
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs-popup-cta_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: '.main-body',
  // guestExperiment: true, // FIXME: re-enable this for production.
}).then((variation) => {
  if (variation === 'treatment') {
    const popupBg = $(".popup-bg");
    const popupContent = $(".popup-content");
    const skipButton = $(".popup-skip-btn");
    const signupButton = $(".popup-signup-cta");
    const timesVisited = getTimesVisited()
    console.log(timesVisited);

    // REVIEW: are we ok with closing the popup by clicking on the background outside of it
    // of will the user have to click "Skip"?
    // if the latter, remove this.
    popupBg.click(function(event) {
      if ($(this).has(popupContent).length === 0) {
        closePopup();
      }
    });

    signupButton.click(() => {
      window.AnalyticsClient.trackAction('dd_docs-popup-cta_test__signup_clicked');
    })

    skipButton.click(() => {
      window.AnalyticsClient.trackAction('dd_docs-popup-cta_test__skip_clicked');
      closePopup()
    })
    if (timesVisited === SHOW_POPUP_AFTER_N_TIMES) {
      // don't assume we have a popupwrapper in every docs layout.
      if (popupBg && popupContent) {
        openPopup()
      }
    }

    incrementTimesVisited();
  }
});
