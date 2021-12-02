import { optimize } from 'webpack';
import OptimizelyClient from './optimizely';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';
// import { default as CookieOrginal } from 'js-cookie';
// import glob from '../../../jest/global';


/*Todo:
Setup mock file for promise async
Figure out localstorage syntax
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
    
    });

    it('test waiting for userData to populate', () => {
    
    });

    //Should we add a no userData test?

  });

  //Function used in TrackExperimentViewed
  describe('isExperimentAlreadyViewed()', () => {
    it('should be called with options object', () => {
      //jest.spyOn(localStorage, "getItem");
      //localStorage.getItem = jest.fn();
      //expect(localStorage.getItem).toHaveBeenCalled();
    });
  });

  //Function used in TrackExperimentViewed
  describe('storeExperimentParticipation()', () => {
    it('test localStorage key', () => {
      //jest.spyOn(localStorage, "getItem");
      //localStorage.getItem = jest.fn();
      //expect(localStorage.getItem).toHaveBeenCalled();
    });

    it('test experiments value', () => {

    });

    it('test set localStorage key', () => {

    });

  });

  //Function used in getVariationName
  describe('trackExperimentViewed()', () => {
    it('check experimentContainer', () => {

    });

    it('check isExperimentAlreadyViewed on experimentKey', () => {

    });

    it('set trackAction Experiment Viewed properties', () => {

    });

    it('store ExperimentParticipation using function', () => {

    });

  });

  describe('getVariationName()', () => {
    //***Need to create a mock file for async promise

    it('test parameters are sent', () => {
    
    });

    it('test orgId from cookie', () => {
    
    });

    it('test isInGrowthExperimentGroup', () => {
    
    });

    it('test tackExperimentViewed data', () => {
    
    });
  });
});
