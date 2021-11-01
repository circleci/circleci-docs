import { createPopper } from '@popperjs/core';

hljs.initHighlightingOnLoad();

// compiles an object of parameters relevant for analytics event tracking.
// takes an optional DOM element and uses additional information if present.
window.analyticsTrackProps = function (el) {
  var trackOpts = {
    path: document.location.pathname,
    url: document.location.href,
    referrer: document.referrer,
    title: document.title,
  };

  var userLogin = window.userData && window.userData['login'];
  if (userLogin) {
    trackOpts['user'] = userLogin;
  }

  if (el) {
    var text = $.trim($(el).text());
    if (text) {
      trackOpts['cta_text'] = text;
    }
  }

  return trackOpts;
};

// amplitude.getSessionId wrapper with reference guard
// eslint-disable-next-line no-unused-vars
var getSessionId = function () {
  if (!window.amplitude || !amplitude.getSessionId) {
    return -1;
  }
  return amplitude.getSessionId();
};

// analytics tracking for CTA button clicks
window.addEventListener('load', function () {
  var buttons = Array.from(
    document.querySelectorAll('[data-analytics-action]'),
  );

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var action = this.getAttribute('data-analytics-action');
      if (!action) {
        return;
      }
      trackEvent(action, analyticsTrackProps(this));
    });
  });
});

// eslint-disable-next-line no-unused-vars
function getUrlVars(url) {
  var myJson = {};
  var decodedParams = decodeURIComponent(url);
  var hashes = decodedParams.substr(1).split('&');
  hashes.forEach(function (items) {
    var hash = items.split('=');
    myJson[hash[0]] = hash[1];
  });

  return myJson;
}

function detectScrollbar(element) {
  if (element.prop('scrollWidth') > element.prop('offsetWidth')) {
    element.siblings('.tab').css('margin-top', '15px');
  }
}

function renderVersionBlockPopover() {
  var badges = document.querySelectorAll('.server-version-badge');

  badges.forEach(function (badge) {
    let popperInstance = null;

    function create() {
      popperInstance = createPopper(badge, tooltip, {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      });
    }

    function destroy() {
      if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
      }
    }

    function show() {
      tooltip.setAttribute('data-show', '');
      // change tooltip text based on current button popover.
      tooltip.innerHTML =
        'This document is applicable to CircleCI ' +
        badge.innerText +
        "<div id='arrow' data-popper-arrow></div>";
      create();
    }

    function hide() {
      tooltip.removeAttribute('data-show');
      destroy();
    }

    var showEvents = ['mouseenter', 'focus'];
    var hideEvents = ['mouseleave', 'blur'];

    showEvents.forEach((event) => {
      badge.addEventListener(event, show);
    });

    hideEvents.forEach((event) => {
      badge.addEventListener(event, hide);
    });
  });
}

/**
 * renderTabbedHtml implements a "tabbing" behaviour on html elements.
 * Tabs are implemented using css classes. Proper usage looks like so:
 * <div class="tab $tab-group $tab-name", or kramdown: {:.tab.$tab-group.$tab-name}
 *
 * The function performs the following:
 * * Find all tabs in the DOM and group them into a datastructure
 * * Loop through the collected tabs and wrap them in a HTML tab structure.
 * * Apply click behaviour to toggle hide/showing of the tab's content.
 * *
 *
 *
 */
