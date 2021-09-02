function setUserData(userData) {
  window.userData = userData;
  // emit an event to let the system know that userData is ready/has changed
  const userDataReady = new CustomEvent("userDataReady");
  window.dispatchEvent(userDataReady);
}

function setLoggedIn(userData) {
  $(document.body).addClass("loggedin");
  Cookies.set("cci-customer", "true", { expires: 3650 });

  setUserData(userData);
}

function setLoggedOut() {
  $(document.body).removeClass("loggedin");
  Cookies.set("cci-customer", "false", { expires: 3650 });

  setUserData({});
}

$(function() {
  if (Cookies.get('cci-customer') === "true") {
    $(document.body).addClass("loggedin");
  }

  $.ajax({
    url: "https://circleci.com/api/v1/me",
    xhrFields: {
      withCredentials: true
    },
    dataType: "json",
    timeout: 10000 // 10 seconds
  }).done(function (userData) {
    setLoggedIn(userData);
    setAmplitudeId(); // set Amplitude required data
  }).fail(function () {
    setLoggedOut();
  });

});

/*
* The following functions are coming directly from the site.min.js
*/

function getSessionId() {
  var existingSessionId = Number(Cookies.get("amplitude-session-id"));

  // Number.isNaN polyfill:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
  var isNaN =
      Number.isNaN ||
      function (value) {
          return value !== value;
      };

  var isSessionIdValid = function (sessionId) {
      return !isNaN(sessionId);
  };

  return isSessionIdValid(existingSessionId) ? existingSessionId : Date.now();
};

function getIntegrationOptions(sessionId) {
  return {
      integrations: { Amplitude: { session_id: sessionId } },
  };
};

function setAmplitudeId() {
  const DAYS_PER_MINUTE = 1 / 24 / 60;
  const sessionId = getSessionId();

  Cookies.set("amplitude-session-id", sessionId, { expires: 30 * DAYS_PER_MINUTE });
  analytics.identify(userData.analytics_id, null, getIntegrationOptions(sessionId));
}