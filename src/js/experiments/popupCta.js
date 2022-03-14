function openPopup() {
  $(".popup-bg").addClass("popup-bg-show");
  $(".popup-content").addClass("popup-content-show");
}

function closePopup() {
  $(".popup-bg").removeClass("popup-bg-show");
  $(".popup-content").removeClass("popup-content-show");
}

function init() {
  let isOpen = false
  const popupBg = $(".popup-bg");
  const popupContent = $(".popup-content");
  const skipButton = $(".popup-skip-btn");

  skipButton.click(() => {
    closePopup();
  })

  // REVIEW: are we ok with closing the popup by clicking on the background outside of it
  // of will the user have to click "Skip"?
  // if the latter, remove this.
  popupBg.click(function(event) {
    if ($(this).has(popupContent).length === 0) {
      closePopup();
    }
  });

  // don't assume we have a popupwrapper in every docs layout.
  if (popupBg && popupContent) {
    openPopup()
  }
}

init();
