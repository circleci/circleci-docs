/**
 * JS related to our language switcher in the footer
 */

function getElById(id) {
  return document.getElementById(id)
}

export function init() {
  let switcherToggleEl = getElById("languageSelectDropdown");
  let dropUpEl = getElById("dropUp")
  let langItems = getElById("languageMenuItems");

  switcherToggleEl.addEventListener("click", function(_) {
    langItems.classList.toggle("hidden");
  })
}
