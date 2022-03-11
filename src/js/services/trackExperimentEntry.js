import Cookies from 'js-cookie';
import { COOKIE_KEY } from './optimizely';
import { v4 as uuidv4 } from 'uuid';

const trackExperimentEntry = () => {
  let orgId = Cookies.get(COOKIE_KEY) ?? null;
  window.OptimizelyClient.getUserId().then((userId) => {
    if (userId && orgId) {
      const projectId = 'docs';

      const properties = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId,
        orgId,
        projectId,
      };
      window.AnalyticsClient.trackAction('Experiment Entry', properties);
    }
  });
};

export function init() {
  trackExperimentEntry();
}
