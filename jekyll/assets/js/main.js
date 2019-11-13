//= require sidebar.js

// compiles an object of parameters relevant for analytics event tracking.
// takes an optional DOM element and uses additional information if present.
window.analyticsTrackProps = function (el) {
  var trackOpts = {
    path:      document.location.pathname,
    url:       document.location.href,
    referrer:  document.referrer,
    title:     document.title
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
var getSessionId = function () {
  if (!window.amplitude || !amplitude.getSessionId) {
    return -1;
  }
  return amplitude.getSessionId();
};

var setCookieMinutes = function (name, value, path, expiration) {
  // expiration is set in minutes
  var date = new Date();
  date.setMinutes(date.getMinutes() + expiration);
  date = date.toUTCString();

  document.cookie = name + "=" + value + "; path=" + path + "; expires=" + date;
};

// analytics.track wrapper
var trackEvent = function (name, properties, options, callback) {
  if (!window.analytics) {
    return;
  }

  analytics.track(name, properties, options, function () {
    setCookieMinutes("amplitude-session-id", getSessionId(), '/', 30);
    if (callback) {
      callback();
    }
  });
};

// analytics tracking for CTA button clicks
window.addEventListener('load', function () {
  var buttons = Array.from(document.querySelectorAll('[data-analytics-action]'));

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var action = this.getAttribute('data-analytics-action');
      if (!action) { return; }
      trackEvent(action, analyticsTrackProps(this));
    });
  });
});

function getUrlVars(url) {
  var myJson = {};
  var decodedParams = decodeURIComponent(url);
  var hashes = decodedParams.substr(1).split('&');
  hashes.forEach(function (items) {
    var hash = items.split('=');
    myJson[hash[0]] = hash[1];
  });

  return myJson;
};

/**
	* renderTabbed Images implements a "tabbing" behaviour on html elements.
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

  $(".tab").toArray().reduce(function (acc, curr) {

    /**
     * First, we sort each tab's classes to be reliable.
     * Unfortunately, other javascript can alter a tab element (ahem, highlight-js)
     * so, we split up the tab class name, sort it by what we need, and reassemble:
     * "language-javascript.tab.hello.some_code.highlighter-rouge"
     *                          ↓↓↓
     * "tab.hello.tabname.highlighter-rouge.language-javascript"
     */
    var currentClassList = [].slice.call(curr.classList)
    var indexOfTab = currentClassList.indexOf("tab")
    var newClassList = currentClassList.splice(indexOfTab, 3).concat(currentClassList)
    var tabGroup = newClassList[1]
    $(curr).removeClass().addClass(newClassList.join(" "))


    // Assign the formatted tabs into the datastructure.
    if (tabData[tabGroup] === undefined) {
      tabData[tabGroup] = {
        els: [curr],
        selector: "." + tabGroup,
        tabGroup: tabGroup
      }
    } else {
      tabData[tabGroup].els = tabData[tabGroup].els.concat([curr])
    }

    return tabData
  }, tabData)


  /**
    * Loop through the collected dom Tabs and handle:
    * 1) Building the actual tabs with HTML and setting their css styles
    * 2) Building the 'tab-switching behaviour.
    *
    * All tab switching is handled by css classes.
    */
  $.each(tabData, function (key, val) {
    var tabWrapperName = "tabWrapper-" + key;     // The wrapper for the entire switchable-content
    var tabGroupName = "tabGroup-" + key;         // Name for the group of tabs

    // Hide all tab content that doesn't belong to the first tab.
    $.each(val.els, function (idx, el) {
      if (idx !== 0) { $(el).hide() }
    })

    // Build HTML: create wrapper for each tab block and tab sub element
    $(val.selector).wrapAll($("<div>").addClass("tabWrapper " + tabWrapperName))
    // Build HTML: the tab group to hold multiple tabs
    $("." + tabWrapperName).append($("<div>").addClass("tabGroup " + tabGroupName))

    // Build the tabs for each tab-wrapper
    $.each(val.els, function (i, tabContent) {
      // Default the first value to be the "active tab"
      if (i === 0) {
        tabClass = "realtab " + tabContent.className + " realtab-active"
      } else {
        var tabClass = "realtab " + tabContent.className  // Derive the class for the tab.
      }

      // Build the tabs: the tab name is determined by the third css-class.
      var tabContentClasses = tabContent.className.split(" ")
      var tabName = tabContentClasses[2]
      $("." + tabGroupName)
        .append($("<div>")
          .addClass(tabClass)
          .text(tabName))
    })
  })

  // Handle tab toggling (styling active tab and finding content to show)
  $(".realtab").click(function (e) {
    $(e.target).siblings().removeClass("realtab-active")
    $(e.target).addClass("realtab-active")
    console.log("tab target it", e.target)
    var tabGroup = e.target.classList[2];
    var tabsToHide = ".tab." + tabGroup
    var tabToShow = ".tab." + e.target.className.split(" ").slice(2, 4).join(".")
    $(tabsToHide).not(".realtab").hide()
    $(tabToShow).not(".realtab").show()
  })
}

$( document ).ready(function() {

	// Allow navigation to slide open and close on small devices
	$("#nav-button").click(function(){
		event.preventDefault();

		$("#nav-button").toggleClass("open");
		$("nav.sidebar").toggleClass("open");
	});

	// Give article headings direct links to anchors
	$("article h2, article h3, article h4, article h5, article h6").filter("[id]").each(function () {
		$(this).append('<a href="#' + $(this).attr("id") + '"><i class="fa fa-link"></i></a>');
	});
	$("article h2, article h3, article h4, article h5, article h6").filter("[id]").hover(function () {
		$(this).find("i").toggle();
	});

  renderTabbedHtml();

	$.getJSON("/api/v1/me").done(function (userData) {
		analytics.identify(userData['analytics_id']);
	});
});
