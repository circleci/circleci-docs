/**
 * JS related to our language switcher in the footer
 */

// helpers -------------------

function getElById(id) {
  return document.getElementById(id)
}

var languages = {
  "en": {name: "English", url: "docs/"},
  "ja": {name: "日本語", url: "docs/ja/"}
}

// List of elements that have dynamic content based on our selected language
var els = {
  sidebarLangSelect: getElById("sidebarLangSelect"),
  footerLangSelect: getElById("footerLangSelect"),
  footerLangCurrentSelect: getElById("footerLangCurrentSelect"),
  footerLangOptions: getElById("footerLangOptions")
};

function redirectLocation(langCode) {
  const parser = new RegExp('^(https?:\/\/' + window.location.host + '\/)(docs\/[a-z]{2}\/|docs\/)(.*)', 's')
  const baseURL = "https://circleci.com/" + languages[langCode].url + "2.0"
  if (!parser.test(window.location.href)) {
    return baseURL
  }
  return window.location.href.replace(parser, '$1' + languages[langCode].url + '$3')
}

function reloadWithNewLocale(langCode) {
  window.location.href = redirectLocation(langCode)
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
