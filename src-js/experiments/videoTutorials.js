$(() => {
  // https://app.optimizely.com/v2/projects/16812830475/experiments/20790151733/variations
  window.OptimizelyClient.getVariationName({
    experimentKey: 'dd_add_video_tab_to_docs_test',
    groupExperimentName: 'q4_fy22_docs_disco_experiment_group_test',
  }).then((variation) => {
    if (variation === 'treatment') {
      $('.main-nav-item[data-section=video-tutorials]').show();

      // track clicks on sidebar
      $('.main-nav-item[data-section=video-tutorials]').click(function () {
        window.AnalyticsClient.trackAction('docs-video-tutorials-menu-clicked');
      });

      if (location.pathname === '/docs/2.0/video-tutorials/') {
        // track clicks on YT video
        $('.video-card a').click(function () {
          window.AnalyticsClient.trackAction(
            'docs-video-tutorials-video-clicked',
            {
              link: $(this).attr('href'),
            },
          );
        });

        // track if user scrolled in the page
        var userDidScroll = false;
        $(document).scroll(function () {
          if (!userDidScroll) {
            window.AnalyticsClient.trackAction(
              'docs-video-tutorials-video-page-scrolled',
            );
          }
          userDidScroll = true;
        });
      }
    }
  });
});
