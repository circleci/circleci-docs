import global from '../../../jest/global';
import AnalyticsClient from '../services/analytics.js';
import {
  setUserData,
  setLoggedIn,
  setLoggedOut,
  fetchUserData,
  setAmplitudeId,
} from './user';
import { updateCookieExpiration } from '../utils';
import { default as CookieOrginal } from 'js-cookie';
import { describe } from 'jest-circus';

jest.mock('js-cookie');
const Cookie = CookieOrginal;
jest.mock('../utils', () => ({ updateCookieExpiration: jest.fn() }));

const jekyllProperties = { test: 'test' };

describe('User', () => {
  const userDataReady = new CustomEvent('userDataReady');

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

  describe('fetchUserData', () => {
    it('calls utils.updateCookieExpiration', () => {
      fetchUserData();
      expect(updateCookieExpiration).toHaveBeenCalledWith(
        'cci-customer',
        365 * 2,
      );
    });

    it('does not set `loggedin` class to document.body if Cookie is not true', () => {
      expect(document.body.className).toEqual('');
      fetchUserData();
      expect(document.body.className).toEqual('');
    });

    it('does set `loggedin` class to document.body if Cookie is true', () => {
      const original = Cookie.get;
      Cookie.get = jest.fn(() => 'true');
      expect(document.body.className).toEqual('');
      fetchUserData();
      expect(document.body.className).toEqual('loggedin');
      setLoggedOut();
      Cookie.get = original;
    });

    it('calls ajax', () => {
      const ajaxSpy = jest.spyOn($, 'ajax');
      fetchUserData();
      expect(ajaxSpy).toHaveBeenCalledWith({
        url: 'https://circleci.com/api/v1/me',
        xhrFields: {
          withCredentials: true,
        },
        dataType: 'json',
        timeout: 10000, // 10 seconds
      });
    });

    it('logs in if mocked ajax fetch succeeds', () => {
      const originalAjax = global.$.ajax;
      const originalDone = global.$.done;
      const originalFail = global.$.fail;
      const userData = { success: true };
      const trackPageSpy = jest.spyOn(AnalyticsClient, 'trackPage');
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      global.$.ajax = function () {
        return global.$;
      };
      global.$.done = jest.fn(function (fn) {
        if (fn) fn(userData);
        return global.$;
      });
      global.$.fail = function () {
        return global.$;
      };
      fetchUserData();
      expect(global.$.done).toHaveBeenCalledWith(expect.any(Function));
      expect(trackPageSpy).toHaveBeenCalledWith('Home Page', jekyllProperties);
      expect(dispatchEventSpy).toHaveBeenCalledWith(userDataReady);
      expect(document.body.className).toEqual('loggedin');
      global.$.ajax = originalAjax;
      global.$.done = originalDone;
      global.$.fail = originalFail;
    });

    it('logs out if mocked ajax fetch fails', () => {
      const originalAjax = global.$.ajax;
      const originalDone = global.$.done;
      const originalFail = global.$.fail;

      global.$.ajax = function () {
        return global.$;
      };
      global.$.done = function () {
        return global.$;
      };
      global.$.fail = jest.fn(function (fn) {
        if (fn) fn();
        return global.$;
      });
      fetchUserData();
      expect(global.$.fail).toHaveBeenCalledWith(expect.any(Function));
      expect(document.body.className).toEqual('');
      global.$.ajax = originalAjax;
      global.$.done = originalDone;
      global.$.fail = originalFail;
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
