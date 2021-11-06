import { datadogRum } from '@datadog/browser-rum';
import { init, getDefaultOptions } from './rum';

import {
  isUnsupportedBrowser as isUnsupportedBrowserDefault,
  isProduction as isProductionOriginal,
} from '../utils';
jest.mock('../utils');
const isUnsupportedBrowser = isUnsupportedBrowserDefault;
const isProduction = isProductionOriginal;

describe('Real User Monitoring', () => {
  describe('init', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call datadogRum init', () => {
      const spy = jest.spyOn(datadogRum, 'init');
      init();
      expect(spy).toBeCalledWith(getDefaultOptions());
    });

    it('should not call datadogRum init when client is not supported', () => {
      isUnsupportedBrowser.mockImplementation(() => true);
      const spy = jest.spyOn(datadogRum, 'init');
      init();
      expect(spy).not.toBeCalled();
    });

    it('should call datadogRum init with dev env in dev', () => {
      isProduction.mockImplementation(() => false);

      const spy = jest.spyOn(datadogRum, 'init');
      init();

      expect(spy).toBeCalledWith({
        ...getDefaultOptions(),
        env: 'development',
      });
    });

    it('should call datadogRum init with prod env in prod', () => {
      isProduction.mockImplementation(() => true);

      const spy = jest.spyOn(datadogRum, 'init');
      init();

      expect(spy).toBeCalledWith({
        ...getDefaultOptions(),
        env: 'production',
      });
    });
  });
});
