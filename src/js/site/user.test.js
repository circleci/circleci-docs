import global from '../../../jest/global';
import AnalyticsClient from '../services/analytics.js';
import { setUserData, setLoggedIn, setLoggedOut, setAmplitudeId } from './user';
import { default as CookieOrginal } from 'js-cookie';

jest.mock('js-cookie');
const Cookie = CookieOrginal;

const jekyllProperties = { test: 'test' };

describe('User', () => {
  beforeEach(() => {
    global.AnalyticsClient = AnalyticsClient;
    jest.clearAllMocks();
    window.currentPage = { name: 'Home Page', jekyllProperties };
  });

  afterEach(() => {
    delete global.AnalyticsClient;
    delete window.currentPage;
  });

  describe('setUserData', () => {
    const created_at = 'long ago';
    const userDataReady = new CustomEvent('userDataReady');

    it('Calls AnalyticsClient.trackPage with created_at', () => {
      const spy = jest.spyOn(AnalyticsClient, 'trackPage');
      setUserData({ created_at });
      expect(spy).toHaveBeenCalledWith('Home Page', {
        ...jekyllProperties,
        user_account_created_at: created_at,
      });
    });

    it('Calls dispatchEvent with created_at', () => {
      const spy = jest.spyOn(window, 'dispatchEvent');
      setUserData({ created_at });
      expect(spy).toHaveBeenCalledWith(userDataReady);
    });

    it('Calls AnalyticsClient.trackPage without created_at', () => {
      const spy = jest.spyOn(AnalyticsClient, 'trackPage');
      setUserData({});
      expect(spy).toHaveBeenCalledWith('Home Page', jekyllProperties);
    });

    it('Calls dispatchEvent without created_at', () => {
      const spy = jest.spyOn(window, 'dispatchEvent');
      setUserData({});
      expect(spy).toHaveBeenCalledWith(userDataReady);
    });
  });

  describe('setLoggedIn & setLoggedOut', () => {
    it('sets & removes `loggedin` class to document.body', () => {
      expect(document.body.className).toEqual('');
      setLoggedIn({});
      expect(document.body.className).toEqual('loggedin');
      setLoggedOut();
      expect(document.body.className).toEqual('');
    });

    it('calls Cookies.set', () => {
      const spy = jest.spyOn(Cookie, 'set');
      setLoggedIn({});
      expect(spy).toHaveBeenCalledWith('cci-customer', 'true', {
        expires: 365 * 2,
      });
      setLoggedOut({});
      expect(spy).toHaveBeenCalledWith('cci-customer', 'false', {
        expires: 365 * 2,
      });
    });
  });

  describe('setAmplitudeId', () => {
    it('calls Cookies.set', () => {
      const cookieSpy = jest.spyOn(Cookie, 'set');
      const getSessionSpy = jest.spyOn(window.AnalyticsClient, 'getSessionId');
      const DAYS_PER_MINUTE = 1 / 24 / 60;
      setAmplitudeId();
      expect(getSessionSpy).toHaveBeenCalled();
      expect(cookieSpy).toHaveBeenCalledWith(
        'amplitude-session-id',
        expect.any(Number),
        {
          expires: 30 * DAYS_PER_MINUTE,
        },
      );
    });

    it('calls window.AnalyticsClient.trackUser', () => {
      const spy = jest.spyOn(window.AnalyticsClient, 'trackUser');
      setAmplitudeId();
      expect(spy).toHaveBeenCalled();
    });
  });
});
