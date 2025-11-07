#!/usr/bin/env node

/**
 * Check for tables that overflow their container width
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

  // Extract table overflow data
  const results = await page.evaluate(() => {
    const tables = document.querySelectorAll('.doc table');
    const overflows = [];

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
      while (parent && parent !== container) {
        const overflow = window.getComputedStyle(parent).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') {
          hasScrollWrapper = true;
          break;
        }
        parent = parent.parentElement;
      }

      const isOverflowing = tableWidth > containerWidth;

      if (isOverflowing) {
        overflows.push({
          tableIndex: index + 1,
          pageTitle,
          tableWidth: Math.round(tableWidth),
          containerWidth: Math.round(containerWidth),
          overflow: Math.round(tableWidth - containerWidth),
          overflowPercent: Math.round(((tableWidth - containerWidth) / containerWidth) * 100),
          columnCount,
          hasScrollWrapper,
          tableClasses: table.className
        });
      }
    });

    return overflows;
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

  const allOverflows = [];

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
        // Set viewport to wide desktop (1600px) so doc container gets full width
        await page.setViewport({ width: 1600, height: 800 });
        const result = await checkPage(page, file);
        await page.close();
        return result;
      })
    );

    // Flatten results
    batchResults.forEach(result => allOverflows.push(...result));

    // Progress update
    const checkedCount = Math.min((i + 1) * PARALLEL_PAGES, filesWithTables.length);
    console.log(`Progress: ${checkedCount}/${filesWithTables.length} files checked...`);
  }

  await browser.close();

  console.log(`\n✅ Checked ${filesWithTables.length} files with tables\n`);

  if (allOverflows.length === 0) {
    console.log('🎉 No overflowing tables found!\n');
    return;
  }

  // Sort by overflow amount (worst first)
  allOverflows.sort((a, b) => b.overflow - a.overflow);

  console.log(`❌ Found ${allOverflows.length} overflowing tables:\n`);
  console.log('═'.repeat(80) + '\n');

  // Group by file
  const byFile = {};
  allOverflows.forEach(item => {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push(item);
  });

  Object.keys(byFile).forEach(file => {
    console.log(`📄 ${file}`);
    console.log(`   Page: ${byFile[file][0].pageTitle}\n`);

    byFile[file].forEach(item => {
      console.log(`   Table ${item.tableIndex}:`);
      console.log(`   • Columns: ${item.columnCount}`);
      console.log(`   • Table width: ${item.tableWidth}px`);
      console.log(`   • Container width: ${item.containerWidth}px`);
      console.log(`   • Overflow: ${item.overflow}px (${item.overflowPercent}% too wide)`);
      console.log(`   • Has scroll wrapper: ${item.hasScrollWrapper ? '✓ YES' : '✗ NO'}`);
      if (!item.hasScrollWrapper) {
        console.log(`   ⚠️  FIX NEEDED: Wrap in .table-scroll div`);
      }
      console.log();
    });
    console.log('─'.repeat(80) + '\n');
  });

  // Summary
  const withoutScroll = allOverflows.filter(t => !t.hasScrollWrapper);
  const maxOverflow = Math.max(...allOverflows.map(t => t.overflow));

  console.log('📊 Summary:');
  console.log(`   Total overflowing tables: ${allOverflows.length}`);
  console.log(`   Without scroll wrapper: ${withoutScroll.length}`);
  console.log(`   Maximum overflow: ${maxOverflow}px`);
  console.log();

  if (withoutScroll.length > 0) {
    console.log('⚠️  ACTION REQUIRED:');
    console.log(`   ${withoutScroll.length} table(s) need to be wrapped in a .table-scroll container\n`);

    // Exit with error if tables overflow without scroll wrapper
    process.exit(1);
  }

  console.log('✅ All overflowing tables have scroll wrappers\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
