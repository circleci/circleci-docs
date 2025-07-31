;(function () {
  'use strict'

  var CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm
  var LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
  var TRAILING_SPACE_RX = / +$/gm

  var config = (document.getElementById('site-script') || { dataset: {} }).dataset
  var supportsCopy = window.navigator.clipboard
  var uiRootPath = (config.uiRootPath == null ? window.uiRootPath : config.uiRootPath) || '.'

  ;[].slice.call(document.querySelectorAll('.doc pre.highlight, .doc .literalblock pre')).forEach(function (pre) {
    var code, language, lang, copy, toast, toolbox
    if (pre.classList.contains('highlight')) {
      code = pre.querySelector('code')
      if ((language = code.dataset.lang) && language !== 'console') {
        ;(lang = document.createElement('span')).className = 'source-lang'
        lang.appendChild(document.createTextNode(language))
      }
    } else if (pre.innerText.startsWith('$ ')) {
      var block = pre.parentNode.parentNode
      block.classList.remove('literalblock')
      block.classList.add('listingblock')
      pre.classList.add('highlightjs', 'highlight')
      ;(code = document.createElement('code')).className = 'language-console hljs'
      code.dataset.lang = 'console'
      code.appendChild(pre.firstChild)
      pre.appendChild(code)
    } else {
      return
    }
    ;(toolbox = document.createElement('div')).className = 'source-toolbox'
    if (lang) toolbox.appendChild(lang)
    if (supportsCopy) {
      ;(copy = document.createElement('button')).className = 'copy-button'
      copy.setAttribute('title', 'Copy to clipboard')
      var img = document.createElement('img')
      img.src = uiRootPath + '/img/copy.svg'
      img.alt = 'copy icon'
      img.className = 'copy-icon'
      copy.appendChild(img)
      toolbox.appendChild(copy)
    }
    pre.parentNode.appendChild(toolbox)
    if (copy) copy.addEventListener('click', writeToClipboard.bind(copy, code))
  })

  function extractCommands (text) {
    var cmds = []
    var m
    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
    return cmds.join(' && ')
  }

  function writeToClipboard (code) {
    var text = code.innerText.replace(TRAILING_SPACE_RX, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
    window.navigator.clipboard.writeText(text).then(
      function () {
        // Create toast element dynamically
        var toast = document.createElement('span')
        toast.className = 'copy-toast'
        toast.appendChild(document.createTextNode('Copied!'))
        this.appendChild(toast)

        this.classList.add('clicked')
        this.offsetHeight // eslint-disable-line no-unused-expressions
        this.classList.remove('clicked')

        // Remove toast after animation completes
        setTimeout(function () {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast)
          }
        }, 1000) // Wait for transition duration + delay
      }.bind(this),
      function () {}
    )
  }
})()
