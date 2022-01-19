import { reconstructToC, highlightTocOnScrollOnce } from '../site/toc';
import { displayBlockElement, displayInitialElement } from '../utils';

// https://app.optimizely.com/v2/projects/16812830475/experiments/20872380274/variations
export default () =>
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_video_tab_to_docs_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
    experimentContainer: '.treatment',
  })
    .then((variation) => {
      const elements = document.getElementsByClassName(variation ?? 'control');

      // the homepage represents a separate problem because it does not change
      // all of the content. instead, it only adds a few sections to the top.
      const homepage = document
        .getElementById('main')
        .getElementsByClassName(`row`)[0];

      const deferred = document.getElementsByClassName('loading-deferred');

      if (homepage) {
        Array.prototype.forEach.call(elements, displayInitialElement);
        homepage.style.display = 'initial';
        Array.prototype.forEach.call(deferred, displayBlockElement);
        return;
      }

      // by contrast to the homepage, all other pages rewrite the content in its
      // entirety.
      // the expectation is that all non-homepage guided tour pages only contain
      // 1 div element per treatment/control classes
      const element = elements[0];
      if (!element) return;

      element.setAttribute('id', 'current-variation');

      reconstructToC(element);

      Array.prototype.forEach.call(deferred, displayBlockElement);
    })
    .catch(highlightTocOnScrollOnce);
