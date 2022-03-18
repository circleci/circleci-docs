$(document).ready(function () {
  const isTroubleShootingPage =
    window.currentPage.name === '2.0/troubleshooting-common-issues' ||
    // This page does not exist yet, but it is likely to be translated.
    window.currentPage.name === 'ja/2.0/troubleshooting-common-issues';

  if (isTroubleShootingPage) {
    $('details').click(function (e) {
      window.AnalyticsClient.trackAction('dd_troubleshooting_common_issues_section_toggled', {
        section: e.target.outerText
      });
    });
  }
});
