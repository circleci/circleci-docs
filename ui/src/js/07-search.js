;(function () {
  'use strict'

  // Initialize search functionality when DOM is loaded
  document.addEventListener('DOMContentLoaded', setupSearch)

  // Configuration constants
  const ALGOLIA_APP_ID = 'U0RXNGRK45'
  const ALGOLIA_SEARCH_ONLY_KEY = 'acd02091c5079d698a0637ca692ebe07'
  const ALGOLIA_INDEX_NAME = 'circleci-docs'
  let PAGINATION_MAX_VISIBLE_PAGES = 5
  const SEARCH_DEBOUNCE_MS = 300
  const MIN_QUERY_LENGTH = 2
  const MOBILE_BREAKPOINT = 768 // md breakpoint (in pixels)

  function setupSearch () {
    // State variables
    let query = ''
    let pathCounts = {}
    let paginationData = null
    let isMobileView = window.innerWidth < MOBILE_BREAKPOINT
    if (isMobileView) {
      PAGINATION_MAX_VISIBLE_PAGES = 3
    }

    // DOM element references
    const elements = {
      header: document.querySelector('header'),
      searchInput: document.querySelector('header [data-search-input]'),
      mobileSearchInput: document.querySelector('[data-page-navigation] [data-search-input]'),
      clearButton: document.querySelector('header [data-search-clear]'),
      mobileClearButton: document.querySelector('[data-page-navigation] [data-search-clear]'),
      searchContainer: document.querySelector('header [data-search-results-container]'),
      mobileSearchContainer: document.querySelector('[data-page-navigation] [data-search-results-container]'),
      navigation: document.querySelector('[data-page-navigation]'),
      leftSideNav: document.querySelector('[data-left-side-nav-container]'),
      goToAppMobileButton: document.querySelector('[data-left-side-nav-container] + a'),
      searchResultPathsContainer: null,
      mobileSearchResultPathsContainer: null,
      pathsList: null,
      mobilePathsList: null,
      resultPathTemplateElement: null,
      mobileResultPathTemplateElement: null,
      resultsList: null,
      mobileResultsList: null,
      resultTemplateElement: null,
      mobileResultTemplateElement: null,
      paginationContainer: null,
      mobilePaginationContainer: null,
      prevButton: null,
      mobilePrevButton: null,
      nextButton: null,
      mobileNextButton: null,
      searchTimeout: null,
    }

    // Initialize and store DOM references
    function initializeDomReferences () {
      // Desktop search elements
      elements.searchResultPathsContainer = elements.searchContainer.querySelector('[data-search-result-paths]')
      elements.pathsList = elements.searchResultPathsContainer.querySelector('ul')
      elements.resultPathTemplateElement = elements.pathsList.querySelector('[data-search-result-path-group]')
      elements.pathsList.removeChild(elements.resultPathTemplateElement)

      const resultsList = elements.searchContainer.querySelector('[data-search-results]')
      elements.resultsList = resultsList
      elements.resultTemplateElement = resultsList.querySelector('[data-search-result]')
      resultsList.removeChild(elements.resultTemplateElement)

      elements.paginationContainer = elements.searchContainer.querySelector('[data-search-result-pagination]')
      elements.prevButton = elements.searchContainer.querySelector('[data-search-result-prev]')
      elements.nextButton = elements.searchContainer.querySelector('[data-search-result-next]')

      // Mobile search elements (if they exist)
      if (elements.mobileSearchContainer) {
        elements.mobileSearchResultPathsContainer = elements.mobileSearchContainer.querySelector('[data-search-result-paths]')
        elements.mobilePathsList = elements.mobileSearchResultPathsContainer.querySelector('ul')
        elements.mobileResultPathTemplateElement = elements.mobilePathsList.querySelector('[data-search-result-path-group]')
        if (elements.mobileResultPathTemplateElement) {
          elements.mobilePathsList.removeChild(elements.mobileResultPathTemplateElement)
        }

        const mobileResultsList = elements.mobileSearchContainer.querySelector('[data-search-results]')
        elements.mobileResultsList = mobileResultsList
        elements.mobileResultTemplateElement = mobileResultsList.querySelector('[data-search-result]')
        if (elements.mobileResultTemplateElement) {
          mobileResultsList.removeChild(elements.mobileResultTemplateElement)
        }

        elements.mobilePaginationContainer = elements.mobileSearchContainer.querySelector('[data-search-result-pagination]')
        elements.mobilePrevButton = elements.mobileSearchContainer.querySelector('[data-search-result-prev]')
        elements.mobileNextButton = elements.mobileSearchContainer.querySelector('[data-search-result-next]')
      }

      // Initial UI state
      elements.clearButton.classList.add('hidden')
      if (elements.mobileClearButton) {
        elements.mobileClearButton.classList.add('hidden')
      }
    }

    // Initialize Algolia client
    const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_ONLY_KEY)
    const searchIndex = searchClient.initIndex(ALGOLIA_INDEX_NAME)

    // ===== SEARCH FUNCTIONALITY =====

    async function search (searchQuery, componentPath) {
      // Reset to first page when component path changes
      if (componentPath && paginationData?.currentPath !== componentPath) {
        paginationData = { page: 0 }
      }

      const results = await searchIndex.search(searchQuery, {
        hitsPerPage: 10,
        page: paginationData?.page || 0,
        attributesToRetrieve: ['title', 'url', 'relUrl', 'path', 'content', 'component', 'version'],
        highlightPreTag: '<strong class="font-bold">',
        highlightPostTag: '</strong>',
        facets: ['component'],
        filters: componentPath && componentPath !== 'All' ? `component:"${componentPath}"` : undefined,
        maxValuesPerFacet: 100,
      })

      paginationData = {
        page: results.page,
        totalPages: results.nbPages,
        hitsPerPage: results.hitsPerPage,
        currentPath: componentPath,
      }

      if (!componentPath) {
        pathCounts = results.facets?.component || {}
      }

      setCurrentPath(componentPath ?? 'All')
      updatePathsList(componentPath ?? 'All')
      setResults(results.hits)
      console.log('Search results:', results)
    }

    // ===== DISPLAY FUNCTIONS =====

    function updatePathsList (selectedComponentPath) {
      const totalPaths = Object.keys(pathCounts).filter((path) => path !== 'All')

      // Set All as first item
      if (totalPaths.length > 0) {
        totalPaths.unshift('All')
      }

      // Update desktop paths list
      elements.pathsList.innerHTML = ''
      updatePathsListForContainer(
        elements.pathsList,
        elements.resultPathTemplateElement,
        totalPaths,
        selectedComponentPath
      )

      // Update mobile paths list if it exists
      if (elements.mobilePathsList) {
        elements.mobilePathsList.innerHTML = ''
        updatePathsListForContainer(
          elements.mobilePathsList,
          elements.mobileResultPathTemplateElement || elements.resultPathTemplateElement,
          totalPaths,
          selectedComponentPath
        )
      }
    }

    function updatePathsListForContainer (container, templateElement, paths, selectedPath) {
      paths.forEach((path) => {
        const [component, version] = path.split(':')
        const pathElement = templateElement.cloneNode(true)
        const parentButton = pathElement.querySelector('button')

        // Handle border styles differently for mobile vs desktop when selected
        if (selectedPath === path) {
          // Selected path: show accent-green border-b on mobile, border with link-on-light on desktop
          parentButton.classList.add('border-b-2', 'border-accent-green')
          parentButton.classList.add('md:border', 'md:border-link-on-light', 'md:rounded-full')
        } else {
          // Non-selected path: no border-b on mobile, regular border on desktop
          parentButton.classList.remove('border-b-2', 'border-accent-green')
          parentButton.classList.remove('md:border', 'md:border-link-on-light', 'md:rounded-full')
        }

        const pathName = parentButton.querySelector('p')
        const pathCount = pathCounts[path] || 0
        pathName.textContent = `${component} ${version ? ` (${version})` : ''} `

        const pathCountElement = parentButton.querySelector('span')
        pathCountElement.textContent = pathCount

        parentButton.addEventListener('click', () => {
          onComponentPathClicked(path)
        })

        container.appendChild(pathElement)
      })
    }

    function setCurrentPath (path) {
      // Update desktop current path display
      updateCurrentPathDisplay(
        elements.searchContainer.querySelector('[data-results-current-path]'),
        path
      )

      // Update mobile current path display if it exists
      if (elements.mobileSearchContainer) {
        updateCurrentPathDisplay(
          elements.mobileSearchContainer.querySelector('[data-results-current-path]'),
          path
        )
      }
    }

    function updateCurrentPathDisplay (currentPathElement, path) {
      if (!currentPathElement) return

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

    function setResults (results) {
      // Update desktop results
      updateResultsForContainer(
        elements.resultsList,
        elements.resultTemplateElement,
        results
      )

      // Update mobile results if they exist
      if (elements.mobileResultsList) {
        updateResultsForContainer(
          elements.mobileResultsList,
          elements.mobileResultTemplateElement || elements.resultTemplateElement,
          results
        )
      }

      updatePagination()

      // Scroll back to the top of search results
      const currentContainer = isMobileView && elements.mobileSearchContainer
        ? elements.mobileSearchContainer
        : elements.searchContainer

      const searchResultsTop = currentContainer.querySelector('[data-results-current-path]')
      if (searchResultsTop) {
        searchResultsTop.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    function updateResultsForContainer (container, templateElement, results) {
      container.innerHTML = ''

      if (!results || results.length === 0) {
        const noResultsElement = document.createElement('p')
        noResultsElement.textContent = 'No results found'
        container.appendChild(noResultsElement)
        return
      }

      results.forEach((hit) => {
        const resultElement = templateElement.cloneNode(true)
        const titleElement = resultElement.querySelector('h3')
        const contentElement = resultElement.querySelector('p')

        titleElement.innerHTML = hit._highlightResult.title.value

        // Cap content to approximately 2 lines (~200 characters)
        const contentText = hit._highlightResult.content.value
        contentElement.innerHTML = contentText.length > 300
          ? contentText.substring(0, 200).replace(/\s+\S*$/, '') + '...'
          : contentText

        resultElement.href = hit.url
        container.appendChild(resultElement)
      })
    }

    function updatePagination () {
      // Update desktop pagination
      updatePaginationForContainer(
        elements.paginationContainer,
        elements.prevButton,
        elements.nextButton
      )

      // Update mobile pagination if it exists
      if (elements.mobilePaginationContainer) {
        updatePaginationForContainer(
          elements.mobilePaginationContainer,
          elements.mobilePrevButton,
          elements.mobileNextButton
        )
      }
    }

    function updatePaginationForContainer (paginationContainer, prevButton, nextButton) {
      if (!paginationContainer) return

      const paginationParent = paginationContainer.parentElement

      if (!paginationData || paginationData.totalPages <= 1) {
        // Hide pagination if there's only one page or no results
        paginationParent.classList.add('hidden')
        return
      }

      paginationParent.classList.remove('hidden')
      paginationContainer.innerHTML = ''

      const currentPage = paginationData.page
      const totalPages = paginationData.totalPages

      // Generate pagination display
      const paginationDisplay = generatePaginationDisplay(currentPage, totalPages)

      // Create page buttons
      paginationDisplay.forEach((page) => {
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
      updatePaginationControls(currentPage, totalPages, prevButton, nextButton)
    }

    function generatePaginationDisplay (currentPage, totalPages) {
      let pagesToShow = []

      if (totalPages <= PAGINATION_MAX_VISIBLE_PAGES) {
        // Show all pages if there are PAGINATION_MAX_VISIBLE_PAGES or fewer
        pagesToShow = Array.from({ length: totalPages }, (_, i) => i)
      } else {
        // Always include first and last page
        pagesToShow = [0, totalPages - 1]

        // Calculate the number of pages to show between first and last
        const innerPages = PAGINATION_MAX_VISIBLE_PAGES - 2 // 2 for first and last

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

      return finalPages
    }

    function updatePaginationControls (currentPage, totalPages, prevButton, nextButton) {
      if (!prevButton || !nextButton) return

      const prevButtonSvg = prevButton.querySelector('svg')
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

    // ===== MOBILE-SPECIFIC FUNCTIONS =====

    function showMobileSearchResults () {
      if (!elements.mobileSearchContainer || !elements.leftSideNav) return

      // Hide the navigation content
      elements.leftSideNav.classList.add('hidden')
      elements.goToAppMobileButton.classList.add('hidden')

      // Show the search results
      elements.mobileSearchContainer.classList.remove('hidden')

      // Open the navigation panel if it's closed
      if (elements.navigation.classList.contains('-translate-x-full')) {
        elements.navigation.classList.remove('-translate-x-full')
      }
    }

    function hideMobileSearchResults () {
      if (!elements.mobileSearchContainer || !elements.leftSideNav) return

      // Show the navigation content
      elements.leftSideNav.classList.remove('hidden')
      elements.goToAppMobileButton.classList.remove('hidden')

      // Hide the search results
      elements.mobileSearchContainer.classList.add('hidden')
    }

    function updateSearchUIForScreenSize () {
      isMobileView = window.innerWidth < MOBILE_BREAKPOINT

      // Reset UI when switching between mobile and desktop
      if (query.length >= MIN_QUERY_LENGTH) {
        if (isMobileView) {
          // On mobile: show search in navigation panel
          elements.searchContainer.classList.add('hidden')
          elements.header.classList.remove('h-dvh')
          showMobileSearchResults()
        } else {
          // On desktop: show search in header
          hideMobileSearchResults()
          elements.searchContainer.classList.remove('hidden')
          elements.header.classList.add('h-dvh')
        }
      }
    }

    // ===== EVENT HANDLERS =====

    function onComponentPathClicked (componentPath) {
      paginationData = null
      search(query, componentPath)
    }

    function handleSearchInput (e) {
      clearTimeout(elements.searchTimeout)
      query = e.target.value.trim()

      // Sync both search inputs
      if (e.target === elements.searchInput && elements.mobileSearchInput) {
        elements.mobileSearchInput.value = query
      } else if (e.target === elements.mobileSearchInput && elements.searchInput) {
        elements.searchInput.value = query
      }

      if (query.length < MIN_QUERY_LENGTH) {
        // Hide search results in both desktop and mobile
        elements.searchContainer.classList.add('hidden')
        elements.header.classList.remove('h-dvh')
        elements.clearButton.classList.remove('flex')
        elements.clearButton.classList.add('hidden')

        if (elements.mobileSearchContainer) {
          elements.mobileSearchContainer.classList.add('hidden')
          if (elements.leftSideNav) elements.leftSideNav.classList.remove('hidden')
          if (elements.mobileClearButton) {
            elements.mobileClearButton.classList.remove('flex')
            elements.mobileClearButton.classList.add('hidden')
          }
        }
        return
      }

      elements.searchTimeout = setTimeout(async () => {
        await search(query)

        if (isMobileView) {
          // Mobile view: show results in navigation panel
          showMobileSearchResults()
          if (elements.mobileClearButton) {
            elements.mobileClearButton.classList.remove('hidden')
            elements.mobileClearButton.classList.add('flex')
          }
        } else {
          // Desktop view: show results in header
          elements.searchContainer.classList.remove('hidden')
          elements.header.classList.add('h-dvh')
          elements.clearButton.classList.remove('hidden')
          elements.clearButton.classList.add('flex')
        }
      }, SEARCH_DEBOUNCE_MS)
    }

    function handleClearSearch () {
      query = ''
      elements.searchInput.value = ''
      if (elements.mobileSearchInput) elements.mobileSearchInput.value = ''

      // Hide desktop search
      elements.searchContainer.classList.add('hidden')
      elements.header.classList.remove('h-dvh')
      elements.clearButton.classList.remove('flex')
      elements.clearButton.classList.add('hidden')

      // Hide mobile search
      if (elements.mobileSearchContainer) {
        hideMobileSearchResults()
        if (elements.mobileClearButton) {
          elements.mobileClearButton.classList.remove('flex')
          elements.mobileClearButton.classList.add('hidden')
        }
      }
    }

    function handlePrevPage (e) {
      if (paginationData && paginationData.page > 0) {
        paginationData.page -= 1
        search(query, paginationData.currentPath)
      }
    }

    function handleNextPage (e) {
      if (paginationData && paginationData.page < paginationData.totalPages - 1) {
        paginationData.page += 1
        search(query, paginationData.currentPath)
      }
    }

    // ===== INITIALIZATION =====

    function initializeEventListeners () {
      // Desktop search event listeners
      elements.searchInput.addEventListener('input', handleSearchInput)
      elements.clearButton.addEventListener('click', handleClearSearch)
      elements.prevButton.addEventListener('click', handlePrevPage)
      elements.nextButton.addEventListener('click', handleNextPage)

      // Mobile search event listeners (if elements exist)
      if (elements.mobileSearchInput) {
        elements.mobileSearchInput.addEventListener('input', handleSearchInput)
      }
      if (elements.mobileClearButton) {
        elements.mobileClearButton.addEventListener('click', handleClearSearch)
      }
      if (elements.mobilePrevButton) {
        elements.mobilePrevButton.addEventListener('click', handlePrevPage)
      }
      if (elements.mobileNextButton) {
        elements.mobileNextButton.addEventListener('click', handleNextPage)
      }

      // Listen for window resize to handle mobile/desktop transitions
      window.addEventListener('resize', updateSearchUIForScreenSize)
    }

    // Initialize everything
    initializeDomReferences()
    initializeEventListeners()
    console.log('Search input initialized')
  }

  console.log('Search functionality initialized')
})()
