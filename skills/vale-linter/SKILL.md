---
name: vale-linter
description: Run the Vale prose linter on CircleCI documentation files to identify and fix style errors, then create pull requests for review. Use this skill when the user explicitly asks to "run vale", "fix vale errors", "lint docs with vale", or mentions vale linting. This skill processes documentation files, fixes error-level Vale issues, and creates individual PRs per file for easier review.
---

# Vale Linter Skill

This skill automates the process of running Vale prose linter on CircleCI documentation, fixing errors, and creating pull requests for review.

## When to Use This Skill

Use this skill when the user:
- Explicitly asks to "run vale" or "fix vale errors"
- Requests to "lint documentation" or "check docs with vale"
- Mentions vale linting in the context of documentation work

Do NOT trigger this skill automatically just because .adoc files are being edited.

## Prerequisites

Verify these requirements before proceeding:
1. Vale is installed (`vale --version`)
2. A `.vale.ini` configuration file exists in the repo root
3. The current branch is clean or user confirms it's okay to create new branches
4. User has specified which files to process

## Workflow

### Step 1: Identify Files to Process

Ask the user which files to check if not already specified:
- Specific files: `docs/guides/modules/toolkit/pages/install-cli.adoc`
- Directory: `docs/guides/modules/toolkit/pages/`
- Pattern: `docs/**/*.adoc`

### Step 2: Run Vale to Identify Errors

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

### Step 3: Process Each File (One PR Per File)

For each file with errors, process it independently:

1. **Create a new branch** using this naming convention:
   ```bash
   git checkout -b vale-fix-{filename-without-extension}-{short-hash}
   ```
   Example: `vale-fix-install-cli-a7f3b2`

2. **Read the file** and understand its structure

3. **Analyze each error** from Vale output:
   - Error location (line number)
   - Rule violated (e.g., `circleci-docs.OxfordComma`)
   - Error message explaining what's wrong
   - Suggested fix if available

4. **Apply fixes** to address each error:
   - Use the Edit tool to make precise changes
   - Preserve AsciiDoc formatting and structure
   - Maintain existing line breaks and whitespace where possible
   - Fix only the specific issues Vale reported

5. **Re-run Vale** on the fixed file to verify errors are resolved:
   ```bash
   vale --output=JSON fixed-file.adoc
   ```
   - If errors remain, attempt additional fixes
   - If errors cannot be fixed automatically, note them in the PR description

6. **Commit changes**:
   ```bash
   git add <file>
   git commit -m "Fix Vale errors in <filename>

   Resolved the following Vale errors:
   - [List specific errors fixed]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

7. **Create PR**:
   ```bash
   gh pr create --title "Fix Vale errors in <filename>" --body "$(cat <<'EOF'
   ## Summary
   This PR fixes Vale error-level issues in `<filename>`.

   ## Errors Fixed
   - **Line X**: [Rule name] - [Description]
   - **Line Y**: [Rule name] - [Description]

   ## Verification
   Ran Vale after fixes:
   ```
   vale <filename>
   ```

   [Result: No errors remaining / X errors could not be auto-fixed]

   ## Notes
   - Only error-level issues were addressed
   - Warnings and suggestions were left for human review
   - Changes preserve existing AsciiDoc structure

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

### Step 4: Summary Report

After processing all files, provide a summary:

```
Vale Error Fixing Summary
========================

Files processed: 3
PRs created: 2
Files with no errors: 1

Pull Requests:
1. PR #123: Fix Vale errors in install-cli.adoc
   - Branch: vale-fix-install-cli-a7f3b2
   - Errors fixed: 5
   - URL: https://github.com/org/repo/pull/123

2. PR #124: Fix Vale errors in config-reference.adoc
   - Branch: vale-fix-config-reference-d9e1f4
   - Errors fixed: 3
   - URL: https://github.com/org/repo/pull/124

Files with no errors:
- docs/guides/modules/toolkit/pages/troubleshooting.adoc
```

## Error Fixing Guidelines

When fixing Vale errors, follow these principles:

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

2. **Technical accuracy**: Never sacrifice technical accuracy for style. If a fix would make documentation incorrect, note it in the PR for human review

3. **Context-dependent fixes**: Some rules have exceptions. If you're unsure, include a note in the PR description explaining the decision

4. **Multiple fixes per line**: Apply all fixes in a single edit when multiple errors occur on the same line

## Edge Cases and Error Handling

**If Vale itself fails**:
- Check that Vale is installed and accessible
- Verify `.vale.ini` exists and is valid
- Report the error to the user

**If a file cannot be fixed**:
- Create PR anyway with available fixes
- Document unfixable errors in PR description
- Suggest human review

**If git operations fail**:
- Check that the working directory is clean
- Ensure user has write permissions
- Verify `gh` CLI is authenticated

**If multiple files have identical names** (in different directories):
- Use partial path in branch name: `vale-fix-toolkit-install-cli-a7f3b2`

## Best Practices

1. **Batch efficiently**: Process multiple files, but keep PRs separate for easier review

2. **Verify fixes**: Always re-run Vale after making changes

3. **Preserve formatting**: Maintain AsciiDoc structure, indentation, and line breaks

4. **Be specific**: List exact errors fixed in commit messages and PR descriptions

5. **Stay focused**: Only fix Vale errors; don't make unrelated improvements

6. **Handle errors gracefully**: If automatic fixing fails, document why and suggest manual review

## Notes

- This skill only fixes error-level issues. Warnings and suggestions are left for humans.
- Each file gets its own PR to make review easier and allow independent merging.
- Vale rules are defined in `styles/circleci-docs/` and configured in `.vale.ini`.
- All fixes should align with the CircleCI documentation style guide in `AGENTS.md`.
