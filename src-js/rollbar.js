import * as rollbar from 'rollbar-browser';

export const init = (environment = 'production') => {
  const rollbarConfig = {
    accessToken: 'a22956bf457a40e5a9ae6fd842d97392',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: { environment }
  };

  if (environment === 'development') {
    rollbarConfig.hostWhiteList = [
      'dev.circlehost',
      'prod.circlehost',
      'dev.awesomeci.com'
    ];
  }

  return rollbar.init(rollbarConfig);
};

export const error = (message, error) => {
  console.error('Rollbaring:', message, error);
  return rollbar.error(message, error);
};
