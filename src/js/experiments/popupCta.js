function openPopup() {
  $(".popup-bg").addClass("popup-bg-show");
  $(".popup-content").addClass("popup-content-show");
}

function closePopup() {
  $(".popup-bg").removeClass("popup-bg-show");
  $(".popup-content").removeClass("popup-content-show");
}

/**
 * Sets a counter for timesVisited if it doesn't exist
 * If it does exist, increment it.
 * If timesVisited = , return true
 * */
function handleLocalStorageCounter() {
  const lsKey = "timesVisited"
  let timesVisited = localStorage.getItem(lsKey);
  console.log("times visited is 1", timesVisited);
  timesVisited = parseInt(timesVisited);
  console.log("times visited is ", timesVisited);
  if (isNaN(timesVisited)) { timesVisited = 0; }
  if (!timesVisited) {
    localStorage.setItem(lsKey, 0)
  } else {
    localStorage.setItem(lsKey, timesVisited += 1)
  }
  return timesVisited
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
    const timesVisited = handleLocalStorageCounter()

    // REVIEW: are we ok with closing the popup by clicking on the background outside of it
    // of will the user have to click "Skip"?
    // if the latter, remove this.
    popupBg.click(function(event) {
      if ($(this).has(popupContent).length === 0) {
        closePopup();
      }
    });

    skipButton.click(closePopup)

    if (timesVisited === 3) {
      // don't assume we have a popupwrapper in every docs layout.
      if (popupBg && popupContent) {
        openPopup()
      }
    }
  }
});
