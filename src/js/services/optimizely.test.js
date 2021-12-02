// import { optimize } from 'webpack';
// import OptimizelyClient from './optimizely';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';
// import { default as CookieOrginal } from 'js-cookie';
// import glob from '../../../jest/global';

/*Todo: MOCK FILES
Setup mock file for promise async
Figure out localstorage syntax (maybe glob)
validate parameters
*/

jest.mock('js-cookie');
// const Cookie = CookieOrginal;

describe('Optimizely Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('true is true', () => {
    expect(true).toBe(true);
  });

  describe('getUserId()', () => {
    //***Need to create a mock file for async promise

    it('test if userData already exists', () => {
      expect(true).toBe(true);
    });

    it('test waiting for userData to populate', () => {
      expect(true).toBe(true);
    });

    //Should we add a no userData test?
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
