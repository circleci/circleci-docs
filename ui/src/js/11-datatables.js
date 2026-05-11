// Simple DataTables initialization for sortable/searchable tables
;(function () {
  'use strict'

  // Initialize Simple DataTables on tables with specific class
  function initializeDataTables() {
    const tables = document.querySelectorAll('table.datatable')

    if (tables.length === 0) {
      console.log('No tables with .datatable class found')
      return
    }

        // Check if Simple DataTables is available globally
        if (typeof simpleDatatables === 'undefined' && typeof window.simpleDatatables === 'undefined') {
          console.log('Simple DataTables not yet available, waiting...')
          setTimeout(initializeDataTables, 100)
          return
        }

        // Get the DataTable constructor
        const DataTable = simpleDatatables?.DataTable || window.simpleDatatables?.DataTable || window.DataTable

        if (!DataTable) {
          console.error('DataTable constructor not found!')
          return
        }

    console.log(`Found ${tables.length} table(s) with .datatable class`)

    tables.forEach((table, index) => {
      try {
        console.log(`Initializing Simple DataTable ${index + 1} of ${tables.length}`)

        // Ensure table has a thead for proper functionality
        if (!table.querySelector('thead')) {
          console.warn(`Table ${index + 1} does not have a thead element. Simple DataTables may not work properly.`)
        }

        // Check for CSS classes that control column sorting
        let columnConfig = undefined

        // Check for specific no-sort classes (e.g., .no-sort-col-3)
        const classList = Array.from(table.classList)
        const noSortClasses = classList.filter(cls => cls.startsWith('no-sort-col-'))

        if (noSortClasses.length > 0) {
          const totalColumns = table.querySelector('thead tr').children.length
          const nonSortableColumns = noSortClasses.map(cls => {
            const match = cls.match(/no-sort-col-(\d+)/)
            return match ? parseInt(match[1]) : null
          }).filter(col => col !== null)

          console.log(`Non-sortable columns:`, nonSortableColumns)
          console.log(`Total columns:`, totalColumns)

          columnConfig = []
          for (let i = 0; i < totalColumns; i++) {
            const isSortable = !nonSortableColumns.includes(i)
            columnConfig.push({
              select: i,
              sortable: isSortable
            })
            console.log(`Column ${i}: sortable = ${isSortable}`)
          }
        }

        // Alternative: Check for .no-sort-description class (makes column 3 non-sortable for pipeline tables)
        else if (table.classList.contains('no-sort-description')) {
          const totalColumns = table.querySelector('thead tr').children.length
          columnConfig = []
          for (let i = 0; i < totalColumns; i++) {
            // For pipeline tables, column 3 is typically the description/value column
            const isSortable = i !== 3
            columnConfig.push({
              select: i,
              sortable: isSortable
            })
            console.log(`Column ${i}: sortable = ${isSortable} (description column rule)`)
          }
        }

        new DataTable(table, {
          searchable: true,
          sortable: true,
          paging: false,
          perPage: 25,
          perPageSelect: [10, 25, 50, 100],
          labels: {
            placeholder: "Filter records...",
            perPage: "Show {select} entries per page",
            noRows: "No data available in table",
            info: "Showing {start} to {end} of {rows} entries"
          },
          columns: columnConfig
        })

        console.log(`Simple DataTable initialized successfully for table ${index + 1}`)
      } catch (error) {
        console.error(`Error initializing Simple DataTable for table ${index + 1}:`, error)
      }
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDataTables)
  } else {
    initializeDataTables()
  }

  console.log('Simple DataTables module loaded')
})()