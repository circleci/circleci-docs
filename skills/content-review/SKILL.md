---
name: content-review
description: >
  Review CircleCI documentation pages for quality, clarity, and adherence to style guidelines.
  Use this skill whenever the user asks to review, audit, or assess documentation content, check
  for style compliance, evaluate page quality, or wants feedback on docs pages. Also trigger when
  the user mentions content quality, readability issues, or asks "how does this page look" or
  "is this page good." Even if they just reference a docs file path and ask for a review or
  feedback, use this skill. For a contributor's pull request, use contributor-pr-review instead.
---

# CircleCI Documentation Content Review

You review CircleCI documentation pages and write a narrative report with prioritized, actionable recommendations. `AGENTS.md` is the source of truth for style rules. This skill says what to check and how to report it. It does not restate the rules.

## Input

A path to an `.adoc` file under `docs/`.

## Process

### 1. Read context

1. Read the target page.
2. Read `AGENTS.md` in the repository root.
3. Set the audience from `:page-audience:`. `admin` means system administrators (professional, technical tone). Anything else means a junior engineer (friendly, authoritative tone).

### 2. Find related pages

Find 3-5 related pages: grep for key terms, follow the page's xrefs, and prefer the same module. Read them. Note how they name the same concepts, whether explanations conflict, and which example patterns they use.

### 3. Review across 10 dimensions

1. **Tone and audience**: Tone and technical depth match the audience.
2. **Purpose**: The first paragraph says why to read the page and what problem it solves. The page covers both why (value, when to use) and how (steps).
3. **Headings**: Headings describe their section, run in a logical sequence, and skip no levels. Flag vague ones such as "Overview" or "Details".
4. **Code examples**:
   - Each block is self-contained and working. Key explanation is in comments inside the block, because an agent may retrieve only the block.
   - Pinned versions are current. Run `node scripts/check-code-versions.js <file>` and report what it finds. It is advisory: an example may pin an older version on purpose, and a lookup it cannot complete is unverified, not current.
5. **Information architecture and admonitions**:
   - Essential information is in the main text, not in an admonition or a tab. Agents often miss both.
   - Check every admonition against the Admonitions section of `AGENTS.md`. Flag the wrong type, long ones that should be a section, best practices or limitations that should not be an admonition, and overuse.
6. **Section introductions**: Each major section opens with context that stands alone.
7. **Consistency**:
   - Internal terminology and patterns are consistent, and they match the related pages.
8. **Repetition**: Flag repeated explanations that serve no purpose.
9. **Flow and structure**: The order makes sense and transitions are clear. A how-to page has a Prerequisites section before the first step.
10. **Partial and example reuse**:
    - Search `docs/guides/modules/ROOT/partials/` and `docs/guides/modules/ROOT/examples/` (Grep or Glob) rather than guessing.
    - Flag hand-written prose or config that an existing partial or example already covers, and say which one should replace it.
    - Flag generic, reusable content as a candidate for a new partial or example, especially if it appears on another page.
    - Only surface the opportunity. Hand extraction and replacement to `skills/partials/SKILL.md`.

Do not flag these, because they are correct:

- Title case in xref link text pointing at a sentence-case heading. Vale requires it.
- Anything Vale or `check-metadata` already enforces, such as xref case, the configuration file name, Cloud and Server directive mistakes, and page attributes. Read their output instead. Focus on content quality.

### 4. Write and save the report

Use this structure:

```markdown
# Content Review: [Page Title]

**Page:** `[file path]`
**Audience:** [Junior Engineer / System Administrator]
**Review Date:** [today's date]

## Executive Summary
[2-3 sentences: overall quality and the most important findings]

## Priority Recommendations
### [Priority]: [Issue title]
**Category:** [dimension]
**Issue:** [what is wrong, quoting text or line numbers]
**Impact:** [effect on readers or agents]
**Recommendation:** [specific fix]

## Detailed Findings
[One line per dimension: ✅ passes, or ⚠️ findings not already covered above]

## Consistency Check
**Related pages reviewed:** [3-5 pages]
**Findings:** [issues, or note that they align]

## Positive Highlights
[2-3 things to preserve]

## Overall Assessment
[Final paragraph and next steps]
```

**Priorities:**

- **Critical**: Breaks comprehension or accessibility (missing "why", code without context, essential information buried).
- **High**: Significant usability problems (poor headings, confusing flow, major inconsistencies, a how-to with no Prerequisites, outdated image or orb versions that break the example).
- **Medium**: Reduces quality (minor inconsistencies, repetition, wrong admonition type, an existing partial or example that should replace hand-written content).
- **Low**: Nice to have (content that could become a new partial or example).

Be constructive and specific. Recommend, do not rewrite. If there are no related pages, say so and still complete the other dimensions.

Save the report to the repository root as `content-review-<page-filename-without-extension>.md`, then tell the user the full path.
