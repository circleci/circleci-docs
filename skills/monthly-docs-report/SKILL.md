---
name: monthly-docs-report
description: Generate a monthly documentation report from git history. Use this skill when the user asks to create a monthly docs report, monthly newsletter, or wants to summarize documentation changes for a specific month. Trigger when user mentions "monthly report", "docs newsletter", "documentation changes for [month]", or similar phrasing.
---

# Monthly Documentation Report Generator

Generate a structured monthly report of documentation changes from git commit history.

## What this skill does

Analyzes git commits for a specified month and produces a markdown report categorizing documentation changes. The report is formatted for easy copying into Google Docs and uses clear, factual language without hyperbole.

## When to use this skill

- User asks for a monthly documentation report or newsletter
- User wants to see what documentation work was done in a specific month
- User mentions analyzing or summarizing docs changes for a time period

## Report Structure

The report should follow this exact structure:

```markdown
# [Month YYYY] Documentation Updates

## Summary Statistics

- Total commits: [N] (excluding dependency updates and merges)
- New documentation pages: [N]
- Configuration reference updates: [N]
- Contributors: [N]

## New Pages

- **[Page Title]** ([PR #]) - Contributor Name
  - Brief description of what the page covers
  - Key topics or use cases addressed

## Major Features and Updates

- **[Feature/Update Name]** ([PR #]) - Contributor Name
  - What changed or was added
  - Impact or purpose of the change

## Reference Updates

- **[What was added to config reference]** ([PR #]) - Contributor Name
  - Brief description of the addition

## Infrastructure and Tooling Updates

- **[Tool/Infrastructure Change]** ([PR #]) - Contributor Name
  - What changed and why it matters
```

## Process

### 1. Get the time period

Ask the user which month and year they want to analyze if not specified.

### 2. Extract git commits

Run these git commands to gather commit data:

```bash
# Get all non-merge commits for the month
git log --since="YYYY-MM-01" --until="YYYY-MM-31" --oneline --no-merges

# Get commits excluding dependency updates
git log --since="YYYY-MM-01" --until="YYYY-MM-31" --oneline --no-merges | \
  grep -vE "(chore\(deps\)|fix\(deps\)|Update dependency|Update Node.js|Update aws-sdk|Update module|Update tailwindcss|Update cimg/)"

# For key commits, get details with file changes
git show --stat --oneline <commit-hash>
```

### 3. Categorize changes

Review the commits and categorize them:

**New Pages**: Look for commits that add new `.adoc` files or mention "new page", "new guide", "new documentation"

**Major Features and Updates**: Look for:
- New feature documentation
- Significant updates to existing docs
- New integration guides
- Major content additions (not minor fixes)

**Reference Updates**: Look for commits that modify `configuration-reference.adoc` or explicitly mention adding to the config reference

**Infrastructure and Tooling**: Look for:
- Build system changes
- Documentation tooling updates
- CI/CD changes
- Linting/quality tools
- Developer workflow improvements

### 4. Filter out noise

Exclude these from detailed listings:
- Dependency updates (already filtered in git commands)
- Minor typo fixes (unless part of a larger campaign)
- Merge commits
- Version bumps

You can mention large cleanup campaigns (e.g., "Vale linting cleanup across 60+ files") as a single infrastructure item.

### 5. Extract key information

For each significant change:
- PR number (from commit message like `(#10123)`)
- Contributor name (from git log with `--format="%an"`)
- Brief description (1-2 bullets max)

To get contributor names along with commits:
```bash
git log --since="YYYY-MM-01" --until="YYYY-MM-31" --pretty=format:"%h | %s | %an" --no-merges
```

When multiple people contribute to related changes, list all contributors (e.g., "Contributor A, Contributor B")

### 6. Count contributors

```bash
# Get unique contributor count for the month
git log --since="YYYY-MM-01" --until="YYYY-MM-31" --format="%an" | \
  grep -vE "(dependabot|renovate)" | sort -u | wc -l
```

### 7. Generate the report

Write the markdown file to `[month]-[year]-newsletter.md` (e.g., `april-2026-newsletter.md`).

## Writing Guidelines

**Be factual and concise:**
- State what changed, not how great it is
- Use clear, direct language
- Avoid superlatives like "comprehensive", "massive", "excellent"
- Don't rank or highlight specific contributors as "top"

**Good examples:**
- "Added Slack integration documentation with setup instructions"
- "Documented job groups feature for serial execution"
- "Updated Vale linter rules and fixed errors across 60+ files"

**Avoid:**
- "Comprehensive new documentation for Slack with extensive examples"
- "Rosie did amazing work cleaning up 80+ files"
- "Game-changing incident response playbook"

**Per-item format:**
Each item should have:
- Title in bold
- PR number in parentheses
- Contributor name(s) after a dash
- 1-2 bullet points describing the change

Example:
```markdown
- **Slack Integration Guide** (#10146) - Henna
  - Setup instructions for CircleCI Slack integration
  - Includes org and project-level configuration
```

## Edge Cases

**Empty month**: If no substantive commits, say so clearly:
```markdown
# [Month YYYY] Documentation Updates

No significant documentation updates were made in [Month YYYY].
```

**Mixed types**: If a PR affects multiple categories, list it in the most relevant one, don't duplicate.

**Large cleanup campaigns**: Group related small changes (e.g., 50 Vale linting fixes) into one infrastructure item rather than listing each individually.

**Changes that don't fit the categories**: If you find commits that don't fit into any of the 5 categories, inform the user and ask if a new section is needed. List the commits that don't fit and suggest potential category names. For example:
```
I found [N] commits that don't fit the existing categories:
- [commit description] (#PR)
- [commit description] (#PR)

These seem to be related to [theme]. Should I add a new section called "[Suggested Name]"?
```

## Output

Save the report to a file named `[month]-[year]-newsletter.md` in the current working directory and inform the user where it was saved.
