// making sidebar stick when touching footer
// this improves the visual experience while interacting with the docs site
(function () {
  var footer = document.querySelector('.footer');
  var sidebar = document.querySelector('.sidebar');

  // get hash, if it exists
  if (window.location.hash && window.location.hash.indexOf('section') > -1) {
    var section = getUrlVars(window.location.hash);
    localStorage.sidenavActive = section['section']
  }
  if (localStorage.sidenavActive) {
    var element = sidebar.querySelector('[data-section=' + localStorage.sidenavActive + ']');
    if (element.classList.contains('closed')) {
      element.classList.remove('closed');
    }
  }

  window.addEventListener('scroll', function () {
    // if footer is in frame, removed fixed style (otherwise add it, if it doesn't exist)
    if ((footer.getBoundingClientRect().top - window.innerHeight) <= 0) {
      if (sidebar.classList.contains('fixed')) {
        sidebar.classList.remove('fixed');
      }
    } else {
      if (!sidebar.classList.contains('fixed')) {
        sidebar.classList.add('fixed');
      }
    }
  });

  // allowing opening/closing of subnav elements
  var mainNavItems = Array.from(document.querySelectorAll('nav.sidebar .main-nav-item'));

  mainNavItems.forEach(function (item) {
    var listWrap = item.querySelector('.list-wrap');
    listWrap.addEventListener('click', function () {
      if (item.classList.contains('closed')) {
        item.classList.remove('closed');
      } else {
        item.classList.add('closed');
      }
    });
  });
}());