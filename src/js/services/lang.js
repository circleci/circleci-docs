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

// Refactor function for setting language to work in preview builds as well
const reloadNewLanguage = (langCode) => {
  const path = window.location.pathname;
  // get index of path endpoint to insert lang code
  const insert = path.indexOf('/', 1) + 1;

  if (langCode === 'ja' && window.currentLang !== 'ja') {
    const newPath = [path.slice(0, insert), 'ja/', path.slice(insert)].join('');
    window.location.href = window.location.origin + newPath;
  }
  if (langCode === 'en' && window.currentLang !== 'en') {
    const newPath = path.replace('ja/', '');
    window.location.href = window.location.origin + newPath;
  }
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
      reloadNewLanguage(langCode);
      window.AnalyticsClient.trackAction('Language Selector', {
        selected: langValue.name,
        browserNativeLang: window.navigator.language,
      });
    });
  }
};

/*
  Handle functionality and UI changes for language request input form and new language submission when an input is provided
*/
const langForm = $('.lang-form');

const languageRequest = () => {
  // Add styles for input form when active
  langForm.on('click', () => {
    langForm.addClass('active');
    $(document).on('click', (e) => {
      // Remove styles for active input form after users click off it
      if (!$(e.target).is(langForm)) {
        langForm.removeClass('active');
      }
    });
  });
};

const submitLanguage = () => {
  const submitBtn = $('#submit-btn');
  const input = $('#lang-req')[0];

  if (input.value.length > 0) {
    // If user input present, adjust UI and add event listener to submit data on click to amplitude
    submitBtn.css({ opacity: '100%', cursor: 'pointer' });
    submitBtn.on('click', () => {
      clearInterval(checkLangInput);
      langForm.css('pointer-events', 'none');

      window.AnalyticsClient.trackAction('New Language Request', {
        requestedLanguage: input.value,
        browserNativeLang: window.navigator.language,
        app: 'Docs',
        location: window.location.href,
        path: window.location.pathname,
      });
      // Swap out button with submit message after submission
      submitBtn.replaceWith(
        '<span id=lang-submitted>' + 'Thank you for your help' + '</span>',
      );
    });
  }
  // If no user input present, adjust UI and remove event from submit btn
  if (!input.value.length) {
    submitBtn.css({ opacity: '50%', cursor: 'not-allowed' });
    submitBtn.off('click');
  }
};
// use intervals to check if user provided input to alter UI and toggle on click event for submit btn
const checkLangInput = setInterval(submitLanguage, 500);

export function init() {
  setLanguageSelectorOnLoad();
  handleChangeLanguageNav();
  languageRequest();
}
