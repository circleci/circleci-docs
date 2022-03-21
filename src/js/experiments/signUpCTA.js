// https://app.optimizely.com/v2/projects/16812830475/experiments/21229840508/variations
window.OptimizelyClient.getVariationName({
  experimentKey: 'dd_update_signup_cta_test',
  groupExperimentName: 'q1_fy23_docs_disco_experiment_group_test',
  experimentContainer: '.global-nav--footer',
  guestExperiment: true,
}).then((variation) => {
  const ctaBtn = document.getElementById('signup-cta');
  if (variation === 'treatment') {
    ctaBtn.innerHTML = 'Start Building for Free';
    ctaBtn.addEventListener('click', () => {
      window.AnalyticsClient.trackAction('Clicked New Signup CTA', {
        ctaText: 'Start Building for Free',
      });
    });
  } else if (variation === 'control') {
    ctaBtn.addEventListener('click', () => {
      window.AnalyticsClient.trackAction('Clicked Old Signup CTA', {
        ctaText: 'Signup',
      });
    });
  }
});
