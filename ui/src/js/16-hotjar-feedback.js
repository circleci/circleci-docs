;(function () {
  'use strict'

  var yesBtn = document.getElementById('docs-vote-yes')
  var noBtn = document.getElementById('docs-vote-no')

  function onVote(vote, selectedBtn, otherBtn) {
    if (typeof window.hj === 'function') {
      window.hj('event', 'docs_page_feedback')
    }
    if (typeof window.analytics === 'object') {
      window.analytics.track('docs_page_vote', {
        vote: vote,
        page: window.location.pathname,
      })
    }

    ;[selectedBtn, otherBtn].forEach(function (btn) {
      btn.classList.remove('border-link-on-light', 'text-link-on-light', 'opacity-50')
    })

    selectedBtn.setAttribute('aria-pressed', 'true')
    selectedBtn.classList.add('border-link-on-light', 'text-link-on-light')

    otherBtn.setAttribute('aria-pressed', 'false')
    otherBtn.classList.add('opacity-50')
  }

  if (yesBtn && noBtn) {
    yesBtn.addEventListener('click', function () { onVote('yes', yesBtn, noBtn) })
    noBtn.addEventListener('click', function () { onVote('no', noBtn, yesBtn) })
  }
})()
