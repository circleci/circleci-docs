import Cookies from 'js-cookie';
import { COOKIE_KEY } from './optimizely';
import { v4 as uuidv4 } from 'uuid';

const trackExperimentEntry = () => {
  let orgId = Cookies.get(COOKIE_KEY) ?? null;
  const anonymousId = window.OptimizelyClient.getAnonymousId();

  window.OptimizelyClient.getUserId().then((userId) => {

    let properties = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    // if we get a userId, the orgId is required
    if (userId && orgId) {
      properties = {
        ...properties,
        userId,
        orgId,
      };
    } else if (anonymousId) {
      properties = {
        ...properties,
        anonymous_id: anonymousId,
      };
    }

    if (properties.userId || properties.anonymous_id) {
      // we send one event first for all pages
      window.AnalyticsClient.trackAction('Experiment Entry', {
        ...properties,
        pageName: 'docs-all',
      });

      // transforms a doc link into a page identifier
      // for example: https://ui.circleci.com/docs/2.0/migrating-from-github/
      // will be transformed into 'migrating-from-github'
      const page = window.location.pathname.replace('/docs/', '').split('/');

      // and then one event for the current page
      window.AnalyticsClient.trackAction('Experiment Entry', {
        ...properties,
        pageName: `docs-${page[page.length - 2] ?? 'homepage'}`,
      });
    }
  });
};

export function init() {
  trackExperimentEntry();
}
