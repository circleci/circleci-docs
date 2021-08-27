import * as optimizelySDK from '@optimizely/optimizely-sdk';

const COOKIE_KEY = 'cci-org-analytics-id';
const LOCAL_STORAGE_KEY = 'ajs_user_id';

const getUserId = () => {
  // if possible I would not want to rely on this but window.userData is not always available
  let userId = localStorage.getItem(LOCAL_STORAGE_KEY);
  return userId ? userId.replaceAll('"', '') : null;
};

const getOrgId = () => {
  return Cookies.get(COOKIE_KEY) || null;
};

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
      const userId = getUserId();
      const orgId = getOrgId();

      if (!userId || !orgId) {
        return resolve(null);
      }

      if (!options || !options.featureName || !options.groupExperimentName) {
        return reject({error: "Missing required options"});
      }

      this.client.onReady().then(() => {
        // first check if user is not in the provided exclusion group
        const isInGrowthExperimentGroup = this.client.getVariation(options.groupExperimentName, userId, {
          id: userId,
          $opt_bucketing_id: orgId,
        });

        if (isInGrowthExperimentGroup === "treatment") {
          // the check if the user is in the experiment or not
          const variationName = this.client.getVariation(options.featureName, userId, {
            id: userId,
            $opt_bucketing_id: orgId,
          });
          return resolve(variationName);
        } else {
          return resolve(null);
        }
      });

    });
  }
}

export default OptimizelyClient;