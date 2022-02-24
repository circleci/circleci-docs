const trackCopyCode = () => {
  const copyBtnArr = Array.from(
    document.getElementsByClassName('copy-to-clipboard-button'),
  );

  copyBtnArr.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // added this attribute in site/toc.js to help track where a code snippet is for pages with numerous snippets
      const closestTocSection =
        document.getElementById('active-toc-section').textContent;

      window.AnalyticsClient.trackAction('docs-copy-code-clicked', {
        page: window.location.pathname,
        codeSnippetPosition: index + 1,
        closestTocSection,
      });
    });
  });
};

export function init() {
  trackCopyCode();
}
