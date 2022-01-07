import { datadogRum } from '@datadog/browser-rum';
import { isProduction, isUnsupportedBrowser } from '../utils';

export const getDefaultOptions = () => ({
  applicationId: '2a3e19ca-297e-4a53-a2cf-082e827d13d3',
  clientToken: 'pubdffb4b4dd07f1f43b42276901d58da91',
  site: 'datadoghq.com',
  service: 'circleci-docs',
  env: isProduction() ? 'production' : 'development',
  trackInteractions: false,
  trackViewsManually: false,
});

export const init = () => {
  if (isUnsupportedBrowser()) return;
  try {
    datadogRum.init(getDefaultOptions());
  } catch (_) {
    return;
  }
};
