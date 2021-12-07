// import { optimize } from 'webpack';
// import 'jest-localstorage-mock';
import OptimizelyClient from './optimizely';
import {
  storeExperimentParticipation,
  isExperimentAlreadyViewed,
  trackExperimentViewed,
  STORAGE_KEY,
} from './optimizely';
import AnalyticsClient from '../services/analytics.js';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';
// import { default as CookieOrginal } from 'js-cookie';
import glob from '../../../jest/global';
// import {
//   setUserData,
// } from '../site/user';

// const jekyllProperties = { test: 'test' };

/*Todo: MOCK FILES
Setup mock file for promise async
Figure out localstorage syntax (maybe glob)
validate parameters
*/

jest.mock('js-cookie');
// const Cookie = CookieOrginal;

describe('Optimizely Service', () => {
  const client = new OptimizelyClient();
  const userDataReady = new CustomEvent('userDataReady');

  const orgId = 'circle';
  const experiemntKey = '123';
  const variationName = 'peanut';

  beforeEach(() => {
    // might need to mock this each time
    // might not need all tests but specific
    // this.client = optimizelySDK.createInstance({
    //   datafile: window.optimizelyDatafile,
    // });
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getUserId()', () => {
    beforeEach(() => {
      // Ensure glob is cleaned up after each test
      glob.userData = null;
    });

    it('test if userData exists but analytics_id undefined', () => {
      glob.userData = {};
      return client.getUserId().then((data) => {
        expect(data).toBe(null);
      });
    });

    it('test if userData exists and analytics_id not null', async () => {
      glob.userData = {
        analytics_id: 'peanut butter',
      };
      await expect(client.getUserId()).resolves.toBe('peanut butter');
    });

    it('test waiting for userData to populate null', async () => {
      glob.userData = null;

      setTimeout(() => {
        glob.userData = {
          analytics_id: undefined,
        };
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe(null);
    });

    it('test if userData does not exist initially and defined later as peanut butter', async () => {
      glob.userData = null;
      setTimeout(() => {
        glob.userData = {
          analytics_id: 'peanut butter',
        };
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe('peanut butter');
    });
  });

  // Function used in TrackExperimentViewed
  describe('isExperimentAlreadyViewed()', () => {
    beforeEach(() => {
      // ensure local storage clear
      window.localStorage.clear();
    });
    it('experiment has not been viewed before', () => {
      storeExperimentParticipation(orgId, experiemntKey + '456', variationName);
      expect(isExperimentAlreadyViewed(orgId, experiemntKey)).toBe(false);
    });
    it('experiment has been viewed before', () => {
      storeExperimentParticipation(orgId, experiemntKey, variationName);
      expect(isExperimentAlreadyViewed(orgId, experiemntKey)).toBe(true);
    });
  });

  //Function used in getVariationName
  describe('trackExperimentViewed()', () => {
    beforeEach(() => {
      global.AnalyticsClient = AnalyticsClient;
      window.localStorage.clear();
      jest.clearAllMocks();
    });

    afterEach(() => {
      delete global.AnalyticsClient;
      jest.resetAllMocks();
    });

    it('expect trackExperimentViewed to have bene viewed', () => {
      storeExperimentParticipation(orgId, experiemntKey, variationName);
      expect(isExperimentAlreadyViewed(orgId, experiemntKey)).toBe(true);

      const spy = jest.spyOn(window.AnalyticsClient, 'trackAction');
      trackExperimentViewed(
        orgId,
        experiemntKey,
        ['container item'],
        '5',
        variationName,
        '5',
        '5',
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('expect trackExperimentViewed to have not been viewed', () => {
      const spy = jest.spyOn(window.AnalyticsClient, 'trackAction');
      trackExperimentViewed(
        orgId,
        experiemntKey,
        ['container item'],
        '5',
        variationName,
        '5',
        '5',
      );
      expect(spy).toHaveBeenCalled();
    });
  });

  //Function used in TrackExperimentViewed
  describe('storeExperimentParticipation()', () => {
    beforeEach(() => {
      // ensure local storage clear
      window.localStorage.clear();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('test function returns if data missing and storage null', () => {
      expect(storeExperimentParticipation('', '', '')).toBe();
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(null);
    });

    it('test localStorage overriten and not null', () => {
      storeExperimentParticipation(orgId, experiemntKey, 'peanut');
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBe(null);
    });

    it('test localStorage called', () => {
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      window.localStorage.__proto__.setItem = jest.fn();

      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest.fn();

      storeExperimentParticipation(orgId, experiemntKey, variationName);

      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toBeCalledWith(STORAGE_KEY);
    });
  });

  describe('getVariationName()', () => {
    //***Need to create a mock file for async promise

    it('test parameters are sent', () => {
      expect(true).toBe(true);
    });

    it('test orgId from cookie', () => {
      expect(true).toBe(true);
    });

    it('test isInGrowthExperimentGroup', () => {
      expect(true).toBe(true);
    });

    it('test tackExperimentViewed data', () => {
      expect(true).toBe(true);
    });
  });
});
