import * as rollbar from './rollbar';

// CIRCLECI_ENVIRONMENT is defined by webpack.
window.Rollbar = rollbar.init(CIRCLECI_ENVIRONMENT);
