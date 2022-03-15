import Cookies from 'js-cookie';
import { COOKIE_KEY } from './optimizely';
import { v4 as uuidv4 } from 'uuid';

const trackExperimentEntry = () => {
  let orgId = Cookies.get(COOKIE_KEY) ?? null;
  window.OptimizelyClient.getUserId(true).then((userData) => {
    const userId = userData.id;

    // transforms a doc link into a page identifier
    // for example: https://ui.circleci.com/docs/2.0/migrating-from-github/
    // will be transformed into 'migrating-from-github'
    const page = window.location.pathname.replace('/docs/', '').split('/');

    // if we get a userId from the analyticsId, the orgId is required
    if (userData.source === 'analyticsId' && userId && orgId) {
      const properties = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId,
        orgId: orgId,
      };

      // we send one event first for all pages
      window.AnalyticsClient.trackAction('Experiment Entry', {
        ...properties,
        pageName: 'docs-all',
      });

      // and then one event for the current page
      window.AnalyticsClient.trackAction('Experiment Entry', {
        ...properties,
        pageName: `docs-${page[page.length - 2] ?? 'homepage'}`,
      });
    } else if (userData.source === 'anonymousId' && userId) {
      const properties = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        anonymous_id: userData.id,
      };

      // we send one event first for all pages
      window.AnalyticsClient.trackAction('Experiment Entry', {
        ...properties,
        pageName: 'docs-all',
      });

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
