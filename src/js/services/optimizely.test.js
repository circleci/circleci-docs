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
    it('returns null when userData is empty', () => {
      glob.userData = {};
      return client.getUserId().then((data) => {
        expect(data).toBe(null);
      });
    });

    it('returns analytics_id when userData has a valid analytics_id', async () => {
      glob.userData = {
        analytics_id: '00000000-0000-0000-0000-000000000000',
      };
      await expect(client.getUserId()).resolves.toBe(
        glob.userData.analytics_id,
      );
    });
  });

  // Function used in TrackExperimentViewed
  describe('isExperimentAlreadyViewed()', () => {
    it('returns false when experiment has not been viewed before', () => {
      expect(isExperimentAlreadyViewed(orgId, experimentKey)).toBe(false);
    });
    it('returns true when experiment has been viewed before', () => {
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

    it('does not call trackAction when experiment viewed before', () => {
      const spy = jest.spyOn(window.AnalyticsClient, 'trackAction');
      storeExperimentParticipation(orgId, experimentKey, variationName);

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

    it('does call trackAction when experiment not viewed before', () => {
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
    beforeEach(() => {
      glob.forceAll = () => false;
    });

    it('returns treatment when forceAll is true', async () => {
      glob.forceAll = () => true;
      await expect(client.getVariationName(options)).resolves.toBe('treatment');
    });

    it('returns error when options null', async () => {
      const errorObject = { error: 'Missing required options' };
      await expect(client.getVariationName(null)).rejects.toEqual(errorObject);
    });

    it('returns null when no cookie', async () => {
      await expect(client.getVariationName(options)).resolves.toBe(null);
    });

    it('returns null when no userId', async () => {
      const spy = jest.spyOn(Cookie, 'get').mockImplementation(() => 123);
      glob.userData = {};
      await expect(client.getVariationName(options)).resolves.toBe(null);
      expect(spy).toHaveBeenCalledWith(COOKIE_KEY);
    });

    describe('getVariationName when an organization is in the exclusion group', () => {
      beforeEach(() => {
        glob.userData = {
          analytics_id: '11111111-1111-1111-1111-111111111111',
        };
        jest.spyOn(Cookie, 'get').mockImplementation(() => ({
          userId: '11111111-1111-1111-1111-111111111111',
        }));
      });

      it('returns null when growthExperiment is control', () => {
        jest
          .spyOn(client.client, 'getVariation')
          .mockImplementationOnce(() => 'control');
        return client.getVariationName(options).then((data) => {
          expect(data).toBe(null);
        });
      });

      it('returns control when growthExperiment is treatment and variationName is control', () => {
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

      it('returns treatment when growthExperiment is treatment and variationName is treatment', () => {
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
    it('should not effect local storage if options invalid', () => {
      expect(storeExperimentParticipation('', '', '')).toBe();
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(null);
    });

    it('should effect local storage if options are valid', () => {
      storeExperimentParticipation(orgId, experimentKey, variationName);
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBe(null);
    });
  });
});
