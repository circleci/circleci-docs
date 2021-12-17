/**
 * JS related to the language selector in the header nav
 */

// helpers -------------------

const getElById = (id) => document.getElementById(id);

const languages = {
  en: { name: 'English', url: 'docs/' },
  ja: { name: '日本語', url: 'docs/ja/' },
};

// List of elements that have dynamic content based on our selected language
const els = {
  globalNavLangEng: getElById('globalNavLangEng'),
  globalNavLangJap: getElById('globalNavLangJap'),
};

// Sets the new url for the lanuage selected
const redirectLocation = (langCode) => {
  const parser = new RegExp(
    '^(https?://' + window.location.host + '/)(docs/[a-z]{2}/|docs/)(.*)',
    's',
  );
  const baseURL = 'https://circleci.com/' + languages[langCode].url + '2.0';
  if (!parser.test(window.location.href)) {
    return baseURL;
  }
  return window.location.href.replace(
    parser,
    '$1' + languages[langCode].url + '$3',
  );
};

// Reloads the page with the new url of the selected language applied
const reloadWithNewLocale = (langCode) => {
  window.location.href = redirectLocation(langCode);
};

// Shows the current active/selected language in the dropdown
const setLanguageSelectorOnLoad = () => {
  const currentLang = window.currentLang;
  currentLang === 'en'
    ? $('#globalNavLangEng').css('background', '#F3F3F3')
    : $('#globalNavLangJap').css('background', '#F3F3F3');
  return;
};

//  Reloads and changes the site to the selected language on click from the language dropdown
const handleChangeLanguageNav = () => {
  els.globalNavLangEng.addEventListener('click', () => {
    reloadWithNewLocale('en');
    window.AnalyticsClient.trackAction('Language Selector', {
      selected: 'English',
      browserNativeLang: window.navigator.language,
    });
  });
  els.globalNavLangJap.addEventListener('click', () => {
    reloadWithNewLocale('ja');
    window.AnalyticsClient.trackAction('Language Selector', {
      selected: 'Japanese',
      browserNativeLang: window.navigator.language,
    });
  });
  return;
};

export function init() {
  setLanguageSelectorOnLoad();
  handleChangeLanguageNav();
}
