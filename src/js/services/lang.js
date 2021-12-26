/**
 * JS related to the language selector in the header nav
 */

// helpers -------------------
const getElById = (id) => document.getElementById(id);

const languages = {
  en: {
    name: 'English',
    url: 'docs/',
    id: 'globalNavLangEng',
    domEl: getElById('globalNavLangEng'),
  },
  ja: {
    name: '日本語',
    url: 'docs/ja/',
    id: 'globalNavLangJap',
    element: 'globalNavLangJap',
    domEl: getElById('globalNavLangJap'),
  },
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
  // if currentLang is not available, grab default language from user's browser.
  // Default to english if neither can be accessed.
  const currentLang =
    languages[window.currentLang] ||
    languages[window.navigator.language] ||
    languages['en'];
  $(currentLang.domEl).css('background', '#F3F3F3');
};

//  Reloads and changes the site to the selected language on click from the language dropdown
const handleChangeLanguageNav = () => {
  for (const langCode in languages) {
    const langValue = languages[langCode];
    langValue.domEl.addEventListener('click', () => {
      reloadWithNewLocale(langCode);
      window.AnalyticsClient.trackAction('Language Selector', {
        selected: langValue.name,
        browserNativeLang: window.navigator.language,
      });
    });
  }
};

export function init() {
  setLanguageSelectorOnLoad();
  handleChangeLanguageNav();
}
