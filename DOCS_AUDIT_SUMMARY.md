# Documentation Character Count Audit Report

**Date:** March 18, 2026  
**Analysis:** 666 .adoc files in the docs directory  
**Threshold:** 50,000 characters

## Summary Statistics

- **Total files analyzed:** 666
- **Total characters:** 5,205,229
- **Files flagged (over 50,000 chars):** 9
- **Files missing page-description:** 118
- **Files with both issues:** 4
- **Average characters per file:** 7,815

## Files Flagged for Splitting (Over 50,000 Characters)

These pages are large and should be considered for splitting into smaller, more manageable pages:

1. **configuration-reference.adoc** - 106,595 characters ⚠️ CRITICAL
   - Path: `docs/reference/modules/ROOT/pages/configuration-reference.adoc`
   - This file is more than 2x the threshold and should be prioritized for splitting
   - Has page-description: ✓

2. **users-organizations-and-integrations-guide.adoc** - 59,069 characters
   - Path: `docs/guides/modules/permissions-authentication/pages/users-organizations-and-integrations-guide.adoc`
   - Has page-description: ✓

3. **installation-reference.adoc** (v4.8) - 55,992 characters
   - Path: `docs/server-admin-4.8/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✓

4. **values.adoc** (v4.9) - 55,728 characters ⚠️ MISSING PAGE-DESCRIPTION
   - Path: `docs/server-admin-4.9/modules/ROOT/partials/installation/values.adoc`
   - Has page-description: ✗

5. **installation-reference.adoc** (v4.7) - 54,223 characters
   - Path: `docs/server-admin-4.7/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✓

6. **installation-reference.adoc** (v4.6) - 53,151 characters
   - Path: `docs/server-admin-4.6/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✓

7. **installation-reference.adoc** (v4.5) - 52,735 characters ⚠️ MISSING PAGE-DESCRIPTION
   - Path: `docs/server-admin-4.5/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✗

8. **installation-reference.adoc** (v4.4) - 50,125 characters ⚠️ MISSING PAGE-DESCRIPTION
   - Path: `docs/server-admin-4.4/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✗

9. **installation-reference.adoc** (v4.3) - 50,101 characters ⚠️ MISSING PAGE-DESCRIPTION
   - Path: `docs/server-admin-4.3/modules/installation/pages/installation-reference.adoc`
   - Has page-description: ✗

## Files Missing Page-Description Attribute

**118 files** are missing the `:page-description:` attribute. The page-description attribute is important for:
- SEO (Search Engine Optimization)
- Page metadata and indexing
- Documentation discoverability
- Consistent documentation standards

### High Priority Files (Large + Missing Description)

These 4 files have both issues (over 50k chars AND missing page-description):

1. **values.adoc** (v4.9) - 55,728 chars
   - `docs/server-admin-4.9/modules/ROOT/partials/installation/values.adoc`

2. **installation-reference.adoc** (v4.5) - 52,735 chars
   - `docs/server-admin-4.5/modules/installation/pages/installation-reference.adoc`

3. **installation-reference.adoc** (v4.4) - 50,125 chars
   - `docs/server-admin-4.4/modules/installation/pages/installation-reference.adoc`

4. **installation-reference.adoc** (v4.3) - 50,101 chars
   - `docs/server-admin-4.3/modules/installation/pages/installation-reference.adoc`

### CSV Column Details

The CSV report now includes a `missing_page_description` column:
- **YES** = Missing page-description attribute (needs attention)
- **NO** = Has page-description attribute

You can filter the CSV in your spreadsheet application to see all 118 files missing this attribute.

### Distribution Analysis

Files missing page-description are distributed across various sections:
- Many are in `partials/` directories (installation phase files)
- Older server admin versions (4.2-4.5) have more missing descriptions
- Some pattern files and reference content lack descriptions

## Analysis & Recommendations

### Critical Priority
- **configuration-reference.adoc** (106,595 chars) - This is by far the largest file and more than double the threshold. High priority for splitting.

### Pattern Identified
- **installation-reference.adoc** appears across 7 different server admin versions (4.3-4.8), all exceeding the threshold
- These files share similar structure across versions, suggesting a common template could be split once and applied across versions

### Suggested Splitting Strategy

#### For configuration-reference.adoc:
Consider splitting by major configuration sections (e.g., jobs, workflows, executors, orbs, etc.)

#### For installation-reference.adoc files:
Consider splitting by installation phases or components (prerequisites, core installation, configuration, verification, etc.)

#### For users-organizations-and-integrations-guide.adoc:
Consider splitting into separate guides for users, organizations, and integrations

#### For values.adoc:
Consider splitting by configuration category or component

## Next Steps

### Size Issues (9 files)
1. Prioritize splitting **configuration-reference.adoc** first (106,595 chars - critical)
2. Address the **installation-reference.adoc** pattern across all versions (4.3-4.8)
3. Split **users-organizations-and-integrations-guide.adoc** and **values.adoc**

### Missing Page-Description (118 files)
4. Add page-description attributes to the 4 high-priority files (large + missing description)
5. Batch-add page-description attributes to remaining 114 files
6. Consider adding a linter or validation check to enforce page-description presence

### Standards
7. Consider establishing a page size guideline (e.g., target 20,000-30,000 characters per page)
8. Make page-description a required attribute for all new documentation pages

## Complete Data

The full character count data for all 666 files is available in `docs_character_audit.csv`, which can be opened in Excel, Google Sheets, or any spreadsheet application.
