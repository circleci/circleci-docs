import AnalyticsClient from './analytics.js';
import { default as CookieOrginal } from 'js-cookie';
import glob from '../../jest/global';
import { describe } from 'jest-circus';

jest.mock('js-cookie');
const Cookie = CookieOrginal;

const options = {
  integrations: {
    Amplitude: { session_id: expect.any(Number) },
  },
};

describe('Amalytics Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // These globs are defined as jest.fn() instances in jest/globs.ts
    glob.analytics.track.mockReset();
    glob.analytics.identify.mockReset();
    glob.analytics.page.mockReset();
  });

  test('getSessionId() returns cookie value', () => {
    const spy = jest.spyOn(Cookie, 'get').mockImplementation(() => 123);

    expect(AnalyticsClient.getSessionId()).toBe(123);
    expect(spy).toHaveBeenCalledWith('amplitude-session-id');
  });

  describe('trackAction()', () => {
    it('should call analytics.track with arguments', () => {
      const properties = {
        some: 'value',
      };

      AnalyticsClient.trackAction('event', properties);
      expect(glob.analytics.track).toHaveBeenCalledWith(
        'event',
        properties,
        options,
      );
    });

    it('should not call analytics.track if Datadog Synthetics Bot detected', () => {
      glob._DATADOG_SYNTHETICS_BROWSER = true;

      AnalyticsClient.trackAction('event');
      expect(glob.analytics.track).not.toHaveBeenCalled();
      delete glob._DATADOG_SYNTHETICS_BROWSER;
    });
  });

  describe('trackUser()', () => {
    it('should call analytics.identify with arguments', () => {
      const traits = {
        some: 'value',
      };

      AnalyticsClient.trackUser('event', traits);
      expect(glob.analytics.identify).toHaveBeenCalledWith(
        'event',
        traits,
        options,
      );
    });

    it('should not call analytics.identify if Datadog Synthetics Bot detected', () => {
      glob._DATADOG_SYNTHETICS_BROWSER = true;

      AnalyticsClient.trackUser('event');
      expect(glob.analytics.identify).not.toHaveBeenCalled();
      delete glob._DATADOG_SYNTHETICS_BROWSER;
    });
  });

  describe('trackPage()', () => {
    it('should call analytics.page with arguments', () => {
      const properties = {
        some: 'value',
      };

      AnalyticsClient.trackPage('event', properties);
      expect(glob.analytics.page).toHaveBeenCalledWith(
        'docs',
        'event',
        properties,
        options,
      );
    });

    it('should not call analytics.page if Datadog Synthetics Bot detected', () => {
      glob._DATADOG_SYNTHETICS_BROWSER = true;

      AnalyticsClient.trackPage('event');
      expect(glob.analytics.page).not.toHaveBeenCalled();
      delete glob._DATADOG_SYNTHETICS_BROWSER;
    });
  });
});
