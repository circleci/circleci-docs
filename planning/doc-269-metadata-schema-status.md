# DOC-269: Docs metadata schema — status and next steps

Ticket: [linear.app/circleci/issue/DOC-269](https://linear.app/circleci/issue/DOC-269/develop-docs-metadata-schema)
PR: [#10788](https://github.com/circleci/circleci-docs/pull/10788) (branch `DOC-269-metadata-schema`, open)

## Where we're at

The schema is written, all 468 real Antora pages are migrated to it, and the style guide/templates that generate new pages are updated to match. No CI tool currently enforces it — see [Tooling decision](#tooling-decision-no-third-party-validator-for-now) below.

The `vale/lint` blocker noted below is resolved: the pre-existing prose debt it surfaced was fixed separately in [#10789](https://github.com/circleci/circleci-docs/pull/10789) (merged into `main`), and `DOC-269-metadata-schema` has since been rebased onto `main` to pick that up. The rebase itself introduced a handful of new merge conflicts (the new schema's header fields colliding with #10789's prose fixes on the same lines) and surfaced 4 more pre-existing lint errors in files the schema migration touches for the first time — all fixed as part of the rebase. `vale/lint` is green on this branch as of the rebase.

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
- **`page-vcs` — done (DOC-273), pending merge.** All 468 pages across every component now carry `:page-vcs:`, in 26 PRs (#10792-#10816, plus this planning update as #10800). Note on granularity: "one PR per Antora module" ended up meaning one PR per Antora **component** for `root`/`reference`/`orbs`/`services`/`server-admin-4.x` (each of those bundles multiple real modules, e.g. `orbs` has `author`+`use`; each `server-admin-4.x` has 4 modules) — left as-is by decision, since the classification is correct and re-splitting already-open PRs wasn't worth the churn. For the `guides` component specifically, one PR was opened per actual module (`getting-started`, `orchestrate`, `deploy`, etc.), which is what "one PR per module" was meant to produce.
  - `root` (1 page, `all`) — PR #10792
  - `reference` (12 pages, all `all`) — PR #10793
  - `orbs` (12 pages, mostly `all`, 2 exceptions) — PR #10794
  - `services` (15 pages, all `all`) — PR #10795
  - `server-admin-4.7` / `4.8` / `4.9` / `4.10` (39/41/42/42 pages, **every page** `github, github-enterprise` — CircleCI Server only ever integrates with GitHub/GitHub Enterprise) — PRs #10796-#10799
  - `contributors` — no work needed; docs-about-docs style guide/templates, not real product content.
  - `guides` (264 pages across 16 real modules) — one PR per module: `about-circleci` #10801, `config-policies` #10802, `insights` #10803, `plans-pricing` #10804, `getting-started` #10805, `integration` #10806, `security` #10807, `migrate` #10808, `permissions-authentication` #10809, `optimize` #10810, `test` #10811, `execution-managed` #10812, `execution-runner` #10813, `deploy` #10814, `orchestrate` #10815, `toolkit` #10816.
  - Ground truth for `guides`: `integration:version-control-system-integration-overview.adoc` carries an explicit feature-support matrix (pipeline type × feature) and an org-type × VCS-provider matrix — used directly to classify pages that map to one of its rows (e.g. `set-up-deploys.adoc`/`set-up-rollbacks.adoc` → `github, github-enterprise`; `roles-and-permissions-overview.adoc` → every provider except Bitbucket, since Bitbucket has no `circleci`-type org).
  - Policy decisions made along the way: (1) when a page says "GitHub"/"GitLab" generically, include the Enterprise/self-hosted variant by default unless the page says otherwise; (2) `cursor-origin` counts as a real VCS provider and should be included wherever GitHub/GitLab/Bitbucket are listed as generic VCS options, unless a page enumerates an exhaustive, explicit list of supported providers/auth types that doesn't include it; (3) watch for "Cursor" meaning the Cursor AI code editor (an AI coding agent, unrelated to VCS) vs. "Cursor Origin" the VCS provider — `guides:toolkit` has several of the former.
  - Remaining: none for the backfill itself. Once these PRs merge, revisit whether `docs/guides/modules/deploy/pages/set-up-deploys.adoc`'s classification (`github, github-enterprise`) needs to broaden if the product adds GitLab/Bitbucket/Cursor Origin support for deploy pipelines later.
- **No CI enforcement.** Nothing currently fails a build if new metadata drifts from the schema. "Some simple validation" was the stated direction — not yet scoped or built.
- **`page-description` length isn't in the JSON schema.** AGENTS.md documents 70–160 chars (Vale-enforced separately); the schema only checks `minLength: 1`. Worth reconciling once real validation exists, so the two rules aren't split across two systems.
- **`server-admin-4.7`–`4.10` are 4 separate near-duplicate Antora components** (directory-per-version). The new `page-server-min-version`/`page-server-deprecated-in` fields could eventually let these collapse into one component, but that's explicitly out of scope for DOC-269 — a separate, larger initiative.
- ~~**`vale/lint` fails on this PR with entirely pre-existing prose debt**~~ — resolved; see [Where we're at](#where-were-at) above.
- **Metadata isn't reaching the markdown mirror served to agents.** This schema's fields (`page-platform`, `page-audience`, `page-server-min-version`, etc.) live in the AsciiDoc source attributes, but nothing has confirmed that the externally-relevant subset of them actually surfaces in the plain-markdown content we generate for agents/crawlers. If an agent reading the markdown can't tell a page is Server-only, admin-only, or version-gated, it will give wrong answers. Needs a pass to check what the markdown-generation pipeline currently carries through from page attributes, and add whatever's missing.

## Next steps

1. **Merge PR #10788.** `vale/lint` is green post-rebase; no override needed.
2. **Scope and build "simple validation."** Needs a decision: a small script against `schemas/docs-metadata.schema.json` run in CI (closest to what manni did, without the dependency), a pre-commit hook, or something lighter. Should cover at minimum: required-field presence, the enum fields, and the quoting gotcha above.
3. **`page-vcs` backfill** — done for all 468 pages across every component, in 26 PRs (see above). Remaining: merge them.
4. **`page-content-type` classification** — needs its own tooling decision before work starts.
5. **File a separate ticket** for the `server-admin-4.7`–`4.10` component consolidation, if that's still wanted — it's real technical debt the new schema exposes but doesn't fix.
6. **Reconcile `page-description` length** into the JSON schema once a validator exists to enforce it.
7. **Audit the markdown-mirror pipeline** for which page attributes it currently carries through, and add the externally-relevant ones from this schema (platform, audience, version-gating at minimum) so agents reading the markdown get the same constraints a human reading the rendered Antora page would.
