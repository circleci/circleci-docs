import * as optimizelySDK from '@optimizely/optimizely-sdk';
import { v4 as uuidv4 } from 'uuid';
import { isProduction } from '../utils';
import Cookies from 'js-cookie';

export const COOKIE_KEY = 'cci-org-analytics-id';
export const STORAGE_KEY = 'growth-experiments-participated';
const optimizelyLogLevel = isProduction() ? 'error' : 'info';
optimizelySDK.setLogLevel(optimizelyLogLevel);

class OptimizelyClient {
  constructor() {
    this.client = optimizelySDK.createInstance({
      datafile: window.optimizelyDatafile,
    });
  }
  getUserId(isGuestExperiment) {
    return new Promise((resolve) => {
      if (window.userData) {
        // if we already have userData
        resolve(
          window.userData.analytics_id ? window.userData.analytics_id : null,
        );
      } else if (isGuestExperiment) {
        let anonymousId = null;
        try {
          // Analytics.js generates a universally unique ID (UUID) for the viewer during the library’s initialization phase
          // and sets this as anonymousId for each new visitor.
          // This call is always valid and will never return null. From the docs:
          // If the user’s anonymousId is null (meaning not set) when you call this function, Analytics.js automatically generated and sets a new anonymousId for the user.
          anonymousId = analytics.user().anonymousId();
        } finally {
          resolve(anonymousId);
        }
      } else {
        // If we are here it means we are still waiting on getting notified
        // that the call to /api/v1/me has resolved and the new userData is available
        window.addEventListener('userDataReady', () => {
          resolve(
            window.userData.analytics_id ? window.userData.analytics_id : null,
          );
        });
      }
    });
  }

  // Experiment entered tracking
  getTrackExperimentEntry() {
    let orgId = Cookies.get(COOKIE_KEY) ?? null;
    this.getUserId().then((userId) => {
      trackExperimentEntry(userId, orgId, 'docs');
    });
  }

  // getVariationName is always guaranteed to resolve with either "null" or a variation name.
  // This is consistent to what getVariation from the optimizely-sdk does.
  //
  // It will return "null" in different cases:
  // - User doesn't have the `cci-org-analytics-id` cookie yet
  // - User is a guest user and not logged in app.circleci.com
  // - api/v1/me takes longer than 10s to respond
  // - Optimizely takes longer than 10s to load (if unavailable or blocked)
  // - User is in the exclusion group
  getVariationName(options) {
    return new Promise((resolve, reject) => {
      if (typeof forceAll === 'function' && forceAll()) {
        return resolve('treatment');
      }

      // First we check that the required options are provided
      if (
        !options ||
        !options.experimentKey ||
        !options.groupExperimentName ||
        !options.experimentContainer
      ) {
        return reject({ error: 'Missing required options' });
      }

      // defines additional attributes we will want to send to optimizely to qualify/disqualify a user
      const attributes = options.attributes ?? {};

      // capture if we are trying to run this experiment as a guest experiment
      // default to false as most of our experiments are for logged in users
      const isGuestExperiment = options.guestExperiment ?? false;

      // Then, we check if we have the cookie. If the cookie is not present
      // it means the current user is not ready to see an experiment and so
      // getVariationName() will resolve to "null"
      let orgId = Cookies.get(COOKIE_KEY) ?? null;
      if (!isGuestExperiment && !orgId) {
        return resolve(null);
      }

      // orgId is used as a localstorage key but since a guest doesn't have an org attached yet
      // we create a "default" one
      if (isGuestExperiment) {
        orgId = 'no-org-id';
      }

      // once we have the userId
      this.getUserId(isGuestExperiment).then((userId) => {
        if (!userId) {
          return resolve(null);
        }

        // When optimizely SDK is ready to be used
        this.client
          .onReady({
            timeout: 10000, // Optimizely default is 30s so we are reducing it to 10s
          })
          .then(() => {
            let optimizelyAttributes = {
              ...attributes,
              id: userId,
            };

            // if we are not in a guest experiment, we need to bucket by orgId
            // so users from the same org see the same variation
            if (!isGuestExperiment) {
              optimizelyAttributes.$opt_bucketing_id = orgId;
            }

            // We check whether the user is in the provided exclusion group or not
            const isInGrowthExperimentGroup = this.client.getVariation(
              options.groupExperimentName,
              userId,
              optimizelyAttributes,
            );

            // If the user is not in the exclusion group
            if (isInGrowthExperimentGroup === 'treatment') {
              // We ask optimizely which variation is assigned to this user
              // In most cases it will return either "null", "control" or "treatment"
              const variationName = this.client.getVariation(
                options.experimentKey,
                userId,
                optimizelyAttributes,
              );

              // send back variationName to caller
              resolve(variationName);

              // grab experimentId and variationId so we can send it
              // with the `Experiment Viewed` event
              const optimizelyConfig = this.client.getOptimizelyConfig();
              const experimentId =
                optimizelyConfig.experimentsMap[options.experimentKey].id ?? '';
              const variationId =
                optimizelyConfig.experimentsMap[options.experimentKey]
                  .variationsMap[variationName].id ?? '';

              trackExperimentViewed(
                orgId,
                options.experimentKey,
                options.experimentContainer,
                experimentId,
                variationName,
                variationId,
                userId,
                isGuestExperiment,
              );
            } else {
              // If the user is in the exclusion group it means the current user
              // should not the the exepriment so getVariationName() will resolve to "null"
              resolve(null);
            }
          })
          .catch(() => {
            // If Optimizely is not ready after the timeout period it means that
            // either optimizely is not available or blocked and so getVariationName() will resolve to "null"
            // so the developer can force "control" on its end
            resolve(null);
          });
      });
    });
  }
}

