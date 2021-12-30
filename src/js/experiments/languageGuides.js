// https://app.optimizely.com/v2/projects/16812830475/experiments/20872380274/variations
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_add_video_tab_to_docs_test',
  groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
  experimentContainer: '.treatment',
  attributes: {
    // https://app.optimizely.com/v2/projects/16812830475/audiences/20680670160
    windowWidth: window.innerWidth ?? 0,
  },
}).then((variation = 'control') => {
  Array.prototype.forEach.call(
    document.getElementsByClassName(`${variation} language-guides`),
    (element) => {
      element.style.display = 'initial';

      const toc = document.getElementById('full-height');
      const tocList = toc.getElementById('toc');

      while (tocList.firstChild) {
        tocList.removeChild(parent.firstChild);
      }

      Array.prototype.forEach.call(
        element.querySelectorAll('h2, h3, h4, h5, h6'),
        (htag) => {
          const a = document.createElement('a');
          a.href = htag.id;
          a.text = htag.textContent;

          const li = document.createElement('li');
          li.classList.add('toc-entry', `toc-${htag.tagName.toLowerCase()}`);
          li.append(a);

          tocList.append(li);
        },
      );
      toc.style.visibility = 'visible';
    },
  );
});
