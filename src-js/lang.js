/**
 * JS related to our language switcher in the footer
 */

function getElById(id) {
  return document.getElementById(id)
}

export function init() {
  let switcherToggleEl = getElById("languageSelectDropdown");
  let dropUpEl = getElById("dropUp")

  switcherToggleEl.addEventListener("click", function(_) {
    dropUpEl.classList.toggle("open");
  })
}
