import OptimizelyClient, {
  storeExperimentParticipation,
  isExperimentAlreadyViewed,
  trackExperimentViewed,
  STORAGE_KEY,
  COOKIE_KEY,
} from './optimizely';
import AnalyticsClient from '../services/analytics.js';
import glob from '../../../jest/global';

import { default as CookieOrginal } from 'js-cookie';
jest.mock('js-cookie');
const Cookie = CookieOrginal;

describe('Optimizely Service', () => {
  const client = new OptimizelyClient();
  const userDataReady = new CustomEvent('userDataReady');

  const orgId = 'circle';
  const experimentKey = 'experiment_key';
  const variationName = 'variation_name';

  const options = {
    organizationId: '00000000-0000-0000-0000-000000000000',
    userAnalyticsId: '11111111-1111-1111-1111-111111111111',
    experimentKey: 'experiment_key',
    groupExperimentName: 'experiment_group_test',
    experimentContainer: 'experiment_container',
  };

  beforeEach(() => {
    // ensure local storage clear
    window.localStorage.clear();
  });

  afterEach(() => {
    glob.userData = null;
    glob.forceAll = null;
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getUserId()', () => {
    it('test if userData exists but analytics_id undefined', () => {
      glob.userData = {};
      return client.getUserId().then((data) => {
        expect(data).toBe(null);
      });
    });

    it('test if userData exists and analytics_id not null', async () => {
      glob.userData = {
        analytics_id: '00000000-0000-0000-0000-000000000000',
      };
      await expect(client.getUserId()).resolves.toBe(
        '00000000-0000-0000-0000-000000000000',
      );
    });

    it('test waiting for userData to populate from null but without analytics_id', async () => {
      glob.userData = null;

      setTimeout(() => {
        glob.userData = {
          analytics_id: undefined,
        };
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe(null);
    });

    it('test if userData does not exist initially and defined later with analytics_id', async () => {
      glob.userData = null;
      setTimeout(() => {
        glob.userData = {
          analytics_id: '00000000-0000-0000-0000-000000000000',
        };
        window.dispatchEvent(userDataReady);
      }, 100);

      await expect(client.getUserId()).resolves.toBe(
        '00000000-0000-0000-0000-000000000000',
      );
    });
  });

  // Function used in TrackExperimentViewed
  describe('isExperimentAlreadyViewed()', () => {
    it('no experiment has been viewed before', () => {
      expect(isExperimentAlreadyViewed(orgId, experimentKey)).toBe(null);
    });
    it('experiment has not been viewed before but an experiment has been viewed', () => {
      storeExperimentParticipation(orgId, experimentKey + '456', variationName);
      expect(isExperimentAlreadyViewed(orgId, experimentKey)).toBe(false);
    });
    it('experiment has been viewed before', () => {
      storeExperimentParticipation(orgId, experimentKey, variationName);
      expect(isExperimentAlreadyViewed(orgId, experimentKey)).toBe(true);
    });
  });

  //Function used in getVariationName
  describe('trackExperimentViewed()', () => {
    beforeEach(() => {
      global.AnalyticsClient = AnalyticsClient;
    });

    afterEach(() => {
      delete global.AnalyticsClient;
    });

    it('expect trackExperimentViewed to not call trackAction as experiment viewed before', () => {
      storeExperimentParticipation(orgId, experimentKey, variationName);
      expect(isExperimentAlreadyViewed(orgId, experimentKey)).toBe(true);

      const spy = jest.spyOn(window.AnalyticsClient, 'trackAction');
      trackExperimentViewed(
        orgId,
        experimentKey,
        ['container item'],
        '5',
        variationName,
        '5',
        '5',
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('expect trackExperimentViewed to have not been viewed call trackAction', () => {
      const spy = jest.spyOn(window.AnalyticsClient, 'trackAction');
      trackExperimentViewed(
        orgId,
        experimentKey,
        ['container item'],
        '5',
        variationName,
        '5',
        '5',
      );
      expect(spy).toHaveBeenCalledWith('Experiment Viewed', expect.any(Object));
    });
  });

  describe('getVariationName()', () => {
    it('test forceAll is true return treatment', async () => {
      glob.forceAll = () => true;
      await expect(client.getVariationName(options)).resolves.toBe('treatment');
    });

    it('test forceAll is false but options null', async () => {
      const errorObject = { error: 'Missing required options' };
      glob.forceAll = () => false;
      await expect(client.getVariationName(null)).rejects.toEqual(errorObject);
    });

    it('test forceAll is false, with valid options but no cookie', async () => {
      glob.forceAll = () => false;
      await expect(client.getVariationName(options)).resolves.toBe(null);
    });

    it('test forceAll false, with valid options, get cookie but has no userId', async () => {
      const spy = jest.spyOn(Cookie, 'get').mockImplementation(() => 123);
      glob.forceAll = () => false;
      glob.userData = {};
      await expect(client.getVariationName(options)).resolves.toBe(null);
      expect(spy).toHaveBeenCalledWith(COOKIE_KEY);
    });

    describe('test when an organization is in the exclusion group', () => {
      beforeEach(() => {
        glob.userData = {
          analytics_id: '11111111-1111-1111-1111-111111111111',
        };
        glob.forceAll = () => false;
        jest.spyOn(Cookie, 'get').mockImplementation(() => ({
          userId: '11111111-1111-1111-1111-111111111111',
        }));
      });

      it('GrowthExperiment is control', () => {
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'control');
        return client.getVariationName(options).then((data) => {
          expect(data).toBe(null);
        });
      });

      it('GrowthExperiment is treatment and variationName is control', () => {
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'treatment');
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'control');
        return client.getVariationName(options).then((data) => {
          expect(data).toBe('control');
        });
      });

      it('GrowthExperiment is treatment and variationName is treatment', () => {
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'treatment');
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'treatment');
        return client.getVariationName(options).then((data) => {
          expect(data).toBe('treatment');
        });
      });
    });
  });

  //Function used in TrackExperimentViewed
  describe('storeExperimentParticipation()', () => {
    it('test function returns if data missing and storage null', () => {
      expect(storeExperimentParticipation('', '', '')).toBe();
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(null);
    });

    it('test localStorage overriten and not null', () => {
      storeExperimentParticipation(orgId, experimentKey, variationName);
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBe(null);
    });

    it('test localStorage called', () => {
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      window.localStorage.__proto__.setItem = jest.fn();

      jest.spyOn(window.localStorage.__proto__, 'getItem');
      window.localStorage.__proto__.getItem = jest.fn();

      storeExperimentParticipation(orgId, experimentKey, variationName);

      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toBeCalledWith(STORAGE_KEY);
    });
  });
});
