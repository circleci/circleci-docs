# DOC-269: Docs metadata schema — status and next steps

Ticket: [linear.app/circleci/issue/DOC-269](https://linear.app/circleci/issue/DOC-269/develop-docs-metadata-schema)
PR: [#10788](https://github.com/circleci/circleci-docs/pull/10788) (branch `DOC-269-metadata-schema`, open)

## Where we're at

The schema is written, all 468 real Antora pages are migrated to it, and the style guide/templates that generate new pages are updated to match. No CI tool currently enforces it — see [Tooling decision](#tooling-decision-no-third-party-validator-for-now) below.

**Schema:** `schemas/docs-metadata.schema.json` — plain JSON Schema (draft 2020-12), no tool-specific extensions.

| Attribute | Status | Values |
|---|---|---|
| `page-description` | Required | Non-empty string (Vale also enforces 70–160 chars) |
| `page-platform` | Required | Comma-separated `cloud`, `server` (lowercase) |
| `page-audience` | Required | `admin` or `developer` |
| `page-server-min-version` | Optional | `"X.Y"` — **must be quoted** in source (see gotcha below) |
| `page-server-deprecated-in` | Optional | Same format as above |
| `page-badge` | Optional, enum-enforced | `Beta`, `Preview`, `Deprecated` (never `New`) |
| `page-content-type` | Optional | Comma-separated Diátaxis types: `tutorial`, `how-to`, `reference`, `explanation` |
| `page-vcs` | Optional | Comma-separated: `all`, `github`, `github-enterprise`, `gitlab`, `gitlab-self-hosted`, `bitbucket`, `cursor-origin` |

**Migration completed in the PR:**
- All 468 pages now carry clean `page-platform` (previously a mixed string like `"Server 4.9, Server Admin"` baking in version and audience together).
- `page-server-min-version` split out from the old version-in-platform string; ambiguous values (`v4+`, `4+`, bare `Server`) floored to `4.7`.
- `page-audience` introduced to replace the old "Server Admin" marker — `admin` where that marker was present, `developer` everywhere else (the default, including Cloud-only pages).
- 11 pre-existing `page-description` gaps fixed (7 missing, 4 present-but-empty — the empty ones are a distinct bug: an AsciiDoc attribute with no value parses as boolean `true`, not an empty string).
- 17 pages that had no `page-platform` at all were filled in by reading each page's content, not defaulted (e.g. the OpenTelemetry integration page is Cloud-only; 3 `docs/services` pages are Server-admin-only and got `page-audience: admin`).
- `AGENTS.md` and all 4 page templates in `docs/contributors/modules/templates/pages/` updated — they still had the old `page-platform` format and no `page-audience` at all, so new pages would have come out non-compliant even without a validator.

### Tooling decision: no third-party validator, for now

We evaluated and fully wired up [`manni`](https://github.com/hawkeyexl/manni) (`@hawkeyexl/manni`) — it validated all 468 pages correctly and caught a real bug (see gotcha below) during the migration. It was then deliberately removed from the repo: it's a low-star, early-maintenance-signal package, and we decided the dependency risk wasn't worth it just to keep a recurring schema check running. The schema and metadata don't depend on it — they're plain JSON Schema and plain AsciiDoc attributes, portable to whatever validates them next.

**Known data-integrity gotcha for whoever builds that validation:** any tool that parses AsciiDoc attribute values as YAML scalars (a common, easy approach) will read an unquoted numeric-looking value as a *number*, silently dropping trailing zeros — `:page-server-min-version: 4.10` becomes the number `4.1`. Fixed in source by quoting all current values (`:page-server-min-version: "4.10"`); any future parser needs to either preserve that quoting convention or use a non-YAML parsing approach for this field.

## Known gaps / outstanding work

- **`page-content-type` — 0% coverage.** Genuinely needs per-page judgment (Diátaxis classification isn't derivable from a pattern). No tooling decision made for this yet — an LLM-assisted pass is the obvious approach but we've just decided against adding a third-party tool, so this needs its own call: build a small one-off script, do it by hand in batches, or revisit tooling scoped narrowly to this one task.
- **`page-vcs` — 0% coverage.** Plan: bulk-default `all` (most pages are VCS-agnostic), then grep for VCS-specific keywords (GitHub Apps, GitLab triggers, Bitbucket, self-hosted, Cursor) and hand-correct the exceptions. `docs/guides/modules/deploy/pages/set-up-deploys.adoc` is a known real exception — it explicitly requires a GitHub repo.
- **No CI enforcement.** Nothing currently fails a build if new metadata drifts from the schema. "Some simple validation" was the stated direction — not yet scoped or built.
- **`page-description` length isn't in the JSON schema.** AGENTS.md documents 70–160 chars (Vale-enforced separately); the schema only checks `minLength: 1`. Worth reconciling once real validation exists, so the two rules aren't split across two systems.
- **`server-admin-4.7`–`4.10` are 4 separate near-duplicate Antora components** (directory-per-version). The new `page-server-min-version`/`page-server-deprecated-in` fields could eventually let these collapse into one component, but that's explicitly out of scope for DOC-269 — a separate, larger initiative.
- **`vale/lint` fails on this PR with entirely pre-existing prose debt** (documented in a PR comment with full evidence) — the orb lints whole files on any touch, and this PR touches nearly every page's header. Not something to fix here; will get caught incrementally as pages are edited going forward. The PR is mergeable with that check red.

## Next steps

1. **Merge PR #10788.** Requires a manual override of the failing `vale/lint` check (evidence it's 100% pre-existing is in the PR comment).
2. **Scope and build "simple validation."** Needs a decision: a small script against `schemas/docs-metadata.schema.json` run in CI (closest to what manni did, without the dependency), a pre-commit hook, or something lighter. Should cover at minimum: required-field presence, the enum fields, and the quoting gotcha above.
3. **`page-vcs` backfill** — bulk-default pass + exception handling, as scoped above.
4. **`page-content-type` classification** — needs its own tooling decision before work starts.
5. **File a separate ticket** for the `server-admin-4.7`–`4.10` component consolidation, if that's still wanted — it's real technical debt the new schema exposes but doesn't fix.
6. **Reconcile `page-description` length** into the JSON schema once a validator exists to enforce it.
