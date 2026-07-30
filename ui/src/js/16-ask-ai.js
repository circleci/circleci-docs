;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('[data-ask-ai-button]')

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.Kapa?.open?.()
      })
    })
  })
})()
