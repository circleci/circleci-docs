const trackCopyCode = () => {
  const copyBtnArr = Array.from(
    document.getElementsByClassName('copy-to-clipboard-button'),
  );

  copyBtnArr.forEach((btn, index) => {
    btn.addEventListener('click', () => {
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
