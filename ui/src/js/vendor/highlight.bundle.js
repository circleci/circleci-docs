;(function () {
  'use strict'

  const hljs = require('highlight.js/lib')
  // Register all languages first
  hljs.registerLanguage('asciidoc', require('highlight.js/lib/languages/asciidoc'))
  hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
  hljs.registerLanguage('clojure', require('highlight.js/lib/languages/clojure'))
  hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'))
  hljs.registerLanguage('cs', require('highlight.js/lib/languages/csharp'))
  hljs.registerLanguage('css', require('highlight.js/lib/languages/css'))
  hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'))
  hljs.registerLanguage('dockerfile', require('highlight.js/lib/languages/dockerfile'))
  hljs.registerLanguage('elixir', require('highlight.js/lib/languages/elixir'))
  hljs.registerLanguage('go', require('highlight.js/lib/languages/go'))
  hljs.registerLanguage('groovy', require('highlight.js/lib/languages/groovy'))
  hljs.registerLanguage('haskell', require('highlight.js/lib/languages/haskell'))
  hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
  hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
  hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))
  hljs.registerLanguage('julia', require('highlight.js/lib/languages/julia'))
  hljs.registerLanguage('kotlin', require('highlight.js/lib/languages/kotlin'))
  hljs.registerLanguage('lua', require('highlight.js/lib/languages/lua'))
  hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'))
  hljs.registerLanguage('nix', require('highlight.js/lib/languages/nix'))
  hljs.registerLanguage('none', require('highlight.js/lib/languages/plaintext'))
  hljs.registerLanguage('objectivec', require('highlight.js/lib/languages/objectivec'))
  hljs.registerLanguage('perl', require('highlight.js/lib/languages/perl'))
  hljs.registerLanguage('php', require('highlight.js/lib/languages/php'))
  hljs.registerLanguage('properties', require('highlight.js/lib/languages/properties'))
  hljs.registerLanguage('puppet', require('highlight.js/lib/languages/puppet'))
  hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
  hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'))
  hljs.registerLanguage('rust', require('highlight.js/lib/languages/rust'))
  hljs.registerLanguage('scala', require('highlight.js/lib/languages/scala'))
  hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
  hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))
  hljs.registerLanguage('swift', require('highlight.js/lib/languages/swift'))
  hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
  hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'))

  // Line Numbers implementation
  // Add line numbers functionality to hljs
  const TABLE_NAME = 'hljs-ln'
  const LINE_NAME = 'hljs-ln-line'
  const CODE_BLOCK_NAME = 'hljs-ln-code'
  const NUMBERS_BLOCK_NAME = 'hljs-ln-numbers'
  const NUMBER_LINE_NAME = 'hljs-ln-n'
  const DATA_ATTR_NAME = 'data-line-number'
  const BREAK_LINE_REGEXP = /\r\n|\r|\n/g

  // Add line numbers methods to hljs
  hljs.initLineNumbersOnLoad = initLineNumbersOnLoad
  hljs.lineNumbersBlock = lineNumbersBlock
  hljs.lineNumbersBlockSync = lineNumbersBlockSync
  hljs.lineNumbersValue = lineNumbersValue

  // Function to handle copy behavior for line numbered code
  function isHljsLnCodeDescendant (domElt) {
    let curElt = domElt
    while (curElt) {
      if (curElt.className && curElt.className.indexOf('hljs-ln-code') !== -1) {
        return true
      }
      curElt = curElt.parentNode
    }
    return false
  }

  function getHljsLnTable (hljsLnDomElt) {
    let curElt = hljsLnDomElt
    while (curElt.nodeName !== 'TABLE') {
      curElt = curElt.parentNode
    }
    return curElt
  }

  // Edge workaround for copy/paste
  function edgeGetSelectedCodeLines (selection) {
    const selectionText = selection.toString()

    let tdAnchor = selection.anchorNode
    while (tdAnchor.nodeName !== 'TD') {
      tdAnchor = tdAnchor.parentNode
    }

    let tdFocus = selection.focusNode
    while (tdFocus.nodeName !== 'TD') {
      tdFocus = tdFocus.parentNode
    }

    let firstLineNumber = parseInt(tdAnchor.dataset.lineNumber, 10)
    let lastLineNumber = parseInt(tdFocus.dataset.lineNumber, 10)

    if (firstLineNumber != lastLineNumber) {
      let firstLineText = tdAnchor.textContent
      let lastLineText = tdFocus.textContent

      if (firstLineNumber > lastLineNumber) {
        let tmp = firstLineNumber
        firstLineNumber = lastLineNumber
        lastLineNumber = tmp
        tmp = firstLineText
        firstLineText = lastLineText
        lastLineText = tmp
      }

      while (selectionText.indexOf(firstLineText) !== 0) {
        firstLineText = firstLineText.slice(1)
      }

      while (selectionText.lastIndexOf(lastLineText) === -1) {
        lastLineText = lastLineText.slice(0, -1)
      }

      let selectedText = firstLineText
      const hljsLnTable = getHljsLnTable(tdAnchor)
      for (let i = firstLineNumber + 1; i < lastLineNumber; ++i) {
        const codeLineSel = format('.{0}[{1}="{2}"]', [CODE_BLOCK_NAME, DATA_ATTR_NAME, i])
        const codeLineElt = hljsLnTable.querySelector(codeLineSel)
        selectedText += '\n' + codeLineElt.textContent
      }
      selectedText += '\n' + lastLineText
      return selectedText
    } else {
      return selectionText
    }
  }

  // Consistent copy/paste behavior
  document.addEventListener('copy', function (e) {
    const selection = window.getSelection()
    if (isHljsLnCodeDescendant(selection.anchorNode)) {
      let selectionText
      if (window.navigator.userAgent.indexOf('Edge') !== -1) {
        selectionText = edgeGetSelectedCodeLines(selection)
      } else {
        selectionText = selection.toString()
      }
      e.clipboardData.setData('text/plain', selectionText)
      e.preventDefault()
    }
  })

  function initLineNumbersOnLoad (options) {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      documentReady(options)
    } else {
      window.addEventListener('DOMContentLoaded', function () {
        documentReady(options)
      })
    }
  }

  function documentReady (options) {
    try {
      const blocks = document.querySelectorAll('code.hljs,code.nohighlight')

      for (const i in blocks) {
        if (blocks.hasOwnProperty(i)) {
          if (!isPluginDisabledForBlock(blocks[i])) {
            lineNumbersBlock(blocks[i], options)
          }
        }
      }
    } catch (e) {
      console.error('LineNumbers error: ', e)
    }
  }

  function isPluginDisabledForBlock (element) {
    return element.classList.contains('nohljsln')
  }

  function lineNumbersBlock (element, options) {
    if (typeof element !== 'object') return

    async(function () {
      element.innerHTML = lineNumbersInternal(element, options)
    })
  }

  function lineNumbersBlockSync (element, options) {
    if (typeof element !== 'object') return

    element.innerHTML = lineNumbersInternal(element, options)
  }

  function lineNumbersValue (value, options) {
    if (typeof value !== 'string') return

    const element = document.createElement('code')
    element.innerHTML = value

    return lineNumbersInternal(element, options)
  }

  function lineNumbersInternal (element, options) {
    const internalOptions = mapOptions(element, options)
    duplicateMultilineNodes(element)
    return addLineNumbersBlockFor(element.innerHTML, internalOptions)
  }

  function addLineNumbersBlockFor (inputHtml, options) {
    const lines = getLines(inputHtml)

    if (lines[lines.length - 1].trim() === '') {
      lines.pop()
    }

    if (lines.length > 1 || options.singleLine) {
      let html = ''

      for (let i = 0, l = lines.length; i < l; i++) {
        html += format(
          '<tr>' +
                      '<td class="{0} {1}" {3}="{5}">' +
                          '<div class="{2}" {3}="{5}"></div>' +
                      '</td>' +
                      '<td class="{0} {4}" {3}="{5}">' +
                          '{6}' +
                      '</td>' +
                  '</tr>',
          [
            LINE_NAME,
            NUMBERS_BLOCK_NAME,
            NUMBER_LINE_NAME,
            DATA_ATTR_NAME,
            CODE_BLOCK_NAME,
            i + options.startFrom,
            lines[i].length > 0 ? lines[i] : ' ',
          ])
      }

      return format('<table class="{0}">{1}</table>', [TABLE_NAME, html])
    }

    return inputHtml
  }

  function mapOptions (element, options) {
    options = options || {}
    return {
      singleLine: getSingleLineOption(options),
      startFrom: getStartFromOption(element, options),
    }
  }

  function getSingleLineOption (options) {
    const defaultValue = false
    if (options.singleLine) {
      return options.singleLine
    }
    return defaultValue
  }

  function getStartFromOption (element, options) {
    const defaultValue = 1
    let startFrom = defaultValue

    if (isFinite(options.startFrom)) {
      startFrom = options.startFrom
    }

    const value = getAttribute(element, 'data-ln-start-from')
    if (value !== null) {
      startFrom = toNumber(value, defaultValue)
    }

    return startFrom
  }

  function duplicateMultilineNodes (element) {
    const nodes = element.childNodes
    for (const node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        const child = nodes[node]
        if (getLinesCount(child.textContent) > 0) {
          if (child.childNodes.length > 0) {
            duplicateMultilineNodes(child)
          } else {
            duplicateMultilineNode(child.parentNode)
          }
        }
      }
    }
  }

  function duplicateMultilineNode (element) {
    const className = element.className

    if (!(/hljs-/.test(className))) return

    const lines = getLines(element.innerHTML)

    for (var i = 0, result = ''; i < lines.length; i++) {
      const lineText = lines[i].length > 0 ? lines[i] : ' '
      result += format('<span class="{0}">{1}</span>\n', [className, lineText])
    }

    element.innerHTML = result.trim()
  }

  function getLines (text) {
    if (text.length === 0) return []
    return text.split(BREAK_LINE_REGEXP)
  }

  function getLinesCount (text) {
    return (text.trim().match(BREAK_LINE_REGEXP) || []).length
  }

  function async (func) {
    setTimeout(func, 0)
  }

  function format (format, args) {
    return format.replace(/\{(\d+)\}/g, function (m, n) {
      return args[n] !== undefined ? args[n] : m
    })
  }

  function getAttribute (element, attrName) {
    return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null
  }

  function toNumber (str, fallback) {
    if (!str) return fallback
    const number = Number(str)
    return isFinite(number) ? number : fallback
  }

  // First, highlight all code blocks
  ;[].slice.call(document.querySelectorAll('pre code.hljs[data-lang]')).forEach(function (node) {
    hljs.highlightBlock(node)
  })

  // Then, apply line numbers to highlighted blocks
  // hljs.initLineNumbersOnLoad() // Disabled to fix copy/paste issues
})()
