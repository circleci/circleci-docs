import * as optimizelySDK from '@optimizely/optimizely-sdk';
const COOKIE_KEY = 'cci-org-analytics-id';

class OptimizelyClient {
  constructor() {
    this.client = optimizelySDK.createInstance({
      datafile: window.optimizelyDatafile,
    });
  }
  // When the promise resolves, it can either be with null or with a variation name.
  // This is consistent to what getVariation from the optimizely-sdk does
  getVariationName(options) {
    return new Promise((resolve, reject) => {
      window.addEventListener("userDataReady", () => {
        const userId = (window.userData && window.userData.analytics_id) ? window.userData.analytics_id : null;
        const orgId = Cookies.get(COOKIE_KEY) ?? null;

        if (!userId || !orgId) {
          return resolve(null);
        }

        if (!options || !options.experimentKey || !options.groupExperimentName) {
          return reject({error: "Missing required options"});
        }

        this.client.onReady().then(() => {
          // first check if user is not in the provided exclusion group
          const isInGrowthExperimentGroup = this.client.getVariation(options.groupExperimentName, userId, {
            id: userId,
            $opt_bucketing_id: orgId,
          });

          if (isInGrowthExperimentGroup === "treatment") {
            // then check if the user is in the experiment or not
            const variationName = this.client.getVariation(options.experimentKey, userId, {
              id: userId,
              $opt_bucketing_id: orgId,
            });
            resolve(variationName);
          } else {
            resolve(null);
          }
        });
      });
    });
  }
}

export default OptimizelyClient;