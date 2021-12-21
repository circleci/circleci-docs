// Modal search on mobile
$(document).ready(
  (function () {
    $('.global-nav--search-button').on('click', function (e) {
      e.preventDefault();
      $('body').addClass('search-open');
      $('.global-nav--search-bar .instantsearch-search').focus();
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
  const globeBtn = document.getElementById("globe-lang-btn");
  const langPicker = document.getElementById("lang-picker");
  const underlyingMobileMenu = document.querySelector('.mobile-sidebar');
  const dimmer = document.querySelector(".lang-picker-mobile-dimmer");


  globeBtn.addEventListener('click', () => {
    langPicker.classList.toggle('lang-active');
    underlyingMobileMenu.classList.add('hidden-md');
    dimmer.style.display = "inherit";
  });

  $('body').on('click', (e) => {
    if (!globeBtn.contains(e.target) && !langPicker.contains(e.target)) {
      underlyingMobileMenu.classList.remove('hidden-md');
      langPicker.classList.remove('lang-active');
      dimmer.style.display = "none";
    }
  });
};

// Another PR will address refactoring rest of functions to be added to this callback
$(document).ready(() => {
  openLangDropdown();
});
