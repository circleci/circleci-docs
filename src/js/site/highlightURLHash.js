// This function will highlight a dom element with the ID found in the URL fragment
// Added to draw attention to specific entries in only the insights table
// Highlight can be generalized to rest of documentation later see main.scss
export function highlightURLHash() {
  addHighlightClassIfInUrl();
  window.addEventListener(
    'hashchange',
    () => {
      const highlightElem = document.querySelector('.highlight');
      if (highlightElem) highlightElem.classList.remove('highlight');
      addHighlightClassIfInUrl();
    },
    false,
  );
}

export function addHighlightClassIfInUrl() {
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  const isHighlighted = searchParams.has('highlight');
  if (isHighlighted && hash) {
    const hashElem = document.querySelector(window.location.hash);
    hashElem.classList.add('highlight');
  }
}
