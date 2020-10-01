// SUBNAV ACTIVE STATE
// This function controls whether a subnav list item contains the active class or not.
// This is necessary because of complications with comparing variables in Liquid

function getAnchorPositions (anchorArray) {
  return anchorArray.map(function (anchor) {
    return anchor.getBoundingClientRect().top;
  });
};

function getActiveAnchor (anchorPositions) {
  return anchorPositions.filter(function (item) {
    return item <= 100; // why 100? This value provides a cushion that accounts for the nav when determining state
  }).length - 1;
};

function getArrayFrom (query) {
  return Array.from(document.querySelectorAll(query));
};

function removeClasses (list, lClass) {
  list.forEach(function (item) { 
    item.classList.remove(lClass);
  });
};

function setActiveAnchor (index, elementArray) {
  removeClasses(elementArray, 'active');
  if (elementArray[index]) {
    elementArray[index].parentElement.setAttribute('data-active', elementArray[index].getAttribute('data-value'));
    elementArray[index].classList.add('active');
  }
};

(function () {
  window.addEventListener('scroll', function () { 
    setActiveAnchor(getActiveAnchor(getAnchorPositions(getArrayFrom('.anchor'))), getArrayFrom('[data-subnav-item]'))
  });

  window.addEventListener('load', function () {
    setActiveAnchor(getActiveAnchor(getAnchorPositions(getArrayFrom('.anchor'))), getArrayFrom('[data-subnav-item]'));

    var subnav = document.querySelector('.component.subnav');
    var topNavOffsetParam = subnav.getAttribute('data-top-nav-offset');
    var topNavOffset = topNavOffsetParam ? parseInt(topNavOffsetParam, 10) : 70;
    
    // add delayed fixed-state, if included
    if (subnav && subnav.classList.contains('dynamic-fixed')) {

      var jumpNav = function () {
        var placeholder = document.getElementById('subnav-placeholder');

        placeholder.style.height = subnav.clientHeight + 'px';

        if (placeholder.getBoundingClientRect().top <= topNavOffset) {
          subnav.classList.add('js-fixed');
        } else {
          subnav.classList.remove('js-fixed');
        }
      };
      jumpNav();
      window.addEventListener('scroll', jumpNav);
    }

    if (subnav) {
      getArrayFrom('[data-subnav-item]').forEach(function (item, i) {
        if (item.getAttribute('data-value') === item.parentElement.getAttribute('data-active')) {
          item.classList.add('active');
        }
      });
    }
  });
}());