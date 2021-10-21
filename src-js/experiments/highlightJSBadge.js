window.onload = () => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20580130094/variations

  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_copy_code_button_to_docs',
    groupExperimentName: 'q3_fy22_docs_disco_experiment_group_test',
  }).then(function (variation) {
    if (variation === 'treatment') {
      var options = {
        // the selector for the badge template
        templateSelector: '#CodeBadgeTemplate',

        // base content CSS selector that is searched for snippets
        contentSelector: 'body',

        // Delay in ms used for `setTimeout` before badging is applied
        // Use if you need to time highlighting and badge application
        // since the badges need to be applied afterwards.
        // 0 - direct execution (ie. you handle timing
        loadDelay: 0,

        // CSS class(es) used to render the copy icon.
        copyIconClass: 'fa fa-copy',
        // optional content for icons class (<i class="fa fa-copy"></i> or <i class="material-icons">file_copy</i>)
        copyIconContent: '',

        // CSS class(es) used to render the done icon.
        checkIconClass: 'fa fa-check text-success',
        checkIconContent: '',

        // function called before code is placed on clipboard that allows you inspect and modify
        // the text that goes onto the clipboard. Passes text and code root element (hljs).
        // Example:  function(text, codeElement) { return text + " $$$"; }
        onBeforeCodeCopied: function (text) {
          window.AnalyticsClient.trackAction('docs-copy-code-clicked', {
            page: location.pathname,
          });
          return text;
        },
      };
      window.highlightJsBadge(options);
    }
  });
};
