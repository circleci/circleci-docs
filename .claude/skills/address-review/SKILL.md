---
name: address-review
description: Address review feedback on a docs PR. Collects human and factory-bot comments, plans fixes, applies them, verifies with Vale and a build, pushes, and updates the PR description. Use when asked to address, fix, or work through review comments or bot feedback on a PR.
---

# Address review feedback

Work on the PR's own branch. Never branch from another feature branch.

## 1. Collect feedback

Get the PR number from the user or from `gh pr view --json number`. Then collect every comment:

- `gh pr view <n> --comments` for conversation comments and review summaries.
- `gh api repos/{owner}/{repo}/pulls/<n>/comments` for inline review comments.
- `gh pr checks <n>` for failing checks. For CI failures, start with `circleci run get --branch <branch> --no-interactive --failure-report`.

Include factory-bot and Vale findings. Skip threads that are already resolved or outdated.

## 2. Plan before editing

List each comment with a one-line planned fix. Flag any item that would remove or reword existing content, and any item you think is wrong.

Wait for approval before editing when an item is ambiguous, removes content, or disagrees with the docs. When a bot's finding conflicts with the docs, quote both sides and let the user decide. Never close it yourself.

Check claims against the source before accepting or rejecting them. Check API and CLI claims against the reference, and cite it.

## 3. Apply fixes

Make only the changes in the plan. Follow `CLAUDE.md` and `AGENTS.md`. Don't re-add content the user removed from the PR description by hand.

## 4. Verify

- Run `vale` on every changed `.adoc` file.
- Run a local Antora build (`npm run build:docs`) and confirm there are no new errors or unused-media warnings.
- Don't start a preview server. The user runs `npm run start:dev`.

## 5. Commit and push

Write a short commit message that says what the commit does. Push without `--force`. Then confirm the remote has every edit:

```console
$ git status
$ git log origin/<branch> -1 --stat
```

## 6. Update the PR description

Read the live body with `gh pr view <n> --json body`, patch it, and write it back with `gh pr edit <n> --body`. Keep the user's edits.

## 7. Report

Summarize what was fixed, what was deferred, and anything that needs the user's decision.
