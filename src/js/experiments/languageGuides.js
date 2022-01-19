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

      const element = elements[0];
      if (!element) return;

      element.setAttribute('id', 'current-variation');

      reconstructToC(element);

      Array.prototype.forEach.call(deferred, displayBlockElement);
    })
    .catch(highlightTocOnScrollOnce);
