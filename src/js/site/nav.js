// Modal search on mobile
$(document).ready(
  (function () {
    const body = $('body');
    const mobileSearchIcon = $('.global-nav--search-button');
    const mobileMenuBtn = $('.global-nav--toggle');

    mobileSearchIcon.on('click', function (e) {
      e.preventDefault();
      body.addClass('search-open');
      $('.global-nav--search-bar .instantsearch-search').focus();
      if (body.hasClass('search-open')) {
        mobileSearchIcon.addClass('no-display');
        mobileMenuBtn.addClass('no-display');
      }
    });
  })(),
);

// Show/hide search button on menu collapse
$(document).ready(function () {
  $('#global-nav').on('show.bs.collapse', function () {
    $('body').addClass('global-nav-open');
  });
  $('#global-nav').on('hide.bs.collapse', function () {
    $('body').removeClass('global-nav-open');
  });
});

// Collapsing submenus on mobile nav
(function () {
  // grabbing all expandable submenus
  var expandableSubMenus = Array.from(
    document.querySelectorAll('nav li.arrow'),
  );

  expandableSubMenus.forEach(function (submenu) {
    submenu.addEventListener('click', function () {
      if (this.classList.contains('collapsed')) {
        this.classList.remove('collapsed');
      } else {
        this.classList.add('collapsed');
      }
    });
  });

  // Remove search open when mobile menu is open
  const mobileMenu = $('.global-nav--toggle');
  const mobileSearchIcon = $('.global-nav--search-button');
  mobileMenu.on('click', () => {
    mobileSearchIcon.toggleClass('no-display');
  });

  // Open dropdowns on keyboard focus
  $(document).ready(function () {
    $('.nav-item').each(function () {
      var wrapper = $(this);
      wrapper.find('a').on('focus', function () {
        wrapper.addClass('submenu-open');
        wrapper.attr('aria-expanded', true);
      });
      wrapper.on('focusout', function () {
        wrapper.removeClass('submenu-open');
        wrapper.attr('aria-expanded', false);
      });
    });
  });
})();

// Open dropdown in language selector
const openLangDropdown = () => {
  const globeBtn = $('#globe-lang-btn');
  const langPicker = $('#lang-picker');

  $('body').on('mouseup', (e) => {
    globeBtn.on('click', () => {
      langPicker.toggleClass('lang-active');
    });

    if (
      !langPicker.is(e.target) &&
      langPicker.has(e.target).length === 0 &&
      langPicker.hasClass('lang-active')
    ) {
      langPicker.removeClass('lang-active');
    }
  });
};

// Another PR will address refactoring rest of functions to be added to this callback
$(document).ready(() => {
  openLangDropdown();
});
