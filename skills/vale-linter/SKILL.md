---
name: vale-linter
description: Run the Vale prose linter on CircleCI documentation files to identify and fix style errors. Use this skill when the user explicitly asks to "run vale", "fix vale errors", "lint docs with vale", or mentions vale linting. Always clarifies scope and delivery method with the user before making changes — it does not assume per-file PRs.
---

# Vale Linter Skill

This skill runs Vale prose linter on CircleCI documentation, fixes error-level issues, and delivers the fixes the way the user actually wants.

## When to Use This Skill

Use this skill when the user:
- Explicitly asks to "run vale" or "fix vale errors"
- Requests to "lint documentation" or "check docs with vale"
- Mentions vale linting in the context of documentation work
- Says "fix the linter" or "make the linter happy"
- Asks to "fix the lint job" or "fix vale"

Do NOT trigger this skill automatically just because .adoc files are being edited.

## Step 1: Clarify the Task First

Never assume scope or delivery method. Before running Vale, ask the user (a single combined question is fine if the intent is already partly clear from their request):

1. **Which files?**
   - Files changed on the current branch (`git diff --name-only main...HEAD` or against whatever the base branch is) — this is the common case when clearing a CI lint check before merge
   - A specific file or list of files
   - A directory or glob pattern
   - The whole docs tree

2. **What should happen with the fixes?**
   - **Push straight to the current branch** — fix in place, commit, and push to the branch that's already open (e.g., to clear a failing CI/lint job on an existing PR). No new branch.
   - **Create a new branch + PR** — for one file, for all files together, or one PR per file (ask which grouping if this option is picked)
   - **Just show me the fixes / don't commit anything** — dry run, edits left in the working tree uncommitted

Do not default to "one PR per file" — that's only one of several valid outcomes. If the user's request already answers both questions (e.g., "fix vale errors on my current branch and push"), skip the question and confirm briefly instead of re-asking.

## Prerequisites

Verify these requirements before proceeding:
1. Vale is installed (`vale --version`)
2. A `.vale.ini` configuration file exists in the repo root
3. For the "push to current branch" path: the branch is a real feature branch (not `main`), and any pre-existing local changes are the user's own in-progress work — check `git status` and don't clobber it
4. For any path that creates branches/PRs: confirm with the user before creating new branches, per the git safety rules — don't create branches or push without saying so first

## Step 2: Run Vale to Identify Errors

Run Vale with JSON output to get structured error information:

```bash
vale --output=JSON <file-or-directory>
```

**Important**: Only process **error-level** issues. Vale reports three severity levels:
- `error` - Fix these automatically
- `warning` - Skip (leave for human review)
- `suggestion` - Skip (leave for human review)

Filter the JSON output to extract only errors:
```bash
vale --output=JSON file.adoc | jq 'to_entries | map(select(.value[] | .Severity == "error"))'
```

If no errors are found, inform the user and exit.

## Step 3: Fix Errors

For each file with errors:

1. **Read the file** and understand its structure
2. **Analyze each error** from Vale output:
   - Error location (line number)
   - Rule violated (e.g., `circleci-docs.OxfordComma`)
   - Error message explaining what's wrong
   - Suggested fix if available
3. **Apply fixes** using the Edit tool:
   - Preserve AsciiDoc formatting and structure
   - Maintain existing line breaks and whitespace where possible
   - Fix only the specific issues Vale reported
   - Apply all fixes on a line in a single edit when multiple errors occur on the same line
4. **Re-run Vale** on the fixed file to verify errors are resolved:
   ```bash
   vale --output=JSON fixed-file.adoc
   ```
   - If errors remain, attempt additional fixes
   - If errors cannot be fixed automatically, note them clearly in the summary — do not force a fix that would harm accuracy or meaning

## Step 4: Deliver the Fixes

Follow whichever path the user chose in Step 1.

### Path A: Push to the current branch

Use this for the "clear the pipeline for merge" case — fixing lint errors on a branch that already has an open PR.

1. Confirm the current branch isn't `main`/the default branch.
2. Stage only the files that were fixed:
   ```bash
   git add <file1> <file2> ...
   ```
