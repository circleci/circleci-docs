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
}());