/**
 * JS related to our language switcher in the footer/sidebar
 */

function getElById(id) {
  return document.getElementById(id)
}

var languages = {
  "en": {name: "English", url: "docs/2.0/"},
  "ja": {name: "日本語", url: "docs/ja/2.0/"}
}

function reloadWithNewLocale(langCode) {
  window.location.href = "https://circleci.com/" + languages[langCode].url
}

// Sets the sidebar language picker to the currently selected language
function handleSetLanguageOnLoad() {
  var currentLang = window.currentLang; // current lang is set in _includes/sidebar.html
  var langSelect = getElById("sidebarLangSelect");
  for(var i, j = 0; i = langSelect.options[j]; j++) {
    if(i.value == currentLang) {
      langSelect.selectedIndex = j;
      break;
    }
  }
}

/**
 * Function to run when the sidebar language <select> is changed.
 * It checks the newly selected language code and reloads the page in that language.
 */
function handleChangeLanguageSidebar() {
  var langSelect = getElById("sidebarLangSelect");
  langSelect.addEventListener("change", function(e) {
    switch(e.target.value) {
      case "ja":
        reloadWithNewLocale("ja")
        break;
      case "en":
        reloadWithNewLocale("en")
        break;
      default:
        return;
    }
  })
}


export function init() {
  handleChangeLanguageSidebar();
  handleSetLanguageOnLoad();
}
