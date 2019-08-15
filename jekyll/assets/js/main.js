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

function renderTabbedCodeFences(){

	var tabGroupIndex = 0;

	while( true ){

		tabGroupIndex++;

		if( $( "div.highlighter-rouge.codetab." + tabGroupIndex ).length == 0 ){
			break;
		}

		var tabs = "";

		$( "div.highlighter-rouge.codetab." + tabGroupIndex ).each( function( index ){

			tabName = $( this )[0].classList.item(3);
			tabNameFixed = tabName.replace( /_/g, "." );
			tabNameFixed = tabNameFixed.replace( /-/g, " " );

			if( index != 0 ){
				$( this ).hide();
				$( this ).appendTo( "div.codetab-parent." + tabGroupIndex );
				tabs += "<li>" + tabNameFixed  + "</li>";
			}else{
				$( this ).wrap( '<div class="codetab-parent ' + tabGroupIndex + '"></div>' );
				tabs += '<li class="active">' + tabNameFixed  + '</li>';
			}
		});

		$( "div.codetab-parent." + tabGroupIndex ).prepend( "<ul>" + tabs  + "</ul>" );
		$( "div.codetab-parent." + tabGroupIndex + " li" ).click(function(){

			curIndex = $( this ).parent().parent()[0].classList.item(1);
			which = $( "div.codetab-parent." + curIndex + " li" ).index( $( this ) );
			$( "div.codetab-parent." + curIndex + " li" ).removeClass( "active" );
			$( this ).addClass( "active" );
			$( "div.highlighter-rouge.codetab." + curIndex ).hide();
			$( "div.highlighter-rouge.codetab." + curIndex ).eq( which ).show();
		});
	}
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

	renderTabbedCodeFences();

	$.getJSON("/api/v1/me").done(function (userData) {
		analytics.identify(userData['analytics_id']);
	});
});
