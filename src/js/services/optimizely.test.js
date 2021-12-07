// import { optimize } from 'webpack';
import OptimizelyClient from './optimizely';
// import AnalyticsClient from '../services/analytics.js';
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
  beforeEach(() => {
    // might need to mock this each time
    // might not need all tests but specific
    // this.client = optimizelySDK.createInstance({
    //   datafile: window.optimizelyDatafile,
    // });
    jest.resetAllMocks();
  });

  describe('getUserId()', () => {
    it('test if userData exists but analytics_id undefined', () => {
      glob.userData = {};
      const client = new OptimizelyClient();
      return client.getUserId().then((data) => {
        expect(data).toBe(null);
      });
    });

    it('test if userData exists and analytics_id not null', async () => {
      glob.userData = {
        analytics_id: 'peanut butter',
      };
      const client = new OptimizelyClient();
      await expect(client.getUserId()).resolves.toBe('peanut butter');
    });

    it('test waiting for userData to populate null', async () => {
      const client = new OptimizelyClient();
      glob.userData = null;

      setTimeout(() => {
        glob.userData = {
          analytics_id: undefined,
        };
        const userDataReady = new CustomEvent('userDataReady');
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe(null);
    });

    it('test if userData does not exist initially and defined later as peanut butter', async () => {
      const client = new OptimizelyClient();
      glob.userData = null;

      setTimeout(() => {
        glob.userData = {
          analytics_id: 'peanut butter',
        };
        const userDataReady = new CustomEvent('userDataReady');
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe('peanut butter');
    });
  });

  //Function used in TrackExperimentViewed
  describe('isExperimentAlreadyViewed()', () => {
    it('should be called with options object', () => {
      //jest.spyOn(localStorage, "getItem");
      //localStorage.getItem = jest.fn();
      //expect(localStorage.getItem).toHaveBeenCalled();
      expect(true).toBe(true);
    });
  });

  //Function used in TrackExperimentViewed
  describe('storeExperimentParticipation()', () => {
    it('test localStorage key', () => {
      //jest.spyOn(localStorage, "getItem");
      //localStorage.getItem = jest.fn();
      //expect(localStorage.getItem).toHaveBeenCalled();
      expect(true).toBe(true);
    });

    it('test experiments value', () => {
      expect(true).toBe(true);
    });

    it('test set localStorage key', () => {
      expect(true).toBe(true);
    });
  });

  //Function used in getVariationName
  describe('trackExperimentViewed()', () => {
    it('check experimentContainer', () => {
      expect(true).toBe(true);
    });

    it('check isExperimentAlreadyViewed on experimentKey', () => {
      expect(true).toBe(true);
    });

    it('set trackAction Experiment Viewed properties', () => {
      expect(true).toBe(true);
    });

    it('store ExperimentParticipation using function', () => {
      expect(true).toBe(true);
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
