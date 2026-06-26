;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-ask-ai-button]')

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.Kapa) {
          window.Kapa.open()
        }
      })
    })
  })
})()
