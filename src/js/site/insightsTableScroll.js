// This function will highlight a dom element with the ID found in the URL fragment
// Added to draw attention to specific entries in only the insights table
// Highlight can be generalized to rest of documentation later see main.scss
export function insightsTableScroll() {
  const searchParams = new URLSearchParams(window.location.search);
  const isHighlighted = searchParams.has('highlight');
  let hash = window.location.hash;

  if (isHighlighted && hash) {
    $(hash).addClass('highlight');

    window.addEventListener(
      'hashchange',
      () => {
        console.log('event listener');
        $('.highlight').removeClass('highlight');
        $(hashNew).attr('class', 'highlight');
        hash = hashNew;
      },
      false,
    );
  }
}
