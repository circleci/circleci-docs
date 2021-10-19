export function isProduction() {
  return window.location.origin === 'https://circleci.com';
}
