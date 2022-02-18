import { isElementInViewport } from '../utils';

/**
 * highlightTocOnScroll sets up IntersectionObservers to watch for when a
 * headline comes into view when scrolling a page. When a headlines enters the
 * view, we check to see if it is in the right table of contents - if it is ->
 * highlight it.
 *
 * */
export function highlightTocOnScroll(headings) {
  let isExperiment = true;
  if (!headings) {
    headings = document.querySelectorAll('h2, h3, h4, h5, h6');
    isExperiment = false;
  }

  const sidebarItems = Array.from(document.querySelectorAll('.toc-entry a'));
  const sidebarItemsText = sidebarItems.map((i) => i.innerText);
  const headlinesToIgnore = ['no_toc', 'toc-heading', 'help-improve-header'];
  const allHeadlines = Array.prototype.filter.call(
    headings,
    (item) =>
      ![...item.classList].some((className) =>
        headlinesToIgnore.includes(className),
      ),
  );

  // on click - add active class to clicked sidebar item.
  sidebarItems.forEach((clickedEntry) => {
    clickedEntry.addEventListener('click', () => {
      sidebarItems.forEach((el) => {
        el.classList.remove('active');
      });
      clickedEntry.classList.add('active');
    });
  });

  // https://caniuse.com/intersectionobserver
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      function (entry) {
        // check that 1) the item is visible/intersecting
        // and 2) that the sidebar items text actually has that headline before we make any changes.
        if (
          entry[0].isIntersecting === true &&
          sidebarItemsText.includes(entry[0].target.innerText)
        ) {
          let intersectingEntry = entry[0].target;
          let indexOfCurrentHeadline = allHeadlines.indexOf(intersectingEntry);

          if (isExperiment) {
            window.AnalyticsClient.trackAction(
              'docs-guided-tour-section-observed',
              {
                sectionTitle: intersectingEntry.innerText,
                sectionIndex: indexOfCurrentHeadline,
                page: location.pathname,
              },
            );
          }

          sidebarItems.forEach((el) => el.classList.remove('active'));
          sidebarItems[indexOfCurrentHeadline].classList.add('active');
        }
      },
      { threshold: [1.0], rootMargin: '0px 0px -60% 0px' },
    );

    allHeadlines.forEach((headline) => {
      observer.observe(headline);
    });
  }

  // on page load, find the highest item in the article view port that is also
  // in the sidebar and then add active class to it.
  const firstHeadlineInViewport = allHeadlines.find(isElementInViewport);
  if (firstHeadlineInViewport) {
    sidebarItems.forEach((item) => {
      if (item.textContent === firstHeadlineInViewport.textContent) {
        item.classList.add('active');
      }
    });
  }
}

let isTocHighlighted = false;
export const highlightTocOnScrollOnce = (headings) => {
  if (!isTocHighlighted) {
    isTocHighlighted = true;
    highlightTocOnScroll(headings);
  }
};

export const reconstructToC = (body) => {
  const tocList = document.getElementById('toc');
  tocList.innerHTML = '';

  const stack = [['H2', tocList]];
  const headings = body.querySelectorAll('h2, h3, h4, h5, h6');
  Array.prototype.forEach.call(headings, (htag) => {
    if (!htag.className.includes('no_toc')) {
      const a = document.createElement('a');
      a.href = `#${htag.id}`;
      a.text = htag.textContent;

      if (a.href === window.location.hash) {
        htag.scrollIntoView();
      }

      const li = document.createElement('li');
      li.classList.add('toc-entry', `toc-${htag.tagName.toLowerCase()}`);
      li.append(a);

      let [lastHTag, lastUL] = stack.slice(-1)[0];
      if (!lastUL.hasChildNodes()) {
        lastUL.append(li);
        return;
      }

      while (lastHTag > htag.tagName) {
        stack.pop();
        [lastHTag, lastUL] = stack.slice(-1)[0];
      }

      if (htag.tagName === lastHTag) {
        lastUL.append(li);
      } else if (lastHTag < htag.tagName) {
        const ul = document.createElement('ul');
        ul.append(li);
        stack.push([htag.tagName.toUpperCase(), ul]);
        lastUL.lastChild.appendChild(ul);
      }
    }
  });

  document.getElementById('full-height').style.visibility = 'visible';
  highlightTocOnScrollOnce(headings);
};
