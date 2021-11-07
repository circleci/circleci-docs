import * as utils from './utils';

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isProd', () => {
    it('should return false when not in prod', () => {
      expect(utils.isProduction()).toBe(false);
    });

    it('should return true when in prod', () => {
      const originalLocation = window.location;

      delete window.location;
      window.location = new URL('https://circleci.com');

      expect(utils.isProduction()).toBe(true);

      window.location = originalLocation;
    });
  });

  describe('isUnsupportedBrowser', () => {
    it('should return true with Internet Explorer', () => {
      const IE7 =
        'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E; InfoPath.3)';
      jest
        .spyOn(global.window.navigator, 'userAgent', 'get')
        .mockReturnValue(IE7);
      expect(utils.isUnsupportedBrowser()).toBe(true);
    });

    it('should return false with Chrome', () => {
      const Chrome =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';
      jest
        .spyOn(global.window.navigator, 'userAgent', 'get')
        .mockReturnValue(Chrome);
      expect(utils.isUnsupportedBrowser()).toBe(false);
    });
  });
});
