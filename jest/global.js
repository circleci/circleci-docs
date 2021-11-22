global.analytics = {
  page: jest.fn(),
  track: jest.fn(),
  identify: jest.fn(),
};

global._DATADOG_SYNTHETICS_BROWSER = false;

export default global;
