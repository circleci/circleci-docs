import { isElementInViewport } from '../utils';

// making sidebar stick when touching footer
// this improves the visual experience while interacting with the docs site
(function () {
  window.addEventListener('load', function () {
    var footer = document.querySelector('.footer');
    var sidebar = document.querySelector('.sidebar');
    var defaultSectionName = 'getting-started';
    var mobileSidebar = document.querySelector('.sidebar-mobile-wrapper');
    var mobileSidebarDefault = mobileSidebar.querySelector(
      '[data-id="' + defaultSectionName + '"]',
    );

    // activate default section, if nothing else is selected
    var activeSection = defaultSectionName;
    var activePage = sidebar.querySelector('.active');
    if (activePage) {
      // find section for active page
      activeSection = activePage.getAttribute('data-section');
    }

    // fullscreen sidenav expansion
    function sidenavAutoExpand(parent) {
      var element = parent.querySelector(
        '[data-section=' + activeSection + ']',
      );
      if (element && element.classList.contains('closed')) {
        element.classList.remove('closed');
      }
    }

    sidenavAutoExpand(sidebar);
    scrollToActiveSidebarItem();

    // for mobile sidebar, if sidebar is set, display proper item
    var mobileCurrentElement = mobileSidebar.querySelector(
      '[data-id=' + activeSection + ']',
    );
    if (
      mobileCurrentElement &&
      mobileCurrentElement.classList.contains('hidden')
    ) {
      mobileCurrentElement.classList.remove('hidden');
      mobileSidebarDefault.classList.add('hidden');
    }

    function setSidebar() {
      // if footer is in frame, removed fixed style (otherwise add it, if it doesn't exist)
      if (
        footer?.getBoundingClientRect?.()?.top - window.innerHeight <= 0 &&
        footer?.getBoundingClientRect?.()?.top >= window.innerHeight
      ) {
        if (sidebar?.classList?.contains?.('fixed')) {
          sidebar.classList.remove('fixed');
        }
      } else {
        if (!sidebar?.classList?.contains?.('fixed')) {
          sidebar.classList.add('fixed');
        }
      }

      // prevents display problems on very large screens with little content
      if (footer?.getBoundingClientRect?.()?.top <= window.innerHeight) {
        sidebar.style.height = footer.getBoundingClientRect().top - 70 + 'px';
      } else {
        sidebar.style.height = null;
      }
    }

    function scrollToActiveSidebarItem() {
      var activeEl = $('nav.sidebar .active')[0];
      var sidebarTop = $('nav.sidebar')[0].offsetTop;
      var activeElTop = activeEl && activeEl.offsetTop;
      var elementRelativeTop = activeElTop - sidebarTop;
      $('nav.sidebar').scrollTop(elementRelativeTop);
    }

    window.addEventListener('load', setSidebar);

    // allowing opening/closing of subnav elements
    var mainNavItems = Array.from(
      document.querySelectorAll('nav.sidebar .main-nav-item'),
    );
    var mobileNavItems = Array.from(
      document.querySelectorAll('nav.mobile-sidebar .main-nav-item'),
    );

    function enableAccordion(array) {
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
    }

    enableAccordion(mainNavItems);
    enableAccordion(mobileNavItems);
  });
})();

/**
 * highlightTocOnScroll sets up IntersectionObservers to watch for when a
 * headline comes into view when scrolling a page. When a headlines enters the
 * view, we check to see if it is in the right table of contents - if it is ->
 * highlight it.
 *
 * */
export function highlightTocOnScroll() {
  const sidebarItems = Array.from(document.querySelectorAll('.toc-entry a'));
  const sidebarItemsText = sidebarItems.map((i) => i.innerText);
  const headlinesToIgnore = ['no_toc', 'toc-heading', 'help-improve-header'];
  const allHeadlines = Array.from(
    document.querySelectorAll('h2, h3, h4, h5, h6'),
  ).filter(
    (item) =>
      ![...item.classList].some((className) =>
        headlinesToIgnore.includes(className),
      ),
  );

  // on click - add active class to clicked sidebar item.
  sidebarItems.forEach((clickedEntry) => {
    clickedEntry.addEventListener('click', () => {
      sidebarItems.forEach((el) => {
        el.classList.remove('active');
      });
      clickedEntry.classList.add('active');
    });
  });

  // https://caniuse.com/intersectionobserver
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      function (entry) {
        // check that 1) the item is visible/intersecting
        // and 2) that the sidebar items text actually has that headline before we make any changes.
        if (
          entry[0].isIntersecting === true &&
          sidebarItemsText.includes(entry[0].target.innerText)
        ) {
          let intersectingEntry = entry[0].target;
          let indexOfCurrentHeadline = allHeadlines.indexOf(intersectingEntry);
          sidebarItems.forEach((el) => el.classList.remove('active'));
          sidebarItems[indexOfCurrentHeadline].classList.add('active');
        }
      },
      { threshold: [1.0], rootMargin: '0px 0px -60% 0px' },
    );

    allHeadlines.forEach((headline) => {
      observer.observe(headline);
    });
  }

  // on page load, find the highest item in the article view port that is also
  // in the sidebar and then add active class to it.
  const firstHeadlineInViewport = allHeadlines.find(isElementInViewport);
  if (firstHeadlineInViewport) {
    sidebarItems.forEach((item) => {
      if (item.textContent === firstHeadlineInViewport.textContent) {
        item.classList.add('active');
      }
    });
  }
}