// trackExperimentViewed checks if we alredy have sent the Experiment Viewed
// event to segment/amplitude by looking into the localstorage.
// If not, it builds the properties needed and call trackAction with it
export const trackExperimentViewed = (
  orgId,
  experimentKey,
  experimentContainer,
  experimentId,
  variationName,
  variationId,
  userId,
  isGuestExperiment,
) => {
  // don't track user if the experiment is not present in the current page
  if (!$(experimentContainer).length) {
    return;
  }

  if (!isExperimentAlreadyViewed(orgId, experimentKey)) {
    const properties = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      experimentId,
      experimentName: experimentKey,
      allocationType: isGuestExperiment ? 'user_id' : 'organization_id',
      orgId: isGuestExperiment ? null : orgId,
      projectId: null, // This experiment is measured at the org level
      userId,
      variationId,
      variationName,
    };

    // send event with the properly formatted properties
    window.AnalyticsClient.trackAction('Experiment Viewed', properties);

    // store experiment participation in localstorage
    storeExperimentParticipation(orgId, experimentKey, variationName);
  }
};

// isExperimentAlreadyViewed checks in the localstorage if we already
// marked the experiment as viewed
export const isExperimentAlreadyViewed = (orgId, experimentKey) => {
  try {
    const experiments = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return (
      Object.prototype.hasOwnProperty.call(experiments, orgId) &&
      Object.prototype.hasOwnProperty.call(experiments[orgId], experimentKey)
    );
  } catch (_) {
    // Uglify /w browserlist force us to do catch (_)
    return false;
  }
};

// storeExperimentParticipation stores the experiment variationName in the
// localstorage
export const storeExperimentParticipation = (
  orgId,
  experimentKey,
  variationName,
) => {
  if (!orgId || !experimentKey || !variationName) {
    return;
  }

  // get exepriments out of localstorage
  let experiments;
  try {
    experiments = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch (_) {
    // Uglify /w browserlist force us to do catch (_)
    experiments = {};
  }

  // if we have nothing we start de build the `experiments` object
  if (!experiments[orgId]) {
    experiments[orgId] = {};
  }
  if (!experiments[orgId][experimentKey]) {
    experiments[orgId][experimentKey] = {};
  }

  // assign the current experiment and its values
  experiments[orgId][experimentKey] = {
    variationName,
    createdAt: new Date().getTime(),
  };

  try {
    // setItem will sometimes fail with a "Quota Exceeded" exception if users have custom configurations
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
  } catch (_) {
    // Uglify /w browserlist force us to do catch (_)
    // We're deliberately ignoring it so that it doesn't break the app. It'll mean a few extra
    // events are emitted, but I think that's the lesser issue.
  }
};

export const trackExperimentEntry = (userId, orgId, projectId) => {
  if (userId && orgId) {
    const properties = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId,
      orgId,
      projectId,
    };
    window.AnalyticsClient.trackAction('Experiment Entry', properties);
  }
};

export default OptimizelyClient;
