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

function setUpTracking(variation) {
  if (window.location.pathname === '/docs/2.0/getting-started/') {
    window.AnalyticsClient.trackAction('visited-gettingStarted-page', {
      variation,
      referrer: document.referrer,
    });
  }

  // Adding tracking to a tags that link to /docs/2.0/getting-started/
  const linksToGettingStarted = Array.from(
    $("li > a[href='/docs/2.0/getting-started/']"),
  );
  linksToGettingStarted?.forEach((link, i) => {
    let linkLocation;
    if (i === 0) linkLocation = 'mobile-sidebar';
    if (i === 1) linkLocation = 'sidebar';
    if (i === 2) linkLocation = 'homePage-section-link';
    link?.addEventListener('click', () => {
      window.AnalyticsClient.trackAction('clicked-link-to-gettingStarted', {
        variation,
        linkLocation,
        referrer: document.referrer,
      });
    });
  });

  // Since we are using setUpTracking for both variations, we only want to add tracking for these elements if we are in treatment as they are unique for the experiment
  if (variation === 'treatment') {
    const badges = Array.from($('.wrapper-link'));
    badges.forEach((badge, i) => {
      // We are grabbing all the experimental badges from the landing page but the first element is unique as that links to /docs/2.0/getting-started/
      // We are grouping that first badge with the same event name thats being used for linksToGettingStarted above as we want to track the total number of visits to the treatment page of the experiment and the link the user clicked to get there
      if (i === 0) {
        badge.addEventListener('click', () => {
          window.AnalyticsClient.trackAction('clicked-link-to-gettingStarted', {
            variation,
            linkLocation: 'homePage-experiment-badge',
            referrer: document.referrer,
            badgeText: badge.innerText,
            badgeHref: badge.href,
          });
        });
      } else {
        badge.addEventListener('click', () => {
          window.AnalyticsClient.trackAction('clicked-landing-page-badge', {
            badgeText: badge.innerText,
            badgeHref: badge.href,
          });
        });
      }
    });

    const links = Array.from($('.treatment').find($('a')));
    links.forEach((link, i) => {
      link.addEventListener('click', () => {
        window.AnalyticsClient.trackAction(
          'clicked-on-getting-started-guide-link',
          {
            linkText: link.innerText,
            linkIndexOnPage: i + 1 + '/' + links.length,
            page: window.location.pathname,
          },
        );
      });
    });
  }
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
      // Init NEW badge in sidebar
      addNewBadgeToSidebar();

      // Init new badges on landing page
      showHomePageBadges();

      // Display all content and layout for Quickstart Guide
      displayGettingStartedContent();

      // Init tracking for experiment links and landing page badges
      setUpTracking(variation);
    } else {
      displayFirstGreenBuildContent();
      setUpTracking(variation);
    }
  })
  .catch(() => {
    // In case if users have ad blocker on which blocks optimizely, we will show content for control variation
    displayFirstGreenBuildContent();
    setUpTracking('control');
  });