function renderTabbedHtml() {
  var tabData = {};
  // Turns __ into `.` in tab names useful for turning say `config_2__1` into `config 2.1`
  var deSlugTabName = function (name) {
    return name.replace(/__/g, '.').replace(/_/g, ' ');
  };

  $('.tab')
    .toArray()
    .reduce(function (acc, curr) {
      /**
       * First, we sort each tab's classes to be reliable.
       * Unfortunately, other javascript can alter a tab element (ahem, highlight-js)
       * so, we split up the tab class name, sort it by what we need, and reassemble:
       *
       * "language-javascript.tab.tabgroup.tabname.highlighter-rouge"
       *                          ↓↓↓
       * "tab.tabgroup.tabname.highlighter-rouge.language-javascript"
       */
      var currentClassList = [].slice.call(curr.classList);
      var indexOfTab = currentClassList.indexOf('tab');
      var newClassList = currentClassList
        .splice(indexOfTab, 3)
        .concat(currentClassList);
      var tabGroup = newClassList[1];
      $(curr).removeClass().addClass(newClassList.join(' '));

      // Assign the formatted tabs into the datastructure.
      if (tabData[tabGroup] === undefined) {
        tabData[tabGroup] = {
          els: [curr],
          selector: '.' + tabGroup,
          tabGroup: tabGroup,
        };
      } else {
        tabData[tabGroup].els = tabData[tabGroup].els.concat([curr]);
      }

      return tabData;
    }, tabData);

  /**
   * Loop through the collected dom Tabs and handle:
   * 1) Building the actual tabs with HTML and setting their css styles
   * 2) Building the 'tab-switching behaviour.
   *
   * All tab switching is handled by css classes.
   */
  $.each(tabData, function (key, val) {
    var tabWrapperName = 'tabWrapper-' + key; // The wrapper for the entire switchable-content
    var tabGroupName = 'tabGroup-' + key; // Name for the group of tabs

    // Hide all tab content that doesn't belong to the first tab.
    $.each(val.els, function (idx, el) {
      if (idx !== 0) {
        $(el).hide();
      }
    });

    // Build HTML: create wrapper for each tab block and tab sub element
    $(val.selector).wrapAll(
      $('<div>').addClass('tabWrapper ' + tabWrapperName),
    );
    // Build HTML: the tab group to hold multiple tabs
    $('.' + tabWrapperName).append(
      $('<div>').addClass('tabGroup ' + tabGroupName),
    );

    // Build the tabs for each tab-wrapper
    $.each(val.els, function (i, tabContent) {
      // Default the first value to be the "active tab"
      if (i === 0) {
        tabClass = 'realtab ' + tabContent.className + ' realtab-active';
      } else {
        var tabClass = 'realtab ' + tabContent.className; // Derive the class for the tab.
      }

      // Build the tabs: the tab name is determined by the third css-class.
      var tabContentClasses = tabContent.className.split(' ');
      var tabName = tabContentClasses[2];
      $('.' + tabGroupName).append(
        $('<div>').addClass(tabClass).text(deSlugTabName(tabName)),
      );
    });
  });

  // Handle tab toggling (styling active tab and finding content to show)
  $('.realtab').click(function (e) {
    $(e.target).siblings().removeClass('realtab-active');
    $(e.target).addClass('realtab-active');
    var tabGroup = e.target.classList[2];
    var tabsToHide = '.tab.' + tabGroup;
    var tabToShow =
      '.tab.' + e.target.className.split(' ').slice(2, 4).join('.');
    $(tabsToHide).not('.realtab').hide();
    $(tabToShow).not('.realtab').show();
  });

  $('.tabGroup').each(function () {
    detectScrollbar($(this));
  });
}

