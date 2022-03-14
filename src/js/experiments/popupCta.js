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

  // don't assume we have a popupwrapper in every docs layout.
  if (popupBg && popupContent) {
    openPopup()
  }
}

init();
