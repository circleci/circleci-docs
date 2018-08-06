// making sidebar stick when touching footer
// this improves the visual experience while interacting with the docs site
(function () {
  var footer = document.querySelector('.footer');
  var sidebar = document.querySelector('.sidebar');

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
}());