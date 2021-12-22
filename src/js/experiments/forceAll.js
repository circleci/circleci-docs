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
        .compass-copy {
          background-image: url('http://${jekyllBaseName}assets/img/compass/copy.svg');
        }

        .compass-check-circle {
          background-image: url('http://${jekyllBaseName}assets/img/compass/check.svg');
        }
      </style>`,
    );

    const globeBtn = document.getElementById('globe-lang-btn');
    const globeImg = document.getElementsByClassName('globe-icon');
    // remove exsisting globe img with broken path from DOM
    globeBtn.removeChild(globeImg);

    // create JEKYLL_BASENAME from preview url to use for globe img source
    const previewURL = jekyllBaseName;
    const start = previewURL.indexOf('/');
    const imgPath = previewURL.substring(start);
    globeBtn.insertAdjacentHTML(
      'afterbegin',
      `<img src="/${imgPath}assets/img/compass/globe.svg" class="globe-icon">`,
    );
  });
}
