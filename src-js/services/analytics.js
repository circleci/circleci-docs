import Cookies from 'js-cookie';

class AnalyticsClient {
  static getSessionId() {
    var existingSessionId = Number(Cookies.get('amplitude-session-id'));

    // Number.isNaN polyfill:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
    const isNaN = Number.isNaN || ((value) => value !== value);
    return !isNaN(existingSessionId) ? existingSessionId : Date.now();
  }

  /**
   * Thin wrapper function around Segment Analytics track method
   * @param name  Name of the action the current user performed.
   * @param properties  A bag of metadata to send to Segment/Amplitude.
   */
  static trackAction(name, properties) {
    if (isDataDogSynthetics()) return;

    properties = properties ?? null;
    window.analytics &&
      window.analytics.track(name, properties, {
        integrations: {
          Amplitude: { session_id: AnalyticsClient.getSessionId() },
        },
      });
  }

  /**
   * Thin wrapper function around Segment Analytics identify method
   * @param userData  A dictionary of traits you know about the user, like their email, name, source.
   * @param traits  Data about the current user session including source.
   */
  static trackUser(id, traits) {
    if (isDataDogSynthetics()) return;

    traits = traits ?? null;
    window.analytics &&
      window.analytics.identify(id, traits, {
        integrations: {
          Amplitude: { session_id: AnalyticsClient.getSessionId() },
        },
      });
  }

  /**
   * Thin wrapper function around Segment Analytics page method
   * @param name  Name of the page the current user viewed.
   * @param properties  A bag of metadata to send to Segment/Amplitude.
   */
  static trackPage(name, properties) {
    if (isDataDogSynthetics()) return;

    properties = properties ?? null;
    window.analytics &&
      window.analytics.page('docs', name, properties, {
        integrations: {
          Amplitude: { session_id: AnalyticsClient.getSessionId() },
        },
      });
  }
}

const isDataDogSynthetics = () => window._DATADOG_SYNTHETICS_BROWSER === true;

export default AnalyticsClient;

// legacy tracking code:
// This is still used in the src-shared/*.js.
// analytics.track wrapper

const setCookieMinutes = (name, value, path, expiration) => {
  // expiration is set in minutes
  let date = new Date();
  date.setMinutes(date.getMinutes() + expiration);
  date = date.toUTCString();
  document.cookie = name + '=' + value + '; path=' + path + '; expires=' + date;
};

const trackEvent = (name, properties, options, callback) => {
  if (!window.analytics) {
    return;
  }

  analytics.track(name, properties, options, function () {
    setCookieMinutes('amplitude-session-id', getSessionId(), '/', 30);
    if (callback) {
      callback();
    }
  });
};

window.trackEvent = trackEvent; // enable use in src-shared files.
