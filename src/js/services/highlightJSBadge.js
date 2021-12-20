$(() => {
  let codeSnippetBadges;

  const options = {
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
    copyIconClass: 'compass-copy',
    // optional content for icons class (<i class="fa fa-copy"></i> or <i class="material-icons">file_copy</i>)
    copyIconContent: '',

    // CSS class(es) used to render the done icon.
    checkIconClass: 'compass-check-circle text-success',
    checkIconContent: '',

    // function called before code is placed on clipboard that allows you inspect and modify
    // the text that goes onto the clipboard. Passes text and code root element (hljs).
    // Example:  function(text, codeElement) { return text + " $$$"; }
    onBeforeCodeCopied: function (text, codeElement) {
      if (!codeSnippetBadges) {
        codeSnippetBadges = document.getElementsByClassName('code-badge');
      }

      const codeSnippetPosition =
        Array.prototype.indexOf.call(
          codeSnippetBadges,
          // we use `previousSibling` to get the sibling `code-badge` node to the `codeElement`'s `hljs` `div`.
          codeElement.previousSibling,
        ) + 1;

      window.AnalyticsClient.trackAction('docs-copy-code-clicked', {
        page: location.pathname,
        codeSnippetPosition,
      });

      return text;
    },
  };
  window.highlightJsBadge(options);

  if (!codeSnippetBadges) {
    codeSnippetBadges = document.getElementsByClassName('code-badge');
  }

  const eventType = window.PointerEvent ? 'pointer' : 'mouse';
  for (let badge of codeSnippetBadges) {
    for (let btn of badge.getElementsByClassName('code-badge-copy-icon')) {
      btn.addEventListener(`${eventType}down`, (e) => {
        if (e.button == 0) {
          btn.setAttribute('id', 'code-badge-clicked');
        }
      });
      btn.addEventListener(`${eventType}up`, (e) => {
        if (e.button == 0) {
          btn.removeAttribute('id', 'code-badge-clicked');
        }
      });
      btn.addEventListener(`${eventType}out`, () => {
        btn.removeAttribute('id', 'code-badge-clicked');
      });
    }
  }
});
