import * as optimizelySDK from '@optimizely/optimizely-sdk';
const COOKIE_KEY = 'cci-org-analytics-id';

class OptimizelyClient {
  constructor() {
    this.client = optimizelySDK.createInstance({
      datafile: window.optimizelyDatafile,
    });
  }
  getUserId() {
    return new Promise((resolve) => {
      if (window.userData) {
        // if we already have userData
        resolve((window.userData.analytics_id) ? window.userData.analytics_id : null);
      } else {
        // If we are here it means we are still waiting on getting notified
        // that the call to /api/v1/me has resolved and the new userData is available
        window.addEventListener("userDataReady", () => {
          resolve((window.userData.analytics_id) ? window.userData.analytics_id : null);
        });
      }
    })
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
      // First we check that the required options are provided
      if (!options || !options.experimentKey || !options.groupExperimentName) {
        return reject({error: "Missing required options"});
      }

      // Then, we check if we have the cookie. If the cookie is not present
      // it means the current user is not ready to see an experiment and so
      // getVariationName() will resolve to "null"
      const orgId = Cookies.get(COOKIE_KEY) ?? null;
      if (!orgId) {
        return resolve(null);
      }

      // once we have the userId
      this.getUserId().then((userId) => {
        if (!userId) {
          return resolve(null);
        }

        // When optimizely SDK is ready to be used
        this.client.onReady({
          timeout: 10000 // Optimizely default is 30s so we are reducing it to 10s
        }).then(() => {

          // We check if user whether the user is in the provided
          // exclusion group or not
          const isInGrowthExperimentGroup = this.client.getVariation(options.groupExperimentName, userId, {
            id: userId,
            $opt_bucketing_id: orgId,
          });

          // If the user is not in the exclusion group
          if (isInGrowthExperimentGroup === "treatment") {
            // We ask optimizely which variation is assigned to this user
            // In most cases it will return either "null", "control" or "treatment"
            const variationName = this.client.getVariation(options.experimentKey, userId, {
              id: userId,
              $opt_bucketing_id: orgId,
            });
            resolve(variationName);
          } else {
            // If the user is in the exclusion group it means the current user
            // should not the the exepriment so getVariationName() will resolve to "null"
            resolve(null);
          }
        }).catch(() => {
          // If Optimizely is not ready after the timeout period it means that
          // either optimizely is not available or blocked and so getVariationName() will resolve to "null"
          // so the developer can force "control" on its end
          resolve(null);
        });
      });
    });
  }
}

export default OptimizelyClient;