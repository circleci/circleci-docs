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
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '16')
      svg.setAttribute('height', '21')
      svg.setAttribute('viewBox', '0 0 16 21')
      svg.setAttribute('fill', 'none')
      svg.setAttribute('class', 'copy-icon')
      svg.setAttribute('aria-hidden', 'true')
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill-rule', 'evenodd')
      path.setAttribute('clip-rule', 'evenodd')
      path.setAttribute('d', 'M7 2.50415C6.44772 2.50415 6 2.95187 6 3.50415V13.5042C6 14.0564 6.44772 14.5042 7 14.5042H13C13.5523 14.5042 14 14.0564 14 13.5042V8.50415H11C9.89543 8.50415 9 7.60872 9 6.50415V2.50415H7ZM11 4.00415V6.50415H13.381L11 4.00415ZM4 3.50415C4 1.8473 5.34315 0.50415 7 0.50415H9.14286C9.96389 0.50415 10.749 0.840645 11.3153 1.43518L15.1724 5.48519C15.7037 6.04301 16 6.78382 16 7.55415V13.5042C16 15.161 14.6569 16.5042 13 16.5042H12V17.5042C12 19.161 10.6569 20.5042 9 20.5042H3C1.34315 20.5042 0 19.161 0 17.5042V7.50415C0 5.8473 1.34315 4.50415 3 4.50415H4V3.50415ZM7 16.5042H10V17.5042C10 18.0564 9.55229 18.5042 9 18.5042H3C2.44772 18.5042 2 18.0564 2 17.5042V7.50415C2 6.95187 2.44772 6.50415 3 6.50415H4V13.5042C4 15.161 5.34315 16.5042 7 16.5042Z')
      path.setAttribute('fill', 'currentColor')
      svg.appendChild(path)
      copy.appendChild(svg)
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
