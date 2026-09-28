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
| `page-plan` | Optional | Comma-separated, one to three of: `Free`, `Performance`, `Scale`. See [page-plan work](#page-plan-doc-276-plan-of-work) |

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
- **`page-plan` — done (DOC-276).** All 5 PRs merged: #10819, #10820, #10821, #10822, #10823 — plus a small metadata fix on #10822 after merge (see below). See [page-plan work](#page-plan-doc-276-plan-of-work) below.
- **No CI enforcement.** Nothing currently fails a build if new metadata drifts from the schema. "Some simple validation" was the stated direction — not yet scoped or built.
- **`page-description` length isn't in the JSON schema.** AGENTS.md documents 70–160 chars (Vale-enforced separately); the schema only checks `minLength: 1`. Worth reconciling once real validation exists, so the two rules aren't split across two systems.
- **`server-admin-4.7`–`4.10` are 4 separate near-duplicate Antora components** (directory-per-version). The new `page-server-min-version`/`page-server-deprecated-in` fields could eventually let these collapse into one component, but that's explicitly out of scope for DOC-269 — a separate, larger initiative.
- ~~**`vale/lint` fails on this PR with entirely pre-existing prose debt**~~ — resolved; see [Where we're at](#where-were-at) above.
- **Metadata isn't reaching the markdown mirror served to agents.** This schema's fields (`page-platform`, `page-audience`, `page-server-min-version`, etc.) live in the AsciiDoc source attributes, but nothing has confirmed that the externally-relevant subset of them actually surfaces in the plain-markdown content we generate for agents/crawlers. If an agent reading the markdown can't tell a page is Server-only, admin-only, or version-gated, it will give wrong answers. Needs a pass to check what the markdown-generation pipeline currently carries through from page attributes, and add whatever's missing.

## Next steps

1. **Merge PR #10788.** `vale/lint` is green post-rebase; no override needed.
2. **Scope and build "simple validation."** Needs a decision: a small script against `schemas/docs-metadata.schema.json` run in CI (closest to what manni did, without the dependency), a pre-commit hook, or something lighter. Should cover at minimum: required-field presence, the enum fields, and the quoting gotcha above.
3. **`page-vcs` backfill** — done for all 468 pages across every component, in 26 PRs (see above). Remaining: merge them.
4. **`page-plan` backfill (DOC-276)**: done, all 5 PRs merged (#10819, #10820, #10821, #10822, #10823). Remaining: the dedicated pricing cross-reference audit was never run as a separate pass (see below), and the two soft flags from classification are still open.
5. **`page-content-type` classification** — needs its own tooling decision before work starts.
6. **File a separate ticket** for the `server-admin-4.7`–`4.10` component consolidation, if that's still wanted — it's real technical debt the new schema exposes but doesn't fix.
7. **Reconcile `page-description` length** into the JSON schema once a validator exists to enforce it.
8. **Audit the markdown-mirror pipeline** for which page attributes it currently carries through, and add the externally-relevant ones from this schema (platform, audience, version-gating at minimum) so agents reading the markdown get the same constraints a human reading the rendered Antora page would.

## page-plan (DOC-276): plan of work

Status: **Done — all 5 PRs merged on 2026-09-28.** Decisions below were confirmed by the user on 2026-09-28.

- Chunk 0 (schema/AGENTS.md/templates): PR [#10819](https://github.com/circleci/circleci-docs/pull/10819), merged.
- Chunk 0b (content fixes): PR [#10820](https://github.com/circleci/circleci-docs/pull/10820), merged.
- Chunk 1 (about-circleci, config-policies, getting-started, insights, integration, migrate, optimize, permissions-authentication, plans-pricing, reference — 99 of 100 pages, 1 Server-only page excluded): PR [#10821](https://github.com/circleci/circleci-docs/pull/10821), merged. No pricing-vs-docs disagreements found during classification; every gated-feature claim matched the known-gated-features table. One soft flag (not a classification change, noted in the PR): `permissions-authentication:sso-group-mapping.adoc` doesn't state its own Scale restriction in the page body, unlike its sibling SSO pages — classified `Scale` by prerequisite inference, worth a follow-up content fix.
- Chunk 2 (security, test, toolkit, execution-managed — 87 of 87 pages): PR [#10822](https://github.com/circleci/circleci-docs/pull/10822), merged. `security:ip-ranges.adoc` → `Performance, Scale`; `security:site-to-site-connectivity.adoc`, `execution-managed:linux-cuda-images-support-policy.adoc`, `using-gpu.adoc` → `Scale`; `security:security.adoc` was originally classified as Server-only (no page-plan) based on its existing metadata, but that metadata was itself wrong — see the post-merge fix below, it's now `Free, Performance, Scale`. Everything else defaults to all three plans, including `security:audit-logs.adoc` (covers all-plan audit log requests alongside Scale-only streaming) and GPU-mentioning-but-not-GPU-focused pages (`executor-intro.adoc`, `resource-class-overview.adoc`). macOS-focused pages default to all three plans per the confirmed Free-plan macOS availability. No pricing-vs-docs disagreements found.
- Chunk 3 (execution-runner, deploy, orchestrate — 89 of 89 pages, no Server-only pages in this chunk): PR [#10823](https://github.com/circleci/circleci-docs/pull/10823), merged. Every page defaults to `Free, Performance, Scale` — no page's main subject is plan-gated. New finding for the pricing audit (not a classification change): `deploy:deployment-overview.adoc` has a data-retention table (90 days Free / 180 Performance / 2 years Scale) not in the known-gated-features list — same "available everywhere, different limit" pattern as flaky test detection, so no page-plan change, but worth a pricing cross-check.

**All 5 PRs merged on 2026-09-28.** Total: 276 pages across chunks 1-3 (100 + 87 + 89), plus the schema/docs update (chunk 0) and the content fixes (chunk 0b). 275 pages got a `page-plan` value; 1 Server-only page was excluded (see the post-merge fix below — this brought the count up from the original 274/2 split). Final summary across chunks 1-3:
- `Free, Performance, Scale` (default): 258 pages (86 + 83 + 89)
- `Scale`: 15 pages — config policies × 7 (6 guides pages + `reference:config-policy-reference.adoc`), SSO × 4, budget controls, site-to-site connectivity, GPU × 2
- `Performance, Scale`: 2 pages (unregistered user spend prevention, IP ranges)
- No `page-plan` (Server-only): 1 page (`plans-pricing:plan-server.adoc`)

**Post-merge fix on #10822:** during review, the user caught that `security:security.adoc` had a pre-existing `:page-platform: server` metadata error unrelated to this work — the page is actually about CircleCI's cloud-hosted security architecture (build fleet, S3, Pusher/Slanger, VCS integration), with no Server-specific content; Server has its own separate security pages. Fixed on the PR branch before merge: `page-platform` corrected to `cloud`, the now-moot `page-server-min-version` dropped, and `page-plan: Free, Performance, Scale` added. This moved the page from "Server-only, no page-plan" to the default bucket, which is reflected in the counts above.

No pricing-page-vs-docs disagreements surfaced during classification. Two soft flags still open, non-blocking:
- `permissions-authentication:sso-group-mapping.adoc` doesn't state its own Scale restriction in the page body (chunk 1).
- `deploy:deployment-overview.adoc`'s plan-tiered data retention table is a new pattern not yet in the known-features list (chunk 3).
- `security.adoc`'s `:page-audience: admin` also looks questionable (the page reads as general-audience, not admin-only) but wasn't part of what the user flagged, so it was left alone — worth a follow-up look.

**Remaining:** the one-off pricing cross-reference audit subagent mentioned in the "How each metadata chunk runs" section below was never run as a separate pass — the per-module classification subagents did this cross-checking as they went, and found no disagreements. If a dedicated audit is still wanted, it can be scoped as a small follow-up.

### What the attribute means

`:page-plan:` tells readers which CircleCI **cloud** plans include the functionality a page describes. It will eventually drive a reader-facing badge, the same way `page-platform` and `page-vcs` do.

* **Optional** in the schema.
* Values: one to three of `Free`, `Performance`, `Scale`, title case, comma-separated, in that order (for example `:page-plan: Performance, Scale`). Title case is deliberate: the lowercase `cloud`/`server` values in `page-platform` were a mistake and the user will move them to title case in a separate PR.
* **No `all` shorthand.** Pages available on every plan list all three: `:page-plan: Free, Performance, Scale`.
* Scope is cloud plans only. Server is also a plan, but `:page-platform: server` already covers it, so `Server` is not a `page-plan` value.
* A page gets a plan if the feature is **available** on that plan, even with a lower limit. For example, flaky test detection is capped at 5 tests on Free, and self-hosted runner concurrency is 5/20/unlimited, so both still get all three plans. Limits belong in the page body, not in this attribute.
* **Mixed pages get all three plans.** Only a page whose main subject is a gated feature gets fewer plans. If only a section is gated (for example, the IP ranges section of `configuration-reference.adoc`, or GPU sections of execution pages), the page gets `Free, Performance, Scale` and the section keeps its inline NOTE.
* Placement: directly after `:page-vcs:` in the page header.

### Scope

* In scope: `docs/guides` (264 pages, 16 modules) and `docs/reference` (12 pages). 276 pages total.
* Out of scope for now: `server-admin-4.x`, `orbs`, `contributors`, `services`, `root`.
* **Server-only pages get no `page-plan`.** 2 in scope: `plans-pricing:plan-server.adoc`, `security:security.adoc`. So 274 pages get the attribute.

### Sources of truth

**The docs are the source of truth**, cross-referenced against the [pricing page](https://circleci.com/pricing/).

1. Explicit plan statements on the page itself (for example `NOTE: ... available for Scale Plan customers`), and `plans-pricing:plan-overview.adoc` (updated in chunk 0b).
2. The pricing page comparison table, as a cross-check.

If a page contradicts the pricing page, use the docs value but don't resolve it silently. Add the page to the PR description's "needs confirmation" list so the user can decide whether the docs or the pricing page needs fixing.

Known gated features (starting list for classification, not exhaustive):

| Feature | Plans | Source | Pages |
|---|---|---|---|
| SSO (SAML) | Scale | Docs, matches pricing page | `permissions-authentication:sso-overview`, `set-up-sso`, `sign-in-to-an-sso-enabled-organization` |
| Config policies | Scale | Docs, matches pricing page | all 6 `config-policies` pages |
| IP ranges | Performance, Scale | Docs, matches pricing page | `security:ip-ranges` |
| GPU resource classes | Scale | User decision 2026-09-28 | Only pages whose main subject is GPU. Mixed pages get all three plans. |
| Audit log streaming | Scale | Docs (not on pricing page) | `security:audit-logs` covers audit log requests on all plans as well as streaming, so it gets all three plans |
| Budget controls | Scale | Docs (not on pricing page) | `plans-pricing:manage-budgets` |
| Site-to-site connectivity (preview) | Scale | Docs (not on pricing page) | `security:site-to-site-connectivity` |
| Unregistered user spend prevention | Performance, Scale | Docs (not on pricing page) | `plans-pricing:prevent-unregistered-users-from-spending-credits` |
| Custom storage retention | Performance, Scale | `plan-overview.adoc` | Check whether any page's main subject is this |
| macOS resource classes | Free, Performance, Scale | `plan-overview.adoc`, confirmed by the [November changelog entry on the Free plan default macOS resource class](https://circleci.com/changelog/free-plan-default-macos-resource-class-changes-to-m4pro-medium-on-november/) | `execution-managed` macOS pages |

### Chunks and PRs

Each chunk is its own branch off `main` and its own PR, 100 files or fewer. Chunks 0 and 0b should merge first; the others don't depend on each other.

| Chunk | Branch | Contents | Files |
|---|---|---|---|
| 0 | `DOC-276-page-plan-schema` | Add optional `page-plan` to `schemas/docs-metadata.schema.json` (pattern-matched string, same approach as `page-vcs`), the AGENTS.md attribute table and pre-commit checklist, and the 4 templates in `docs/contributors/modules/templates/pages/` | ~6 |
| 0b | `DOC-276-plan-content-fixes` | Prose fixes found during planning. See [Content fixes](#content-fixes-chunk-0b) | ~9 |
| 1 | `DOC-276-page-plan-1` | `guides`: about-circleci (5), config-policies (6), getting-started (13), insights (4), integration (19), migrate (9), optimize (10), permissions-authentication (14), plans-pricing (8); plus `reference` (12) | 100 |
| 2 | `DOC-276-page-plan-2` | `guides`: security (15), test (15), toolkit (26), execution-managed (31) | 87 |
| 3 | `DOC-276-page-plan-3` | `guides`: execution-runner (21), deploy (33), orchestrate (35) | 89 |

Chunk 0b touches some of the same files as chunks 1 and 3, but on different lines (body text vs header), so rebasing is simple. Keeping it separate means the metadata PRs stay mechanical and easy to review.

Recount before each chunk (`find docs/guides/modules/<module>/pages -name '*.adoc' | wc -l`) in case pages were added since planning. If a chunk passes 100, move the smallest module to the next chunk.

### Content fixes (chunk 0b)

1. **`plans-pricing:plan-overview.adoc`: add the missing plan-gated features.** In the plan sections:
   * Free: flaky test detection (up to 5 tests), and the network and storage allowances.
   * Performance: unregistered user spend prevention, unlimited flaky test detection, and the network and storage allowances.
   * Scale: SSO, config policies, audit log streaming, budget controls, site-to-site connectivity (preview), GPU resource classes (already there), and the network and storage allowances.
   * Link each to its feature page. Don't hard-code numbers that change often (credits, allowances) if the pricing page already carries them; link to the pricing page for those instead. Check with the user before hard-coding.
   * Keep the Free plan's macOS mention: macOS is confirmed available on Free.
2. **Remove the outdated "Custom plan" name.** 6 files:
   * `migrate:migrating-from-travis.adoc:23`: "or even more on a Custom Plan" becomes "Scale Plan".
   * `ROOT:partials/faq/billing-faq-snip.adoc:34`: "Scale/Custom Plan" becomes "Scale Plan".
   * `reference:configuration-reference.adoc:1214`: "Performance or Custom Plan" becomes "Performance or Scale Plan". Check the sense first: Scale has no concurrency limit except for macOS, so this may need rewording rather than a straight swap.
   * `about-circleci:concepts.adoc:17,19`, `reference:glossary.adoc:61`, `ROOT:partials/troubleshoot/pipelines-troubleshoot-snip.adoc:37,42`: these read "Free, Performance, and Custom plans each have a concurrency limit... Scale plan organizations have no concurrency limit". A straight swap to Scale would contradict the next sentence, so **drop "Custom"** instead ("Free and Performance plans each have...").
   * Don't touch "custom concurrency limit" (describes macOS limits on Scale, not a plan name).
3. **`orchestrate:pipeline-variables.adoc` `page-description`**: it currently reads "This document describes the Free Plan available to developers on CircleCI.", which is copied from another page. Rewrite it from the page's content (pipeline values and pipeline parameters), 70 to 160 characters.

### How each metadata chunk runs (subagent usage)

Per chunk, run by the main session:

1. **Branch** off an up-to-date `main`.
2. **Candidate scan (main session, scripted).** Grep the chunk's pages for plan signals: `Free Plan`, `Performance`, `Scale Plan`, `paid plan`, `pricing`, `SSO`, `config polic`, `IP ranges`, `GPU`, `macOS`, `budget`, `audit log`, `concurrency`, `site-to-site`, `retention`, `account team`. This produces a "flagged" list and a "clean" list.
3. **Classify (parallel subagents, one per module in the chunk, `general-purpose`, read-only instructions).** Each subagent gets: the rules above, the gated-features table, the pricing table snapshot, and its module's full page list with flagged pages marked. It reads **every** page in the module (grep misses things like "contact your account team"), and returns a table: `file | proposed page-plan | evidence (quoted line + line number) or "no gated feature"`. It also returns any page-vs-pricing disagreements it notices. Subagents do not edit files. At most 10 per chunk (chunk 1 has 10 modules, the others 3 or 4).
4. **Review (main session).** Check every non-default classification against its quoted evidence. Anything ambiguous goes to the user in chat before editing, not after.
5. **Apply (main session, scripted).** Insert `:page-plan:` after `:page-vcs:` in every page except server-only ones. Verify: every non-server-only page in the chunk has exactly one `:page-plan:` line, server-only pages have none, and every value matches `^(Free|Performance|Scale)(, (Free|Performance|Scale))*$` with no duplicates and in canonical order.
6. **Build and lint.** Run the repo's docs build, and let the `vale/lint` CI job run. These files were all touched by the DOC-273 PRs, so pre-existing prose debt should already be cleared, but Vale lints whole files on touch.
7. **PR.** Title `DOC-276: Add page-plan metadata to <modules>`. Description: counts per plan combination, the list of non-default pages with a one-line reason each, and a "needs confirmation" list. Then stop for user review.

A separate one-off subagent (can run alongside chunk 1) does a full **pricing cross-reference audit**: every plan claim in guides/reference vs the pricing page and `plan-overview.adoc`, beyond what was found during planning. It reports findings to the user in chat. Nothing is fixed without the user's go-ahead.

### Decisions (2026-09-28)

1. Title case values (`Free`, `Performance`, `Scale`). `page-platform` will be moved to title case separately.
2. Optional in the schema.
3. Server-only pages get no `page-plan`.
4. Pages with a gated section get all three plans. Only pages whose main subject is gated get fewer.
5. No `all` shorthand. List all three.
6. GPU is Scale only.
7. The docs are the source of truth, cross-referenced with the pricing page. Disagreements are flagged in the PR, not silently resolved.
8. Add the features missing from `plan-overview.adoc` to that page (chunk 0b).
9. "Custom plan" is outdated. Replace it with Scale, or drop it where Scale is already contrasted in the same passage (chunk 0b).
10. Rewrite the `pipeline-variables.adoc` page description (chunk 0b).
11. macOS is available on Free (confirmed by the changelog entry linked in the gated-features table).

### Still open

None. Ready to start with chunks 0 and 0b.

### Discrepancies found during planning

* `plan-overview.adoc` says Free includes macOS. The pricing page is ambiguous (Free shows 1 concurrent macOS job, but the macOS VM row shows no Free access). Resolved: macOS is on Free, per the changelog. The pricing page's macOS VM row may need a fix on the website side.
* GPU: pricing page reads were inconsistent. Resolved: Scale only.
* Audit log streaming, budget controls, site-to-site connectivity, custom storage retention and unregistered user spend prevention aren't on the pricing page. Resolved: docs are the source of truth.
* SSO, config policies, flaky test detection limits, and network/storage allowances aren't in `plan-overview.adoc`. Resolved: add them (chunk 0b).
* "Custom plan" appears in 6 files. Resolved: remove it (chunk 0b).
* `pipeline-variables.adoc` has a copied, wrong `page-description`. Resolved: rewrite (chunk 0b).

## Availability sidebar: plan of work

Status: **Steps 1-5 done, on 2026-09-28. Steps 6 (PRs) done; step 7 (remove duplicate plan NOTEs) still open.** Decisions below confirmed by the user on 2026-09-28. Ticket: TBD.

- Step 1 (fix pages that already start with a sidebar): PR [#10825](https://github.com/circleci/circleci-docs/pull/10825), open.
- Steps 2-4 (the extension itself, markdown-mirror/search-index updates, AGENTS.md note): PR [#10826](https://github.com/circleci/circleci-docs/pull/10826), open. Depends on #10825 merging first (see the PR description).
- Step 5 (build verification): done against both PRs' branches. Confirmed exactly 50 pages get a sidebar (17 plan-restricted, 33 VCS-restricted, 0 overlapping — matches the "Edge cases" expected count below), checked the Scale-only/Performance+Scale/default/Server-only/reference/step-1 pages and the `.md` output and search index for a restricted page. No attribute warnings during the build.

Goal: use the existing `page-plan` and `page-vcs` metadata to show a sidebar at the top of each page saying which cloud plans and version control providers the page applies to. This is a trial, so the wording lives in one place and is easy to change.

### Decisions (2026-09-28)

1. **Build-time Asciidoctor extension**, not hand-written `****` blocks in source and not a UI template. One source of truth, wording changes are a one-file edit.
2. **Scope:** `guides` and `reference` components only (check the `page-component-name` attribute).
3. **Wording:** `*Cloud plans:*` and `*Version control:*`. "Cloud plans" makes it clear the line doesn't apply to Server.
4. **HTML shows only restricted lines.** A plan line appears only when the page isn't on all three plans; a VCS line appears only when `page-vcs` isn't `all`. No restricted lines means no sidebar. This keeps the sidebar meaningful for human readers.
5. **The markdown mirror always gets both lines**, restricted or not, since agents don't suffer from banner blindness.
6. **Existing top-of-page sidebars are fixed first** (see below), so pages don't show two sidebars back to back.
7. **Duplicate plan NOTEs** (for example `NOTE: ...available on the Scale Plan`) stay for now and are removed in a follow-up pass.
8. **Search index excludes the sidebar**, so availability text doesn't pollute search results.

### Display names

| Value | Display |
|---|---|
| `github` | GitHub |
| `github-enterprise` | GitHub Enterprise Server |
| `gitlab` | GitLab |
| `gitlab-self-hosted` | GitLab self-managed |
| `bitbucket` | Bitbucket Cloud |
| `cursor-origin` | Cursor Origin |

These match how the docs already write each name. Plans display as-is (`Free`, `Performance`, `Scale`).

In the markdown mirror, `page-vcs: all` displays as "All supported providers", linked to the VCS integration overview page.

### How "HTML restricted only, markdown always" works

Both outputs are built from the same attributes, using a small shared helper so the wording and display names are defined once:

* `extensions/lib/page-availability.js` (new): parses `page-plan`/`page-vcs`, maps display names, and returns the lines plus a `restricted` flag for each.
* `extensions/page-availability-extension.js` (new, Asciidoctor tree processor, registered under `asciidoc.extensions` in `antora-playbook.yml`): inserts a sidebar block with role `page-availability` containing **restricted lines only**, as the first block of the body. If the page has a preamble, the block goes inside the preamble, not before it.
* `extensions/markdown-export-extension.js`: removes the `.page-availability` block from the HTML before conversion, then writes **both lines** from attributes: as a short block after the title, and as frontmatter fields (for example `cloud_plans`, `version_control`) next to the existing `description`/`doc_version`.
* `extensions/export-content-extension.js`: skips `.page-availability` when building the search index.

No hidden HTML (`display: none`) is involved: the HTML only contains what humans see.

### Edge cases

* Missing attribute: skip that line. Neither attribute present, or neither restricted: no sidebar.
* Unknown value: log a build warning instead of showing the raw value.
* Blank values are ignored.
* Expected result from current metadata: **50 pages** in guides/reference get a visible sidebar (17 plan-restricted, 33 VCS-restricted, no page is both).

### Step 1: fix pages that already start with a sidebar

Only pages whose **first body block** is a sidebar matter; sidebars further down don't stack with the generated one. There are three in scope, and all three will get a generated sidebar (their `page-vcs` is restricted):

| Page | Source of the sidebar | Fix |
|---|---|---|
| `integration:using-the-circleci-github-app-in-an-oauth-org.adoc` | Inline `****` at line 9 | Remove the `****` delimiters, so it becomes the opening paragraph |
| `insights:insights-tests.adoc` | `include::ROOT:partial$notes/standalone-unsupported.adoc[]` at line 9 | See the partial note below |
| `getting-started:config-editor.adoc` | Same partial, at line 10 | See the partial note below |

`ROOT:partials/notes/standalone-unsupported.adoc` is a sidebar and is also included mid-page in 5 other places (`test:test.adoc`, `test:collect-test-data.adoc`, `security:stop-building-a-project-on-circleci.adoc`, `integration:oss.adoc` twice). Just removing its `****` would turn it into loose body paragraphs in those 5 places. **Decision (2026-09-28): convert the partial to a delimited `NOTE` block** (`[NOTE]` + `====`), matching the other `notes/` partials. This fixes all 7 includes at once.

Checked and not affected: pages that open with a NOTE partial (`linux-cuda-deprecation-notice`, `server-api-examples`) and pages with a sidebar below the first paragraph or later.

### Remaining steps

2. Write `extensions/lib/page-availability.js` and `extensions/page-availability-extension.js`; register the extension in `antora-playbook.yml`.
3. Update `markdown-export-extension.js` (strip the block, write the full lines and the frontmatter fields) and `export-content-extension.js` (skip the block).
4. Add a note to `AGENTS.md` and the contributors docs saying the availability sidebar is generated from metadata, so nobody writes one by hand.
5. Build and check these pages: a Scale-only page (`config-policies:test-config-policies`), a Performance and Scale page (`security:ip-ranges`), a default page (no sidebar in HTML, both lines in `.md`), the Server-only page (`plans-pricing:plan-server`), the three pages from step 1, a `reference` page, and the `.md` output plus the search index for one restricted page. The user previews with `npm run start:dev` and shares screenshots.
6. PRs: step 1 as a small content PR; steps 2 to 4 as one tooling PR.
7. Follow-up: remove the duplicate plan NOTEs.
