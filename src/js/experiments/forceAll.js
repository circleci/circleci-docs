const FORCE_QUERY_KEY = 'force-all';
const FORCE_STORAGE_KEY = 'growth-experiments-force-all';
const PREVIEW_DOMAIN =
  'circleci-doc-preview.s3-website-us-east-1.amazonaws.com';

const getJekyllBaseName = () => {
  const match = location.href.match(`${PREVIEW_DOMAIN}/.*-preview/`);
  return match.length ? match[0] : null;
};

forceAll = () => {
  let force = false;

  if (window.location.host === PREVIEW_DOMAIN) {
    const jekyllBaseName = getJekyllBaseName();
    force = (localStorage.getItem(FORCE_STORAGE_KEY) ?? '') === jekyllBaseName;
  }
  if (!force) {
    localStorage.removeItem(FORCE_STORAGE_KEY);
  }

  return force;
};

const currentPage = window.location;
if (
  currentPage.host === PREVIEW_DOMAIN &&
  new RegExp(`[?&]${FORCE_QUERY_KEY}`).test(currentPage.href ?? '')
) {
  const jekyllBaseName = getJekyllBaseName();
  localStorage.setItem(FORCE_STORAGE_KEY, jekyllBaseName);

  $(() => {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <style>
        .toolbar .copy-to-clipboard-button[data-copy-state=copy] {
          background-image: url('http://${jekyllBaseName}assets/img/compass/copy.svg') !important;
        }

        .toolbar .copy-to-clipboard-button[data-copy-state=copy-success] {
          background-image: url('http://${jekyllBaseName}assets/img/compass/check.svg') !important;
        }

        .globe-icon {
          background-color:transparent;
          color: $black;
          @media (min-width: $screen-md) {
            &:hover {
              filter: invert(39%) sepia(99%) saturate(634%) hue-rotate(105deg) brightness(83%) contrast(97%);
            }
          }
          @media (max-width: $screen-md) {
            padding-top: 6px;
          }
        }
      </style>`,
    );
  });
}
