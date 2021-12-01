// import OptimizelyClient from './optimizely';
// import * as optimizelySDK from '@optimizely/optimizely-sdk';
// import { default as CookieOrginal } from 'js-cookie';
// import glob from '../../../jest/global';

jest.mock('js-cookie');
// const Cookie = CookieOrginal;

describe('Optimizely Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('true is true', () => {
    expect(true).toBe(true);
  });
});
