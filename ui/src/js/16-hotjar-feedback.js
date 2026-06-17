;(function () {
  'use strict'

  var btn = document.getElementById('hotjar-feedback-btn')
  if (!btn) return

  btn.addEventListener('click', function () {
    if (typeof window.hj === 'function') {
      window.hj('event', 'docs_page_feedback')
    }
  })
})()
