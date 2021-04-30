// Modal search on mobile
$(document).ready(function () {
  $('.global-nav--search-button').on('click', function (e) {
    e.preventDefault();
    $('#global-nav').collapse('hide');
    $('body').addClass('search-open');
    $('.global-nav--search-bar .instantsearch-search').focus();
  });
}());

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
  var expandableSubMenus = Array.from(document.querySelectorAll('nav li.arrow'));

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
}());
