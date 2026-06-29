---
name: vale-linter
description: "Run the Vale prose linter on CircleCI documentation files to identify and fix style errors, then create pull requests for review. Use this skill when the user explicitly asks to 'run vale', 'fix vale errors', 'lint docs with vale', or mentions vale linting. This skill processes documentation files, fixes error-level Vale issues, and creates individual PRs per file for easier review."
---

# Vale Linter Skill

Automates running Vale on CircleCI AsciiDoc documentation, fixing error-level issues, and creating one PR per file for review.

Do NOT trigger this skill automatically just because `.adoc` files are being edited.

## Prerequisites

1. Vale is installed (`vale --version`)
2. `.vale.ini` exists in the repo root
3. Current branch is clean or user confirms branching is okay
4. User has specified which files to process

## Workflow

### Step 1: Identify Files

Ask the user which files to check if not specified. Accepts specific files, directories, or glob patterns (e.g. `docs/**/*.adoc`).

### Step 2: Run Vale

```bash
vale --output=JSON <file-or-directory> | jq 'to_entries | map(select(.value[] | .Severity == "error"))'
```

Fix only error-level issues; skip warnings and suggestions. If no errors found, inform the user and exit.

### Step 3: Process Each File

For each file with errors:

1. **Branch**: `git checkout -b vale-fix-{filename-without-extension}-{short-hash}`
2. **Analyze** each error: line number, rule violated (e.g. `circleci-docs.OxfordComma`), message, suggested fix
3. **Apply fixes** using the Edit tool. Preserve AsciiDoc formatting and structure. Fix only what Vale reported.
4. **Verify**: re-run `vale --output=JSON` on the fixed file. If errors remain, attempt additional fixes. Document any unfixable errors.
5. **Commit and create PR** using templates from [TEMPLATES.md](TEMPLATES.md)

### Step 4: Summary Report

After all files are processed, output a summary using the template in [TEMPLATES.md](TEMPLATES.md).

## Fix Guidelines

- Never sacrifice technical accuracy for style — flag conflicts in the PR for human review
- When restructuring sentences, preserve original meaning
- Apply all fixes on the same line in a single edit
- Note context-dependent exceptions in the PR description

## Edge Cases

- **Vale fails**: verify installation and `.vale.ini` validity, report to user
- **Unfixable errors**: create PR with available fixes, document remaining items
- **Git failures**: check working directory state and `gh` CLI authentication
- **Duplicate filenames across directories**: use partial path in branch name (e.g. `vale-fix-toolkit-install-cli-a7f3b2`)

## References

- Vale rules: `styles/circleci-docs/`
- Vale config: `.vale.ini`
- Style guide: `AGENTS.md`
