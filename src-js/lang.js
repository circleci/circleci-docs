/**
 * JS related to our language switcher in the footer
 */

// helpers -------------------

function getElById(id) {
  return document.getElementById(id)
}

var languages = {
  "en": {name: "English", url: "docs/2.0/"},
  "ja": {name: "日本語", url: "docs/ja/2.0/"}
}

// List of elements that have dynamic content based on our selected language
var els = {
  sidebarLangSelect: getElById("sidebarLangSelect"),
  footerLangSelect: getElById("footerLangSelect"),
  footerLangCurrentSelect: getElById("footerLangCurrentSelect"),
  footerLangOptions: getElById("footerLangOptions")
};

function reloadWithNewLocale(langCode) {
  window.location.href = "https://circleci.com/" + languages[langCode].url
}

// Sets the sidebar language picker to the currently selected language
function handleSetLanguageOnLoad() {
  var currentLang = window.currentLang; // current lang is set in _includes/sidebar.html

  // Set value for 'sidebar'
  for(var i, j = 0; i = els.sidebarLangSelect.options[j]; j++) {
    if(i.value == currentLang) {
      els.sidebarLangSelect.selectedIndex = j;
      break;
    }
  }

  // set value for footer picker.
  footerLangCurrentSelect.textContent = languages[window.currentLang].name;

}

/**
 * Function to run when the sidebar language <select> is changed.
 * It checks the newly selected language code and reloads the page in that language.
 */
function handleChangeLanguageSidebar() {
  els.sidebarLangSelect.addEventListener("change", function(e) {
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

function handleChangeLanguageFooter() {
  els.footerLangSelect.addEventListener("click", function(_) {
    els.footerLangOptions.classList.toggle("hidden");
  })
}


export function init() {
  handleChangeLanguageSidebar();
  handleChangeLanguageFooter();
  handleSetLanguageOnLoad();
}
