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

  describe('isElementInViewport', () => {
    it('Should return false if not passed a DomElement', () => {
      let nonElement = {};
      expect(utils.isElementInViewport(nonElement)).toBe(false);
    });

    it('Should return true when element is in viewport.', () => {
      let mockElement = document.createElement('div');
      window.innerHeight = 700;
      window.innerWidth = 1200;

      mockElement.getBoundingClientRect = jest.fn().mockReturnValueOnce({
        bottom: 300,
        left: 300,
        right: 1200,
        top: 300,
      });
      const result = utils.isElementInViewport(mockElement);
      expect(result).toBeTruthy();
    });

    it('Should return false when element is not in the viewport.', () => {
      let mockElement = document.createElement('div');
      window.innerHeight = 700;
      window.innerWidth = 1200;

      mockElement.getBoundingClientRect = jest.fn().mockReturnValueOnce({
        bottom: 1809.75,
        left: 328,
        right: 1147.328125,
        top: 1769.75,
      });

      const result = utils.isElementInViewport(mockElement);
      expect(result).toBe(false);
    });
  });

  describe('dateHowLongAgo', () => { 
    let date;
    beforeEach(() => {
      date = new Date();
    });
    afterEach(() => {
      date = null;
    });
    it('Should return +1 year ago', () => {
      let twoyearsago = new Date(date.getFullYear() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('+1 year ago')
    });
    it('Should return 1 month ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth() - 1);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('1 month ago')
    });
    it('Should return 2 months ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('2 months ago')
    });
    it('Should return 1 day ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('1 day ago')
    });
    it('Should return 2 days ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('2 days ago')
    });
    it('Should return 1 hour ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - 1);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('1 hour ago')
    });
    it('Should return 2 hours ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('2 hours ago')
    });
    it('Should return 1 minute ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() - 1);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('1 minute ago')
    });
    it('Should return 2 minutes ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('2 minutes ago')
    });
    it('Should return 1 second ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() - 1);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('1 second ago')
    });
    it('Should return 2 seconds ago', () => {
      let twoyearsago = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() - 2);
      expect(utils.dateHowLongAgo(twoyearsago)).toEqual('2 seconds ago')
    });
  });
});
