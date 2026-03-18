# Documentation Audit Action Plan

## Executive Summary

Based on the character count audit of 666 .adoc files:
- **9 files** require splitting (over 50,000 characters)
- **118 files** need page-description attributes added
- **4 files** have both issues (highest priority)

## Priority 1: Files with Both Issues (Size + Missing Description)

These files should be addressed first as they have both problems:

| File | Path | Characters | Issues |
|------|------|------------|--------|
| values.adoc (v4.9) | docs/server-admin-4.9/modules/ROOT/partials/installation/values.adoc | 55,728 | Size, No Description |
| installation-reference.adoc (v4.5) | docs/server-admin-4.5/modules/installation/pages/installation-reference.adoc | 52,735 | Size, No Description |
| installation-reference.adoc (v4.4) | docs/server-admin-4.4/modules/installation/pages/installation-reference.adoc | 50,125 | Size, No Description |
| installation-reference.adoc (v4.3) | docs/server-admin-4.3/modules/installation/pages/installation-reference.adoc | 50,101 | Size, No Description |

## Priority 2: Large Files with Descriptions

These files need splitting but already have proper metadata:

| File | Path | Characters |
|------|------|------------|
| configuration-reference.adoc | docs/reference/modules/ROOT/pages/configuration-reference.adoc | 106,595 |
| users-organizations-and-integrations-guide.adoc | docs/guides/modules/permissions-authentication/pages/users-organizations-and-integrations-guide.adoc | 59,069 |
| installation-reference.adoc (v4.8) | docs/server-admin-4.8/modules/installation/pages/installation-reference.adoc | 55,992 |
| installation-reference.adoc (v4.7) | docs/server-admin-4.7/modules/installation/pages/installation-reference.adoc | 54,223 |
| installation-reference.adoc (v4.6) | docs/server-admin-4.6/modules/installation/pages/installation-reference.adoc | 53,151 |

## Priority 3: Files Missing Descriptions (Normal Size)

114 files under 50,000 characters that need page-description attributes added. See CSV report filtered by `missing_page_description = YES` for complete list.

## Recommended Splitting Strategies

### configuration-reference.adoc (106,595 chars - CRITICAL)
**Current structure:** Single massive reference file covering all configuration keys

**Proposed split:**
1. Overview/Getting Started
2. Version and Setup Keys
3. Jobs Configuration
4. Workflows Configuration
5. Executors (docker, machine, macos, windows)
6. Commands and Parameters
7. Orbs Configuration
8. Pipeline Parameters
9. Advanced Configuration (caching, workspaces, artifacts)

**Estimated result:** 9 pages averaging ~12,000 characters each

### installation-reference.adoc (Multiple versions - 50k-56k chars each)
**Current structure:** Comprehensive installation guide in single file

**Proposed split:**
1. Installation Overview and Prerequisites
2. Environment-Specific Setup (AWS/GCP/Azure)
3. Configuration Reference (values)
4. Post-Installation and Verification

**Estimated result:** 4 pages per version, averaging ~13,000-14,000 characters each

**Note:** Apply this split to versions 4.3, 4.4, 4.5, 4.6, 4.7, and 4.8

### users-organizations-and-integrations-guide.adoc (59,069 chars)
**Current structure:** Combined guide covering three major topics

**Proposed split:**
1. User Accounts and Authentication
2. Organizations and Team Management
3. VCS Integrations Guide

**Estimated result:** 3 pages averaging ~20,000 characters each

### values.adoc (55,728 chars)
**Current structure:** Large table of configuration values

**Proposed split by component:**
1. Core Services Configuration
2. Build and Execution Configuration
3. Storage and Database Configuration
4. Networking and Security Configuration

**Estimated result:** 4 pages averaging ~14,000 characters each

## Implementation Recommendations

### Phase 1: Quick Wins
1. Add page-description to all 118 files missing it
   - Start with the 4 high-priority files
   - Batch process similar files (e.g., all installation phases together)

### Phase 2: Critical Splitting
2. Split configuration-reference.adoc (highest impact)
   - This is the most-used reference page
   - Improved navigation will benefit all users

### Phase 3: Version Consistency
3. Split installation-reference.adoc across all versions
   - Apply consistent structure across versions 4.3-4.8
   - Simplifies maintenance and version updates

### Phase 4: Remaining Large Files
4. Split users-organizations-and-integrations-guide.adoc
5. Split values.adoc

## Tooling Recommendations

### Validation
- Add pre-commit hook to check for page-description presence
- Add CI check to flag new pages over 30,000 characters
- Include character count in PR templates

### Documentation Standards
- Establish max page size: 30,000 characters (guideline)
- Make page-description required for all pages
- Create splitting guidelines for reference documentation

## Data Files

- **docs_character_audit.csv** - Full report (open in spreadsheet application)
- **DOCS_AUDIT_SUMMARY.md** - Executive summary
- **docs_audit_action_plan.md** - This planning document

Filter the CSV by:
- `flagged_over_50k = YES` to see large files
- `missing_page_description = YES` to see files needing metadata
- Both columns to find high-priority files
