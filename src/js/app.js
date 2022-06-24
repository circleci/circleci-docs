/**
  WARNING: Consider import & execution order carefully in the context of the
  browser & the dom when modifying file
 */
import Prism from 'prismjs';
import '../styles/main.scss';

import site from './site';

// set to manual so we can start highlighting once DOM is ready
Prism.manual = true;

//services.rum.init();

$(() => {
  // Boolean whether or not URL is in Guided Tour experiment
  const isGatedPath =
    ['/docs/', '/docs/2.0/'].includes(window.location.pathname) ||
    ['-preview/', 'view/2.0/'].includes(window.location.pathname.slice?.(-9)) ||
    /language-(javascript|python)/gm.test(window.location.pathname);
  if (!isGatedPath) {
    /** If URL is not in Guided Tour experiment, then we can attach eventListeners
     *  for highlighting the Table of Contents in the sidebar as user scrolls.
     *
     *  If URL is in Guided Tour experiment, then it must wait for experiment
     *  logic to complete before attaching eventListeners since the ToC is
     *  different in treatment vs control.
     */
    site.toc.highlightTocOnScrollOnce();
  }
  Prism.highlightAll();
  // trackCopyCode service MUST be initialized after PrismJS is initialized
  //services.trackCopyCode.init();
  //services.trackExperimentEntry.init();
});
