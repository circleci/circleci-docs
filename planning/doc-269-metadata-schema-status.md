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
- **`page-vcs` — in progress (DOC-273).** One PR per Antora module. Done so far, all merged or open:
  - `root` (1 page, all `all`) — PR #10792
  - `reference` (12 pages, all `all` — the page-level union of provider mentions already covers everything, e.g. `variables.adoc`'s per-variable tables) — PR #10793
  - `orbs` (12 pages, mostly `all`; `create-test-and-use-url-orbs.adoc` excludes GitLab per an explicit in-page NOTE; `managing-url-orbs-allow-lists.adoc` is scoped to its enumerated auth types) — PR #10794
  - `services` (15 pages, all `all`) — PR #10795
  - `server-admin-4.7` / `4.8` / `4.9` / `4.10` (39/41/42/42 pages, **every page** `github, github-enterprise` — CircleCI Server only ever integrates with GitHub/GitHub Enterprise; confirmed via each version's own `installation-reference.adoc`, no GitLab/Bitbucket/Cursor Origin anywhere in these modules) — PRs #10796, #10797, #10798, #10799
  - `contributors` — no work needed; it's the docs-about-docs style guide/templates module, not real product content, and doesn't carry `page-platform` outside its templates.
  - **Still outstanding: `guides` (264 pages, the largest and most VCS-heterogeneous module)** — not started. Needs its own pass; unlike the other modules, `guides` has real per-feature VCS exceptions across many submodules (deploy, orchestrate/triggers, integration/VCS setup, migrate) and is where `cursor-origin` (a new, beta-stage VCS type) actually shows up as a first-class concept (e.g. `orchestrate/pages/cursor-origin-trigger-event-options.adoc`, `integration/pages/set-up-vcs-connections.adoc`). `docs/guides/modules/deploy/pages/set-up-deploys.adoc` is a known real exception — it explicitly requires a GitHub repo.
  - Policy decisions made along the way (apply consistently to the `guides` pass too): (1) when a page says "GitHub"/"GitLab" generically, include the Enterprise/self-hosted variant by default unless the page says otherwise; (2) `cursor-origin` counts as a real VCS provider and should be included wherever GitHub/GitLab/Bitbucket are listed as generic VCS options — but leave it off pages that enumerate an exhaustive, explicit list of supported providers/auth types that doesn't include it.
- **No CI enforcement.** Nothing currently fails a build if new metadata drifts from the schema. "Some simple validation" was the stated direction — not yet scoped or built.
- **`page-description` length isn't in the JSON schema.** AGENTS.md documents 70–160 chars (Vale-enforced separately); the schema only checks `minLength: 1`. Worth reconciling once real validation exists, so the two rules aren't split across two systems.
- **`server-admin-4.7`–`4.10` are 4 separate near-duplicate Antora components** (directory-per-version). The new `page-server-min-version`/`page-server-deprecated-in` fields could eventually let these collapse into one component, but that's explicitly out of scope for DOC-269 — a separate, larger initiative.
- ~~**`vale/lint` fails on this PR with entirely pre-existing prose debt**~~ — resolved; see [Where we're at](#where-were-at) above.
- **Metadata isn't reaching the markdown mirror served to agents.** This schema's fields (`page-platform`, `page-audience`, `page-server-min-version`, etc.) live in the AsciiDoc source attributes, but nothing has confirmed that the externally-relevant subset of them actually surfaces in the plain-markdown content we generate for agents/crawlers. If an agent reading the markdown can't tell a page is Server-only, admin-only, or version-gated, it will give wrong answers. Needs a pass to check what the markdown-generation pipeline currently carries through from page attributes, and add whatever's missing.

## Next steps

1. **Merge PR #10788.** `vale/lint` is green post-rebase; no override needed.
2. **Scope and build "simple validation."** Needs a decision: a small script against `schemas/docs-metadata.schema.json` run in CI (closest to what manni did, without the dependency), a pre-commit hook, or something lighter. Should cover at minimum: required-field presence, the enum fields, and the quoting gotcha above.
3. **`page-vcs` backfill** — done for `root`, `reference`, `orbs`, `services`, and all four `server-admin-4.x` modules (see above). Remaining: the `guides` module (264 pages).
4. **`page-content-type` classification** — needs its own tooling decision before work starts.
5. **File a separate ticket** for the `server-admin-4.7`–`4.10` component consolidation, if that's still wanted — it's real technical debt the new schema exposes but doesn't fix.
6. **Reconcile `page-description` length** into the JSON schema once a validator exists to enforce it.
7. **Audit the markdown-mirror pipeline** for which page attributes it currently carries through, and add the externally-relevant ones from this schema (platform, audience, version-gating at minimum) so agents reading the markdown get the same constraints a human reading the rendered Antora page would.
