// This function will highlight a dom element with the ID found in the URL fragment
// Added to draw attention to specific entries in only the insights table
// Highlight can be generalized to rest of documentation later see main.scss
export function highlightURLHash() {
  addHighlightClassIfInUrl()
  window.addEventListener(
    'hashchange',
    () => {
      $('.highlight').removeClass('highlight');
      addHighlightClassIfInUrl();
    },
    false,
  );
}

export function addHighlightClassIfInUrl() {
  let hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  const isHighlighted = searchParams.has('highlight');
  if (isHighlighted && hash) {
    $(hash).addClass('highlight');
  }
}
