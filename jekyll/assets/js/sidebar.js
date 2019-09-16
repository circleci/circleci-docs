// making sidebar stick when touching footer
// this improves the visual experience while interacting with the docs site
(function () {
  window.addEventListener('load', function () {
    var footer = document.querySelector('.footer');
    var sidebar = document.querySelector('.sidebar');
    var mobileSidebar = document.querySelector('.sidebar-mobile-wrapper');
    var mobileSidebarCurrent = mobileSidebar.querySelector('.current-item');
    var mobileSidebarDefault = mobileSidebar.querySelector('[data-id="welcome"]');
    var mobileSidebarDisplay = mobileSidebar.querySelector('.mobile-sidebar');

    // get hash, if it exists
    if (window.location.hash && window.location.hash.indexOf('section') > -1) {
      var section = getUrlVars(window.location.hash);
      localStorage.sidenavActive = section['section']
    }

    if (localStorage.sidenavActive) {
      // fullscreen sidenav expansion
      function sidenavAutoExpand (parent) {
        var element = parent.querySelector('[data-section=' + localStorage.sidenavActive + ']');
        if (element && element.classList.contains('closed')) {
          element.classList.remove('closed');
        }
      };

      sidenavAutoExpand(sidebar);
      sidenavAutoExpand(mobileSidebar);

      // for mobile sidebar, if sidebar is set, display proper item
      var mobileCurrentElement = mobileSidebar.querySelector('[data-id=' + localStorage.sidenavActive + ']');
      if (mobileCurrentElement && mobileCurrentElement.classList.contains('hidden')) {
        mobileCurrentElement.classList.remove('hidden');
        mobileSidebarDefault.classList.add('hidden');
      }
    }

    // Show/hide mobile sidebar
    mobileSidebarCurrent.addEventListener('click', function () {
      if(mobileSidebarDisplay.classList.contains('hidden')) {
        mobileSidebarDisplay.classList.remove('hidden');
      } else {
        mobileSidebarDisplay.classList.add('hidden');
      }
    });

    function setSidebar () {
      // if footer is in frame, removed fixed style (otherwise add it, if it doesn't exist)
      if ((footer.getBoundingClientRect().top - window.innerHeight) <= 0 && footer.getBoundingClientRect().top >= window.innerHeight) {
        if (sidebar.classList.contains('fixed')) {
          sidebar.classList.remove('fixed');
        }
      } else {
        if (!sidebar.classList.contains('fixed')) {
          sidebar.classList.add('fixed');
        }
      }

      // prevents display problems on very large screens with little content
      if (footer.getBoundingClientRect().top <= window.innerHeight) {
        sidebar.style.height = (footer.getBoundingClientRect().top - 70) + 'px';
      } else {
        sidebar.style.height = null;
      }
    };

    window.addEventListener('scroll', setSidebar);
    window.addEventListener('load', setSidebar);
    window.addEventListener('resize', setSidebar);

    // allowing opening/closing of subnav elements
    var mainNavItems = Array.from(document.querySelectorAll('nav.sidebar .main-nav-item'));
    var mobileNavItems = Array.from(document.querySelectorAll('nav.mobile-sidebar .main-nav-item'));

    function enableAccordion (array) {
      array.forEach(function (item) {
        var listWrap = item.querySelector('.list-wrap');
        listWrap.addEventListener('click', function () {
          if (item.classList.contains('closed')) {
            item.classList.remove('closed');
          } else {
            item.classList.add('closed');
          }
        });
      });
    };

    enableAccordion(mainNavItems);
    enableAccordion(mobileNavItems);
  });
}());
