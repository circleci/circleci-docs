# CircleCI Documentation Instructions for Claude Code

**IMPORTANT**: Read the complete style guide and documentation rules in `AGENTS.md`.

This file serves as a pointer to the main documentation style guide. All CircleCI documentation guidelines, AsciiDoc formatting rules, voice and style requirements, and best practices are documented in `AGENTS.md`.

When working on CircleCI documentation, follow all instructions in `AGENTS.md`.

## Git workflow

- Always create new branches from an up-to-date `main` (`git fetch origin && git switch -c <branch> origin/main`). Never branch from the current feature branch unless explicitly asked.
- Never force-push. The permission check blocks it. If history needs to change, ask first, or add a follow-up commit instead.
- After every push, run `git status` and `git log origin/<branch> -1 --stat` to confirm that all intended edits were included.

## Accuracy

- Before saying an endpoint, flag, or field is wrong or missing, check the API reference (or the CLI archive for v0 syntax) and cite it.
- Before saying something isn't in the repo, search the whole repo with `git grep` or `rg` across all directories, including `preview-src/` and CI config.
- When counting work for a reporting period, use the merge date to `main`, not the commit date.
- Before answering, show the exact API reference section or the repo search command (with full-repo scope) that supports your conclusion. If you can't verify it, say so explicitly instead of guessing.

## Docs conventions

- Run Vale on every changed `.adoc` file before committing (`vale <files>`). Link text and new terms must pass.
- Run a local Antora build before pushing doc changes, and confirm there are no new errors or unused-media warnings.
- Put screenshots in the module's `images/` directory, never in the `docs/` root. Screenshots show the full window with the sidebar, not cropped.
- Page descriptions must be 160 characters or fewer.
- When restructuring a page, only rearrange. Don't trim or reword details unless asked.
- Use the exact punctuation specified. A hyphen means a hyphen, not an em dash.
- Use `console` code blocks with `$`-prefixed commands for shell examples.

## Environment

- This is macOS. Use BSD sed syntax (`sed -i '' ...`) or prefer the Edit tool over sed.
- Use `pbcopy` for clipboard requests.
- Create scratch directories (`mkdir -p`) before writing to them.
