/**
 * JS related to our language switcher in the footer and sidebar
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

/**
 * When we change languages, break down the url and reconstruct it with the new
 * languages code as part of the path.
 * if we are on a localized url: remove langCode -> go to english version.
 * otherwise, inject new langCode into url -> and visit it.
 *
 * */
function reloadWithNewLocale(langCode) {
  var currentPathName = window.location.pathname;
  var urlWithLang     = languages[window.currentLang].url;
  var currentPage     = currentPathName.split(urlWithLang)[1];
  var outgoingURL     = "https://circleci.com"


  if (window.currentLang !== "en") {
    // temp replace docs with branch deploy name.
    outgoingURL += "/ts-lang-picker-preview/2.0/" + currentPage;
  } else {
    outgoingURL += "/ts-lang-picker-preview/" + langCode + "/2.0/" + currentPage;
  }

  alert("outgoing URL is: " + outgoingURL)
  window.location.href = outgoingURL
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
