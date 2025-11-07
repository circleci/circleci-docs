#!/usr/bin/env node

/**
 * Find narrow tables that don't need .table-scroll wrappers
 * Requires: puppeteer
 * Usage: node scripts/check-table-overflow.js [build-dir]
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Get build directory from args or default to 'build'
const buildDir = process.argv[2] || 'build';

if (!fs.existsSync(buildDir)) {
  console.error(`❌ Build directory '${buildDir}' not found`);
  process.exit(1);
}

/**
 * Recursively find all HTML files
 */
function findHtmlFiles(dir) {
  const files = [];

  function walk(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Quick check if file contains tables (without parsing)
 */
function hasTables(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Quick string check - much faster than parsing
  return content.includes('<table') && content.includes('class="doc');
}

/**
 * Check a single page for overflowing tables
 */
async function checkPage(page, filePath) {
  const fileUrl = `file://${path.resolve(filePath)}`;

  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (err) {
    console.warn(`⚠️  Could not load ${filePath}: ${err.message}`);
    return [];
  }

  // Extract table data - looking for narrow tables with scroll wrappers
  const results = await page.evaluate(() => {
    const tables = document.querySelectorAll('.doc table');
    const narrowTables = [];

    tables.forEach((table, index) => {
      // Get the containing article or .doc container
      const container = table.closest('article.doc') || table.closest('.doc');

      if (!container) return;

      const tableWidth = table.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;

      // Get page title
      const pageTitle = document.querySelector('h1.page')?.textContent?.trim() ||
                       document.querySelector('h1')?.textContent?.trim() ||
                       'Unknown Page';

      // Count columns
      const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
      const columnCount = headerRow ? headerRow.querySelectorAll('th, td').length : 0;

      // Check if in scrollable wrapper
      let parent = table.parentElement;
      let hasScrollWrapper = false;
      let scrollWrapperClass = '';
      while (parent && parent !== container) {
        const overflow = window.getComputedStyle(parent).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') {
          hasScrollWrapper = true;
          scrollWrapperClass = parent.className;
          break;
        }
        parent = parent.parentElement;
      }

      // Table is narrow enough that it doesn't need scroll wrapper
      const widthPercent = Math.round((tableWidth / containerWidth) * 100);
      const isNarrow = tableWidth < containerWidth * 0.95; // Less than 95% of container

      // Flag narrow tables that have unnecessary scroll wrappers
      if (isNarrow && hasScrollWrapper) {
        narrowTables.push({
          tableIndex: index + 1,
          pageTitle,
          tableWidth: Math.round(tableWidth),
          containerWidth: Math.round(containerWidth),
          widthPercent,
          columnCount,
          scrollWrapperClass,
          tableClasses: table.className
        });
      }
    });

    return narrowTables;
  });

  return results.map(r => ({
    ...r,
    file: filePath.replace(buildDir + '/', '')
  }));
}

async function main() {
  console.log('🔍 Starting table overflow check with Puppeteer...\n');

  const allHtmlFiles = findHtmlFiles(buildDir);
  console.log(`Found ${allHtmlFiles.length} HTML files total`);

  // Pre-filter to only files with tables (fast)
  console.log('Filtering for files with tables...');
  const filesWithTables = allHtmlFiles.filter(hasTables);
  console.log(`Found ${filesWithTables.length} files with tables (checking only these)\n`);

  if (filesWithTables.length === 0) {
    console.log('✅ No tables found in build\n');
    return;
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const allNarrowTables = [];

  // Process files in parallel batches for speed
  const PARALLEL_PAGES = 5; // Check 5 pages at once
  const batches = [];
  for (let i = 0; i < filesWithTables.length; i += PARALLEL_PAGES) {
    batches.push(filesWithTables.slice(i, i + PARALLEL_PAGES));
  }

  console.log(`Processing ${batches.length} batches of up to ${PARALLEL_PAGES} files in parallel...\n`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Create multiple pages and check them in parallel
    const batchResults = await Promise.all(
      batch.map(async (file) => {
        const page = await browser.newPage();
        // Set viewport to desktop size (1200px)
        await page.setViewport({ width: 1200, height: 800 });
        const result = await checkPage(page, file);
        await page.close();
        return result;
      })
    );

    // Flatten results
    batchResults.forEach(result => allNarrowTables.push(...result));

    // Progress update
    const checkedCount = Math.min((i + 1) * PARALLEL_PAGES, filesWithTables.length);
    console.log(`Progress: ${checkedCount}/${filesWithTables.length} files checked...`);
  }

  await browser.close();

  console.log(`\n✅ Checked ${filesWithTables.length} files with tables\n`);

  if (allNarrowTables.length === 0) {
    console.log('🎉 All tables are either wide (need scroll) or already unwrapped!\n');
    return;
  }

  // Sort by width percent (narrowest first - most obvious candidates)
  allNarrowTables.sort((a, b) => a.widthPercent - b.widthPercent);

  console.log(`📋 Found ${allNarrowTables.length} narrow tables with scroll wrappers:\n`);
  console.log('═'.repeat(80) + '\n');
  console.log('These tables are narrow enough that the .table-scroll wrapper can be removed.\n');

  // Group by file
  const byFile = {};
  allNarrowTables.forEach(item => {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push(item);
  });

  Object.keys(byFile).sort().forEach(file => {
    console.log(`📄 ${file}`);
    console.log(`   Page: ${byFile[file][0].pageTitle}\n`);

    byFile[file].forEach(item => {
      console.log(`   Table ${item.tableIndex}:`);
      console.log(`   • Table width: ${item.tableWidth}px (${item.widthPercent}% of container)`);
      console.log(`   • Container width: ${item.containerWidth}px`);
      console.log(`   • Columns: ${item.columnCount}`);
      console.log(`   • Scroll wrapper: ${item.scrollWrapperClass}`);
      console.log(`   💡 SAFE TO REMOVE: Table is only ${item.widthPercent}% of container width`);
      console.log();
    });
    console.log('─'.repeat(80) + '\n');
  });

  // Summary
  const veryNarrow = allNarrowTables.filter(t => t.widthPercent < 80);

  console.log('📊 Summary:');
  console.log(`   Tables with unnecessary scroll wrappers: ${allNarrowTables.length}`);
  console.log(`   Very narrow (<80% width): ${veryNarrow.length} (definitely safe to remove)`);
  console.log();
  console.log('💡 These scroll wrappers can be removed to improve appearance.\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
