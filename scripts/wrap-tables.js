#!/usr/bin/env node

/**
 * Wrap all tables in .table-scroll wrappers
 * Usage: node scripts/wrap-tables.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

/**
 * Recursively find all .adoc files
 */
function findAdocFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findAdocFiles(filePath, fileList);
      }
    } else if (file.endsWith('.adoc')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Wrap tables in a file
 */
function wrapTablesInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let modified = false;
  let inTable = false;
  let tableStartIndex = -1;
  let result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is the start of a table
    if (trimmed === '|===' && !inTable) {
      // Look backwards to see if there's already a wrapper
      let hasWrapper = false;
      let attributeLineIndex = i - 1;

      // Check for table attributes (like [cols=...], [.table-scroll], etc.)
      while (attributeLineIndex >= 0) {
        const prevLine = lines[attributeLineIndex].trim();

        // Found existing .table-scroll wrapper
        if (prevLine === '[.table-scroll]') {
          hasWrapper = true;
          break;
        }

        // Stop at empty line or non-attribute line
        if (prevLine === '' ||
            prevLine === '--' ||
            (!prevLine.startsWith('[') && !prevLine.startsWith('.')  && !prevLine.startsWith('|'))) {
          break;
        }

        attributeLineIndex--;
      }

      if (!hasWrapper) {
        // Find where to insert the wrapper
        // Look for table attributes before |===
        let insertIndex = i;
        let attributeIndex = i - 1;

        while (attributeIndex >= 0) {
          const prevLine = lines[attributeIndex].trim();

          // Table attribute line (like [cols=...], [options=...])
          if (prevLine.startsWith('[') && !prevLine.startsWith('[.')) {
            attributeIndex--;
            continue;
          }

          // Empty line - stop here
          if (prevLine === '') {
            insertIndex = attributeIndex + 1;
            break;
          }

          // Non-table content - insert after this
          insertIndex = attributeIndex + 1;
          break;
        }

        // Insert wrapper
        // Add blank line before wrapper if needed
        if (insertIndex > 0 && lines[insertIndex - 1].trim() !== '') {
          result.push('');
        }

        result.push('[.table-scroll]');
        result.push('--');

        // Add any attribute lines
        for (let j = insertIndex; j < i; j++) {
          result.push(lines[j]);
        }

        modified = true;
        inTable = true;
        tableStartIndex = insertIndex;
      } else {
        inTable = true;
      }

      result.push(line);
    }
    // Check if this is the end of a table
    else if (trimmed === '|===' && inTable) {
      result.push(line);

      // Only add closing delimiter if we added opening
      if (modified && tableStartIndex !== -1) {
        result.push('--');
        tableStartIndex = -1;
      }

      inTable = false;
    }
    // Regular line
    else {
      // Skip lines we already processed (between insertIndex and table start)
      if (!modified || i < tableStartIndex || !inTable) {
        result.push(line);
      }
    }

    i++;
  }

  return {
    modified,
    content: result.join('\n')
  };
}

/**
 * Process all files
 */
function main() {
  console.log('🔍 Finding .adoc files...\n');

  const docsFiles = findAdocFiles('docs');
  const archiveFiles = findAdocFiles('archive');
  const allFiles = [...docsFiles, ...archiveFiles];

  console.log(`Found ${allFiles.length} .adoc files\n`);

  let modifiedCount = 0;
  const modifiedFiles = [];

  allFiles.forEach(file => {
    const result = wrapTablesInFile(file);

    if (result.modified) {
      modifiedCount++;
      modifiedFiles.push(file);

      if (!dryRun) {
        fs.writeFileSync(file, result.content, 'utf-8');
        console.log(`✅ Wrapped tables in: ${file}`);
      } else {
        console.log(`📝 Would wrap tables in: ${file}`);
      }
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total files scanned: ${allFiles.length}`);
  console.log(`   Files modified: ${modifiedCount}`);

  if (dryRun) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ Done! All tables are now wrapped.`);
  }
}

main();
