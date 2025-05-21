;(function () {
  'use strict'

  // Initialize search functionality when DOM is loaded
  document.addEventListener('DOMContentLoaded', setupSearch)

  const ALGOLIA_APP_ID = 'K1G4UE06DN'
  const ALGOLIA_SEARCH_ONLY_KEY = 'b2ee3a11317bb3623765ef7fe73ee4c2'
  const ALGOLIA_INDEX_NAME = 'circleci-docs'

  function setupSearch () {
    let query = ''
    let pathCounts = {}
    const header = document.querySelector('header')
    const searchContainer = header.querySelector('[data-search-results-container]')
    const searchInput = header.querySelector('[data-search-input]')
    const clearButton = header.querySelector('[data-search-clear]')
    clearButton.classList.add('hidden')

    const searchResultPathsContainer = searchContainer.querySelector('[data-search-result-paths]')
    const pathsList = searchResultPathsContainer.querySelector('ul')
    const resultPathTemplateElement = pathsList.querySelector('[data-search-result-path-group]')
    // remove the template element
    pathsList.removeChild(resultPathTemplateElement)

    const onComponentPathClicked = (componentPath) => {
      paginationData = null
      search(query, componentPath)
    }

    const setCurrentPath = (path) => {
      const currentPathElement = searchContainer.querySelector('[data-results-current-path]')
      const pathName = currentPathElement.querySelector('h2')
      const pathCount = currentPathElement.querySelector('span')
      const componentTitle = path.split(':')[0]
      const version = path.split(':')[1]
      pathName.textContent = `${componentTitle} ${version ? ` (${version})` : ''} `
      if (path === 'All') {
        if (!pathCounts[path]) {
          pathCounts[path] = Object.keys(pathCounts).reduce((acc, key) => {
            return acc + pathCounts[key]
          }, 0)
        }
      }
      pathCount.textContent = pathCounts[path] || 0
    }

    const setResults = (results) => {
      const resultsList = searchContainer.querySelector('[data-search-results]')
      const resultTemplateElement = resultsList.querySelector('[data-search-result]')
      // remove the template element
      resultsList.removeChild(resultTemplateElement)

      resultsList.innerHTML = ''
      if (!results || results.length === 0) {
        const noResultsElement = document.createElement('p')
        noResultsElement.textContent = 'No results found'
        resultsList.appendChild(noResultsElement)
        updatePagination()
        return
      }
      results.forEach((hit) => {
        const resultElement = resultTemplateElement.cloneNode(true)
        const titleElement = resultElement.querySelector('h3')
        const contentElement = resultElement.querySelector('p')

        titleElement.innerHTML = hit._highlightResult.title.value
        // Cap content to approximately 2 lines (~200 characters)
        const contentText = hit._highlightResult.content.value
        contentElement.innerHTML = contentText.length > 300
          ? contentText.substring(0, 200).replace(/\s+\S*$/, '') + '...'
          : contentText
        resultElement.href = hit.relUrl

        resultsList.appendChild(resultElement)
      })

      // Update pagination after showing results
      updatePagination()

      // Scroll back to the top of search results
      const searchResultsTop = searchContainer.querySelector('[data-results-current-path]')
      if (searchResultsTop) {
        searchResultsTop.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const updatePagination = () => {
      if (!paginationData || paginationData.totalPages <= 1) {
        // Hide pagination if there's only one page or no results
        searchContainer.querySelector('[data-search-result-pagination]').parentElement.classList.add('hidden')
        return
      }

      searchContainer.querySelector('[data-search-result-pagination]').parentElement.classList.remove('hidden')

      const paginationContainer = searchContainer.querySelector('[data-search-result-pagination]')
      const currentPage = paginationData.page
      const totalPages = paginationData.totalPages

      // Clear pagination container
      paginationContainer.innerHTML = ''

      // Define constant for consistent number of page buttons
      const MAX_VISIBLE_PAGES = 5

      // Determine which page numbers to show
      let pagesToShow = []
      if (totalPages <= MAX_VISIBLE_PAGES) {
        // Show all pages if there are MAX_VISIBLE_PAGES or fewer
        pagesToShow = Array.from({ length: totalPages }, (_, i) => i)
      } else {
        // Always include first and last page
        pagesToShow = [0, totalPages - 1]

        // Calculate the number of pages to show between first and last
        const innerPages = MAX_VISIBLE_PAGES - 2 // 2 for first and last

        // Calculate the center point for pagination (centered around current page)
        let startPage = Math.max(1, currentPage - Math.floor(innerPages / 2))
        let endPage = startPage + innerPages - 1

        // Adjust if we're too close to the end
        if (endPage >= totalPages - 1) {
          endPage = totalPages - 2
          startPage = Math.max(1, endPage - innerPages + 1)
        }

        // Add the inner pages
        for (let i = startPage; i <= endPage; i++) {
          pagesToShow.push(i)
        }

        // Sort to ensure correct order
        pagesToShow.sort((a, b) => a - b)
      }

      // Add ellipsis indicators
      const uniquePages = [...new Set(pagesToShow)].sort((a, b) => a - b)
      let prevPage = -1
      const finalPages = []

      uniquePages.forEach((page) => {
        if (prevPage !== -1 && page - prevPage > 1) {
          finalPages.push('ellipsis')
        }
        finalPages.push(page)
        prevPage = page
      })

      // Create page buttons
      finalPages.forEach((page) => {
        if (page === 'ellipsis') {
          const ellipsis = document.createElement('span')
          ellipsis.className = 'p-4 rounded-full'
          ellipsis.textContent = '...'
          paginationContainer.appendChild(ellipsis)
        } else {
          const button = document.createElement('button')
          button.className = page === currentPage
            ? 'bg-link-on-light px-[20px] py-[10px] rounded-full text-white'
            : 'p-4 rounded-full'
          button.textContent = page + 1 // Display 1-based index

          // Add click event
          button.addEventListener('click', () => {
            if (page !== currentPage) {
              paginationData.page = page
              search(query, paginationData.currentPath)
            }
          })

          paginationContainer.appendChild(button)
        }
      })

      // Configure prev/next buttons
      const prevButton = searchContainer.querySelector('[data-search-result-prev]')
      const prevButtonSvg = prevButton.querySelector('svg')
      const nextButton = searchContainer.querySelector('[data-search-result-next]')
      const nextButtonSvg = nextButton.querySelector('svg')

      if (currentPage === 0) {
        prevButtonSvg.classList.remove('text-link-on-light')
        prevButtonSvg.classList.add('text-disabled-element')
      } else {
        prevButtonSvg.classList.remove('text-disabled-element')
        prevButtonSvg.classList.add('text-link-on-light')
      }

      if (currentPage === totalPages - 1) {
        nextButtonSvg.classList.remove('text-link-on-light')
        nextButtonSvg.classList.add('text-disabled-element')
      } else {
        nextButtonSvg.classList.remove('text-disabled-element')
        nextButtonSvg.classList.add('text-link-on-light')
      }

      prevButton.disabled = currentPage === 0
      nextButton.disabled = currentPage === totalPages - 1
    }

    // Initialize Algolia client
    const searchClient = algoliasearch(
      ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_ONLY_KEY
    )
    const searchIndex = searchClient.initIndex(ALGOLIA_INDEX_NAME)
    let paginationData = null

    const search = async (quey, componentPath) => {
      // If componentPath is provided but page isn't changing, reset to first page
      if (componentPath && paginationData?.currentPath !== componentPath) {
        paginationData = { page: 0 }
      }

      const results = await searchIndex.search(quey, {
        hitsPerPage: 10,
        page: paginationData?.page || 0,
        attributesToRetrieve: ['title', 'url', 'relUrl', 'path', 'content', 'component', 'version'],
        highlightPreTag: '<strong class="font-bold">',
        highlightPostTag: '</strong>',
        // Add facets to get path counts
        facets: ['component'],
        filters: componentPath ? `component:"${componentPath}"` : undefined,
        maxValuesPerFacet: 100,
      })
      paginationData = {
        page: results.page,
        totalPages: results.nbPages,
        hitsPerPage: results.hitsPerPage,
        currentPath: componentPath,
      }

      if (!componentPath) {
        // Extract path counts from facets
        pathCounts = results.facets?.component || {}
      }

      const totalPaths = Object.keys(pathCounts).filter((path) => path !== 'All')
      pathsList.innerHTML = ''
      totalPaths.forEach((path) => {
        const [component, version] = path.split(':')
        const pathElement = resultPathTemplateElement.cloneNode(true)
        const parentButton = pathElement.querySelector('button')
        if (componentPath !== path) {
          parentButton.classList.toggle('border')
        }
        const pathName = parentButton.querySelector('p')
        const pathCount = pathCounts[path] || 0
        pathName.textContent = `${component} ${version ? ` (${version})` : ''} `
        const pathCountElement = parentButton.querySelector('span')
        pathCountElement.textContent = pathCount

        parentButton.addEventListener('click', () => {
          onComponentPathClicked(path)
        })

        pathsList.appendChild(pathElement)
      })

      setCurrentPath(componentPath ?? 'All')

      setResults(results.hits)
      console.log('Search results:', results)
    }

    let searchTimeout
    searchInput.addEventListener('input', function (e) {
      clearTimeout(searchTimeout)
      query = e.target.value.trim()

      if (query.length < 2) {
        searchContainer.classList.add('hidden')
        header.classList.remove('h-dvh')
        clearButton.classList.remove('flex')
        clearButton.classList.add('hidden')
        return
      }

      searchTimeout = setTimeout(async () => {
        await search(query)
        searchContainer.classList.remove('hidden')
        header.classList.add('h-dvh')
        clearButton.classList.remove('hidden')
        clearButton.classList.add('flex')
      }, 300)
    })

    clearButton.addEventListener('click', function () {
      searchInput.value = ''
      searchContainer.classList.add('hidden')
      header.classList.remove('h-dvh')
      clearButton.classList.remove('flex')
      clearButton.classList.add('hidden')
    })

    // Add event listeners for pagination controls
    const prevButton = searchContainer.querySelector('[data-search-result-prev]')
    const nextButton = searchContainer.querySelector('[data-search-result-next]')

    prevButton.addEventListener('click', () => {
      if (paginationData && paginationData.page > 0) {
        paginationData.page -= 1
        search(query, paginationData.currentPath)
      }
    })

    nextButton.addEventListener('click', () => {
      if (paginationData && paginationData.page < paginationData.totalPages - 1) {
        paginationData.page += 1
        search(query, paginationData.currentPath)
      }
    })

    console.log('Search input initialized')
  }

  console.log('Search functionality initialized')
})()
