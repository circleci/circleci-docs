# CSV Report Usage Guide

## Opening the Report

The `docs_character_audit.csv` file can be opened in:
- Microsoft Excel
- Google Sheets
- Apple Numbers
- LibreOffice Calc
- Any text editor or CSV viewer

## CSV Columns

| Column | Description | Values |
|--------|-------------|--------|
| `filename` | Name of the .adoc file | e.g., `configuration-reference.adoc` |
| `path` | Full path relative to workspace | e.g., `docs/reference/modules/ROOT/pages/...` |
| `character_count` | Total characters in file | Integer value |
| `flagged_over_50k` | File exceeds size threshold | `YES` or `NO` |
| `missing_page_description` | Missing page-description attribute | `YES` or `NO` |

## Common Filtering Tasks

### Find All Large Files
**Filter:** `flagged_over_50k = YES`  
**Result:** 9 files that need splitting

### Find All Files Missing Descriptions
**Filter:** `missing_page_description = YES`  
**Result:** 118 files that need page-description attributes

### Find High Priority Files (Both Issues)
**Filter:** `flagged_over_50k = YES` AND `missing_page_description = YES`  
**Result:** 4 critical priority files

### Find Files in Specific Directory
**Filter:** `path` contains your directory name  
**Example:** Filter `path` contains `server-admin-4.9`

## Sorting Recommendations

### By Size (Largest First)
**Sort:** `character_count` descending  
**Use case:** Identify which files to split first

### By Path (Alphabetical)
**Sort:** `path` ascending  
**Use case:** Review files by section or version

### By Filename (Alphabetical)
**Sort:** `filename` ascending  
**Use case:** Find specific file types or patterns

## Excel/Google Sheets Tips

### Create Pivot Tables
Analyze distribution of issues by:
- Directory (extract from `path` column)
- File size ranges
- Issue type combinations

### Conditional Formatting
Highlight cells where:
- `character_count > 50000` (red)
- `character_count > 30000` (yellow)
- `missing_page_description = YES` (orange)

### Calculate Statistics
- Average characters per directory
- Percentage of files with issues
- Distribution of file sizes

## Example Filters for Spreadsheet Applications

### Google Sheets
```
1. Select all data (Ctrl+A or Cmd+A)
2. Data > Create a filter
3. Click filter icon on column header
4. Select criteria (e.g., "YES" for flagged columns)
```

### Excel
```
1. Select all data
2. Data > Filter (or Ctrl+Shift+L)
3. Click dropdown arrow on column header
4. Check/uncheck values to filter
```

## Quick Analysis Queries

### Total characters in flagged files:
Filter `flagged_over_50k = YES`, then sum `character_count` column  
**Expected:** ~543,617 characters total

### Average size of files with issues:
Filter as needed, calculate average of `character_count` column

### Files per version:
Filter `path` by version number (e.g., "server-admin-4.8")

## Rerunning the Analysis

If the docs are updated, regenerate the report:

```bash
python3 analyze_docs.py
```

This will overwrite `docs_character_audit.csv` with fresh data.
