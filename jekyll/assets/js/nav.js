// Collapsing submenus on mobile nav
(function () {
  // grabbing all expandable submenus
  var expandableSubMenus = Array.from(document.querySelectorAll('nav li.arrow'));
  var mobileMenuBtn = document.querySelectorAll('button.navbar-toggle')[0];
  var htmlBody = document.getElementsByTagName('body')[0];
  var mobileNav = document.getElementById('mobile-navigation');

  expandableSubMenus.forEach(function (submenu) {
    submenu.addEventListener('click', function () {
      if (this.classList.contains('collapsed')) {
        this.classList.remove('collapsed');
      } else {
        this.classList.add('collapsed');
      }
    });
  });

  var preventDefaultTouch = function (e) {
    e.preventDefault();
  };

  // on click of nav, on mobile, hide body scroll, to make only nav scrollable
  mobileMenuBtn.addEventListener('click', function (btnEvt) {
    if (btnEvt.target.classList.contains('collapsed')) {
      htmlBody.style.overflow = "hidden";
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

      var offset, navEvt;
      mobileNav.addEventListener('touchstart', function (evt) {
        offset = this.scrollTop; 
        navEvt = evt;
      });
      mobileNav.addEventListener('touchmove', function (navEvt2) {
        this.scrollTop = (navEvt.touches[0].clientY - navEvt2.touches[0].clientY) + offset;
      });
    } else {
      htmlBody.style.overflow = "initial";
      document.removeEventListener('touchmove', preventDefaultTouch, { passive: false });
    }
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