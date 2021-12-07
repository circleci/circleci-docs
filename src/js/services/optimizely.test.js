import OptimizelyClient from './optimizely';
import {
  storeExperimentParticipation,
  isExperimentAlreadyViewed,
  trackExperimentViewed,
  STORAGE_KEY,
  COOKIE_KEY,
} from './optimizely';
import AnalyticsClient from '../services/analytics.js';
import glob from '../../../jest/global';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';

import { default as CookieOrginal } from 'js-cookie';
jest.mock('js-cookie');
const Cookie = CookieOrginal;

import { forceAll } from '../experiments/forceAll'; // This will actually be the mock
jest.mock('../experiments/forceAll', () => ({ forceAll: jest.fn() }));

describe('Optimizely Service', () => {
  const client = new OptimizelyClient();
  // const clientSDK = optimizelySDK.createInstance({
  //   datafile: window.optimizelyDatafile,
  // });
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

  describe('getVariationName()', () => {
    const options = {
      experimentKey: 'experiment key',
      groupExperimentName: 'experiment name',
      experimentContainer: 'experiment container',
    };

    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('test forceAll is true return treatment', async () => {
      forceAll.mockImplementation(() => true);
      await expect(client.getVariationName(options)).resolves.toBe('treatment');
      expect(forceAll.mock.calls.length).toBe(1);
    });

    it('test forceAll is false options null', async () => {
      const errorObject = { error: 'Missing required options' };
      forceAll.mockImplementation(() => false);
      await expect(client.getVariationName(null)).rejects.toEqual(errorObject);
    });

    it('test forceAll is false valid options no cookie', async () => {
      forceAll.mockImplementation(() => false);
      await expect(client.getVariationName(options)).resolves.toBe(null);
      expect(forceAll.mock.calls.length).toBe(1);
    });

    it('test forceAll false get cookie has no userId', async () => {
      forceAll.mockImplementation(() => false);
      const spy = jest.spyOn(Cookie, 'get').mockImplementation(() => 123);
      await expect(client.getVariationName(options)).resolves.toBe(null);
      expect(spy).toHaveBeenCalledWith(COOKIE_KEY);
    });

    it('test forceAll false get cookie has userId', async () => {
      glob.userData = null;
      setTimeout(() => {
        glob.userData = {
          analytics_id: 'peanut butter',
        };
        window.dispatchEvent(userDataReady);
      }, 100);

      forceAll.mockImplementation(() => false);

      const spy = jest
        .spyOn(Cookie, 'get')
        .mockImplementation(() => ({ userId: 123 }));
      await expect(client.getVariationName(options)).resolves.toBe(null);
      expect(spy).toHaveBeenCalledWith(COOKIE_KEY);
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
});
