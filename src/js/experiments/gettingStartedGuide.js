// https://app.optimizely.com/v2/projects/16812830475/experiments/21268663100/variations
import { reconstructToC } from '../site/toc';

function addNewBadgeToSidebar() {
  const isGettingStartedPage =
    window.location.pathname == '/docs/2.0/getting-started/';
  const NEW_SIDEBAR_HTML = `
    <a class="${isGettingStartedPage ? 'active' : ''}"
       style="display: flex; align-items: center"
       href="/docs/2.0/getting-started/"
       data-section="getting-started" data-proofer-ignore="">
      <span>Quickstart Guide</span>
      <span class="getting-started-new-badge"> NEW </span>
    </a>
`;
  $("li > a[href='/docs/2.0/getting-started/']").replaceWith(NEW_SIDEBAR_HTML);
}

function showHomePageBadges() {
  const isGettingStartedPage = window.location.pathname == '/docs/';
  if (isGettingStartedPage) {
    $('.getting-started-experiment-badges').show();
  }
}

function setUpTracking() {
  const badges = Array.from($('.wrapper-link'));
  badges.forEach((badge) => {
    badge.addEventListener('click', () => {
      window.AnalyticsClient.trackAction('clicked-landing-page-badge', {
        badgeText: badge.innerText,
        badgeHref: badge.href,
      });
    });
  });
  const links = Array.from($('.treatment').find($('a')));
  links.forEach((link, i) => {
    link.addEventListener('click', () => {
      window.AnalyticsClient.trackAction(
        'clicked-on-getting-started-guide-link',
        {
          linkText: link.innerText,
          linkHref: link.href,
          linkIndexOnPage: i + 1 + '/' + links.length,
          page: window.location.pathname,
        },
      );
    });
  });
}

function displayGettingStartedContent() {
  // Used to expand the container width for the experiment content
  if (window.location.pathname === '/docs/2.0/getting-started/') {
    const articleContainer = $('.your-first-green-build');
    articleContainer.addClass('getting-started-full-width');

    // Header title is given by getting-started, only content is switched not
    // the header details thus need to override
    const headerName = $('#your-first-green-build');
    headerName[0].innerHTML = 'Quickstart Guide';
    // Display content on page for treatment variation
    const treatment = $('.treatment');
    treatment.css('display', 'block');
    if (treatment[0]) {
      reconstructToC(treatment[0], 'treatment');
    }
    // In the experiment we do not want to show the TOC but I have to reconstruct it
    // For scroll track action then hide it
    const toc = $('#full-height');
    toc.css('visibility', 'hidden');
  }
}

function displayFirstGreenBuildContent() {
  if (window.location.pathname === '/docs/2.0/getting-started/') {
    const control = $('.control');
    control.css('display', 'block');
    // ToC is hidden due to using getting-started-guide-experimental for the layout, setting the css to ensure that the ToC is present in control variation
    const toc = $('#full-height');
    toc.css('visibility', 'visible');
    if (control[0]) {
      reconstructToC(control[0], 'control');
    }
  }
}

window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_getting_started_docs_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: 'body',
  guestExperiment: true,
})
  .then((variation) => {
    if (variation === 'treatment') {
      // Init new badges on landing page
      showHomePageBadges();

      // Init NEW badge in sidebar
      addNewBadgeToSidebar();

      // Display all content and layout for Quickstart Guide
      displayGettingStartedContent();

      // Init tracking for experiment links and landing page badges
      setUpTracking();
    } else {
      displayFirstGreenBuildContent();
    }
  })
  .catch(() => {
    displayFirstGreenBuildContent();
  });
