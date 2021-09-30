const FORCE_QUERY_KEY = 'force-all';
const FORCE_STORAGE_KEY = 'growth-experiments-force-all';
const PREVIEW_DOMAIN = 'circleci-doc-preview.s3-website-us-east-1.amazonaws.com';

const currentPage = window.location;

if (currentPage.host === PREVIEW_DOMAIN &&
    (new RegExp(`[\?&]${FORCE_QUERY_KEY}`)).test(currentPage.href ?? "")) {
      localStorage.setItem(FORCE_STORAGE_KEY, "1");
}
