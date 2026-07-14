;(function () {
  'use strict'

  function onVote(vote) {
    if (typeof window.hj === 'function') {
      window.hj('event', 'docs_page_feedback')
    }
    if (typeof window.analytics === 'object') {
      window.analytics.track('docs_page_vote', {
        vote: vote,
        page: window.location.pathname,
      })
    }
  }

  var yesBtn = document.getElementById('docs-vote-yes')
  var noBtn = document.getElementById('docs-vote-no')

  if (yesBtn) yesBtn.addEventListener('click', function () { onVote('yes') })
  if (noBtn) noBtn.addEventListener('click', function () { onVote('no') })
})()
