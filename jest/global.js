import $ from 'jquery';

global.$ = global.jQuery = $;

global.analytics = {
  page: jest.fn(),
  track: jest.fn(),
  identify: jest.fn(),
};

global._DATADOG_SYNTHETICS_BROWSER = false;

global.$ = jest.fn();

class IntersectionObserver {
  constructor() {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

global.IntersectionObserver = IntersectionObserver;

export default global;
