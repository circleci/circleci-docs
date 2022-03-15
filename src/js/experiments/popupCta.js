const LS_KEY = 'cciPopupData';
const SHOW_POPUP_AFTER_N_TIMES = 3;

function openPopup() {
  $('.popup-bg').addClass('popup-bg-show');
  $('.popup-content').addClass('popup-content-show');

  window.AnalyticsClient.trackAction('dd_docs-popup-cta_test__popup_seen');
}

function closePopup(trackIt = true) {
  $('.popup-bg').removeClass('popup-bg-show');
  $('.popup-content').removeClass('popup-content-show');
  if (trackIt) {
    window.AnalyticsClient.trackAction('dd_docs-popup-cta_test__popup_closed');
  }
}

/**
 * Get the Number of timesVisited from localStorage
 * if it doesn't exist, create it and set to 1.
 * */
function getPopupData() {
  if (!localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, JSON.stringify({
      timesVisited: 1,
      lastSeen: null
    }))
  }
  let popupData = JSON.parse(localStorage.getItem(LS_KEY));
  return popupData;
}

/**
 * In order to show the popup to users we need to:
 * a) the user has to have visited three pages ("timesVisited")
 * b) the user must not have already seen a popup today.
 *
 * In this function we pull the values around this from local storage, do some checks
 * and determine if we can show the popup.
 * */
function canShowPopup() {
  let now = new Date();
  let stillTheSameDay = false
  const popupData = getPopupData();
  if(popupData.lastSeen !== null) {
    const popupLastSeen = new Date(popupData.lastSeen);
    stillTheSameDay =
      now.getFullYear() === popupLastSeen.getFullYear() &&
      now.getMonth() === popupLastSeen.getMonth() &&
      now.getDate() === popupLastSeen.getDate()
  }
  return popupData.timesVisited === SHOW_POPUP_AFTER_N_TIMES && !stillTheSameDay
}


function incrementTimesVisited() {
  let popupData = getPopupData();
  if (popupData.timesVisited === SHOW_POPUP_AFTER_N_TIMES) {
    popupData.timesVisited = 0
    popupData.lastSeen = new Date()
  } else {
    popupData.timesVisited += 1
  }
  localStorage.setItem(LS_KEY, JSON.stringify(popupData));
}

// https://app.optimizely.com/v2/projects/16812830475/experiments/21253750305/
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_docs-popup-cta_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: '.main-body',
  attributes: {
    // This will only show the experiment to people who are guests to the docs site.
    docs_is_logged_in: window.userData?.created_at === undefined
  },
  guestExperiment: true,
}).then((variation) => {
  if (variation === 'treatment') {
    const popupBg = $('.popup-bg');
    const popupContent = $('.popup-content');
    const skipButton = $('.popup-skip-btn');
    const signupButton = $('.popup-signup-cta');

    popupBg.click(function () {
      if ($(this).has(popupContent).length === 0) {
        closePopup();
      }
    });

    signupButton.click(() => {
      window.AnalyticsClient.trackAction(
        'dd_docs-popup-cta_test__signup_clicked',
      );
      closePopup(false);
    });

    skipButton.click(() => {
      closePopup();
    });
    if (canShowPopup()) {
      // don't assume we have a popupwrapper in every docs layout.
      if (popupBg && popupContent) {
        openPopup();
      }
    }

    incrementTimesVisited();
  }
});