$(document).ready(function () {
  // Allow navigation to slide open and close on small devices
  $('#nav-button').click(function (event) {
    event.preventDefault();

    $('#nav-button').toggleClass('open');
    $('nav.sidebar').toggleClass('open');
  });

  var tooltip = document.querySelector('.tooltip-popover');

  // Give article headings direct links to anchors
  $('article h1, article h2, article h3, article h4, article h5, article h6')
    .filter('[id]')
    .each(function () {
      var isMainTitle = $(this).prop('nodeName') === 'H1';
      $(this).append(
        (isMainTitle ? ' <a href="#' : '<a href="#' + $(this).attr('id')) +
          '"><i class="fa fa-link"></i></a>',
      );
      if (isMainTitle) {
        $(this).find('i').toggle();
      }
    });

  var showEvents = ['mouseover', 'hover', 'mouseenter', 'focus'];
  var hideEvents = ['mouseout', 'mouseleave', 'blur'];
  var clickEvents = ['click'];

  var makePopper = (icon) =>
    Object.assign(icon, {
      show() {
        tooltip.setAttribute('data-show', '');
        // change tooltip text based on current button popover.
        tooltip.innerHTML = "Copy link<div id='arrow' data-popper-arrow></div>";
        icon.instance = createPopper(icon, tooltip, {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        });
        window.AnalyticsClient.trackAction('docs-share-button-hover', {
          page: location.pathname,
          success: true,
        });
      },
      copy(event) {
        event.preventDefault();
        navigator?.clipboard
          .writeText(event.target.href)
          .then(() => {
            icon.hide();
            tooltip.setAttribute('data-show', '');
            // change tooltip text based on current button popover.
            tooltip.innerHTML =
              "Copied!<div id='arrow' data-popper-arrow></div>";
            icon.instance = createPopper(icon, tooltip, {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            });
            window.history.pushState({}, document.title, event.target.href);
            window.AnalyticsClient.trackAction('docs-share-button-click', {
              page: location.pathname,
              success: true,
            });
          })
          .catch((error) =>
            window.AnalyticsClient.trackAction('docs-share-button-click', {
              page: location.pathname,
              success: false,
              error,
            }),
          );
      },
      hide() {
        tooltip.removeAttribute('data-show');
        if (icon.instance) {
          icon.instance.destroy();
          icon.instance = null;
        }
      },
    });

  // https://app.optimizely.com/v2/projects/16812830475/experiments/20631440733/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_share_section_icon_test',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test',
  }).then((variation) => {
    if (variation === 'treatment') {
      document.querySelectorAll('.fa-link').forEach((icon) => {
        makePopper(icon);

        showEvents.forEach((event) => {
          icon.parentElement.addEventListener(event, icon.show);
        });

        hideEvents.forEach((event) => {
          icon.parentElement.addEventListener(event, icon.hide);
        });

        clickEvents.forEach((event) => {
          icon.parentElement.addEventListener(event, icon.copy);
        });
      });
    }
  });

  $('article h1, article h2, article h3, article h4, article h5, article h6')
    .filter('[id]')
    .hover(function () {
      $(this).find('i').toggle();
    });

  renderTabbedHtml();
  renderVersionBlockPopover();

  // $.getJSON("/api/v1/me").done(function (userData) {
  // 	analytics.identify(userData['analytics_id']);
  // });
});

$(document).ready(function () {
  $('#main a')
    .not('.no-external-icon')
    .each(function () {
      $(this).wrap("<div class='external-link-tag-wrapper'></div>");
      var inlineSVG =
        '<span class="external-link-icon"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M9.33318 10.6667H1.33318V2.66667H4.66651V1.33333H0.959845C0.699845 1.32667 0.453179 1.42 0.273179 1.6C0.086512 1.77333 -0.00682137 2.02 -0.000154701 2.27333V11.0667C-0.00682137 11.32 0.086512 11.56 0.273179 11.74C0.453179 11.92 0.706512 12.0133 0.959845 12.0067H9.70651C10.2398 12.0067 10.6665 11.5867 10.6665 11.0667V7.33333H9.33318V10.6667ZM9.72651 1.33333H7.33318C6.96651 1.33333 6.66651 1.03333 6.66651 0.666667C6.66651 0.3 6.96651 0 7.33318 0H11.3332C11.6998 0 11.9998 0.3 11.9998 0.666667V4.66667C11.9998 5.03333 11.6998 5.33333 11.3332 5.33333C10.9665 5.33333 10.6665 5.03333 10.6665 4.66667V2.27333L7.91985 5.02C7.65985 5.28 7.23985 5.28 6.97985 5.02C6.71985 4.76 6.71985 4.34 6.97985 4.08L9.72651 1.33333Z" fill="currentColor"></path></svg></span>';
      if (!this.origin.includes(window.location.origin)) {
        $(inlineSVG).appendTo(this);
        $(this).attr('target', '_blank');
        $(this).attr('rel', 'noopener noreferrer');
      }
    });
});