3. Commit with a plain, factual message (say what the commit does, not the diagnosis that led to it):
   ```bash
   git commit -m "$(cat <<'EOF'
   Fix Vale errors in <file1>, <file2>, ...

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   EOF
   )"
   ```
4. Confirm with the user before pushing, then:
   ```bash
   git push
   ```

### Path B: New branch + PR

Only take this path if the user asked for it.

1. Create a branch:
   ```bash
   git checkout -b vale-fix-{scope}-{short-hash}
   ```
2. Commit and push as above.
3. Create the PR:
   ```bash
   gh pr create --title "Fix Vale errors in <scope>" --body "$(cat <<'EOF'
   ## Summary
   Fixes Vale error-level issues in <scope>.

   ## Errors fixed
   - **Line X**: [Rule name] - [Description]

   ## Notes
   - Only error-level issues were addressed; warnings and suggestions were left for human review

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
4. If the user asked for one PR per file, repeat per file with its own branch. If they asked for a single PR covering all files, use one branch/commit/PR for the whole batch.

### Path C: Dry run

Apply the edits to the working tree and stop. Do not stage, commit, or push. Tell the user what changed and let them review with `git diff`.

## Step 5: Summary Report

Regardless of path, report clearly:

```
Vale Error Fixing Summary
========================

Files processed: 3
Files with errors fixed: 2
Files with no errors: 1

Fixed:
- docs/guides/modules/toolkit/pages/install-cli.adoc (5 errors fixed)
- docs/guides/modules/toolkit/pages/config-reference.adoc (3 errors fixed)

No errors found:
- docs/guides/modules/toolkit/pages/troubleshooting.adoc

Delivery: <pushed to branch X / PR #123 created / left uncommitted for review>

Unresolved (needs human review):
- <file>:<line> — <rule> — <why it wasn't auto-fixed>
```

## Error Fixing Guidelines

### Common Vale Errors and How to Fix Them

**Passive voice** (`Vale.Terms`):
- Bad: "The project is created by clicking the button"
- Good: "Click the button to create the project"

**Oxford comma** (`circleci-docs.OxfordComma`):
- Bad: "red, white and blue"
- Good: "red, white, and blue"

**Heading punctuation** (`circleci-docs.HeadingsPunctuation`):
- Bad: "Install the CLI."
- Good: "Install the CLI"

**Link text** (`circleci-docs.Link`):
- Bad: `xref:guide.adoc[click here]`
- Good: `xref:guide.adoc[Installation Guide]`

**Gender bias** (`circleci-docs.GenderBias`):
- Bad: "he/she", "his/her"
- Good: "they/them", "their"

**Hedging** (`circleci-docs.Hedging`):
- Bad: "This should work"
- Good: "This works"

**Contractions**:
- Bad: "don't", "can't", "we're"
- Good: "do not", "cannot", "we are"

**Spelling and capitalization**:
- Follow CircleCI conventions (e.g., "web app" not "Web App")
- Respect proper nouns and product names

### Handling Complex Errors

Some errors require judgment:

1. **Sentence restructuring**: If fixing an error requires rewriting the sentence, preserve the original meaning while improving clarity
2. **Technical accuracy**: Never sacrifice technical accuracy for style. If a fix would make documentation incorrect, note it for human review instead of forcing it
3. **Context-dependent fixes**: Some rules have exceptions. If unsure, flag it in the summary rather than guessing
4. **Multiple fixes per line**: Apply all fixes in a single edit when multiple errors occur on the same line

## Edge Cases and Error Handling

**If Vale itself fails**:
- Check that Vale is installed and accessible
- Verify `.vale.ini` exists and is valid
- Report the error to the user

**If a file cannot be fully fixed**:
- Apply the fixes that are safe to make
- Document unfixable errors in the summary
- Suggest human review

**If git operations fail**:
- Check that the working directory is clean
- Ensure user has write permissions
- Verify `gh` CLI is authenticated (only needed for Path B)

## Notes

- This skill only fixes error-level issues. Warnings and suggestions are left for humans.
- Vale rules are defined in `styles/circleci-docs/` and configured in `.vale.ini`.
- All fixes should align with the CircleCI documentation style guide in `AGENTS.md`.
- Stay focused: only fix Vale errors reported by the tool; don't make unrelated improvements.
