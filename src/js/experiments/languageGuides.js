const displayElement = (el) => {
  if (el) {
    el.style.display = 'initial';
  }
};

// https://app.optimizely.com/v2/projects/16812830475/experiments/20872380274/variations
export default () =>
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_video_tab_to_docs_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '.treatment',
    attributes: {
      // https://app.optimizely.com/v2/projects/16812830475/audiences/20680670160
      windowWidth: window.innerWidth ?? 0,
    },
  }).then((variation) => {
    const elements = document.getElementsByClassName(variation ?? 'control');

    const homepage = document
      .getElementById('main')
      .getElementsByClassName(`row`)[0];

    const deferred = document.getElementsByClassName('loading-deferred');

    if (homepage) {
      Array.prototype.forEach.call(elements, displayElement);
      homepage.style.display = 'initial';
      Array.prototype.forEach.call(deferred, displayElement);
      return;
    }

    const element = elements[0];
    if (!element) return;

    if (
      element.firstElementChild?.firstElementChild?.firstElementChild
        ?.tagName === 'PRE'
    ) {
      element.removeChild(element.firstElementChild);
    }
    element.setAttribute('id', 'current-variation');

    const tocList = document.getElementById('toc');
    tocList.innerHTML = '';

    const stack = [['H2', tocList]];
    const headings = element.querySelectorAll('h2, h3, h4, h5, h6');
    Array.prototype.forEach.call(headings, (htag) => {
      if (!htag.className.includes('no_toc')) {
        const a = document.createElement('a');
        a.href = `#${htag.id}`;
        a.text = htag.textContent;

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
    Array.prototype.forEach.call(deferred, displayElement);
    return headings;
  });
