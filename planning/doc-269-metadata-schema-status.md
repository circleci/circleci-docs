# DOC-269: Docs metadata schema

Ticket: [DOC-269](https://linear.app/circleci/issue/DOC-269/develop-docs-metadata-schema). Current work: DOC-279 (enforce the schema).

## Current state

All schema, backfill and sidebar PRs are merged. Every real Antora page (468) passes the schema. Nothing enforces it yet.

**Schema:** `schemas/docs-metadata.schema.json`. Plain JSON Schema (draft 2020-12). It uses only `required`, `type: string`, `pattern`, `enum` and `minLength`.

| Attribute | Status | Values |
|---|---|---|
| `page-description` | Required | 70 to 160 characters |
| `page-platform` | Required | `Cloud`, `Server`, comma-separated |
| `page-audience` | Required | `admin` or `developer` |
| `page-server-min-version` | Optional | `X.Y`, quoted in source (`"4.10"`) |
| `page-server-deprecated-in` | Optional | Same as above |
| `page-badge` | Optional | `Beta`, `Preview`, `Deprecated` (never `New`) |
| `page-content-type` | Optional | `tutorial`, `how-to`, `reference`, `explanation`, comma-separated. 0% coverage |
| `page-vcs` | Optional, 100% coverage | `all`, `github`, `github-enterprise`, `gitlab`, `gitlab-self-hosted`, `bitbucket`, `cursor-origin`, comma-separated. `all` must not be combined with others |
| `page-plan` | Optional, all guides/reference pages except Server-only | One to three of `Free`, `Performance`, `Scale`, in that order. No `all` shorthand |

**Scope for validation:** `docs/*/modules/*/pages/**/*.adoc`, excluding `docs/contributors` (its templates carry deliberately fake values).

**Parsing gotchas:**
* An attribute with no value (`:page-description:`) is empty, not missing. A YAML-style parser reads it as boolean `true`, so a truthy check misses it.
* A YAML-style parser reads `4.10` as the number `4.1`. That's why version values are quoted. A plain-text parser avoids this entirely.
* Comma-separated fields are strings with a pattern, not arrays.

## Rules for authors and classifiers

These decisions still apply to new pages.

**page-vcs**
* "GitHub" or "GitLab" in general includes the Enterprise or self-hosted variant unless the page says otherwise.
* `cursor-origin` is included wherever VCS providers are listed generically, unless the page gives an exhaustive list without it.
* "Cursor" the AI editor is not "Cursor Origin" the VCS provider.
* Ground truth: the feature matrices in `integration:version-control-system-integration-overview.adoc`.
* Server pages are always `github, github-enterprise`.

**page-plan**
* Cloud plans only. Server-only pages get no `page-plan`.
* A plan is included if the feature is available on it, even with a lower limit. Limits go in the page body.
* Only pages whose main subject is gated get fewer than three plans. A gated section keeps its inline NOTE, and the page gets all three.
* The docs are the source of truth, cross-checked against the [pricing page](https://circleci.com/pricing/). Flag disagreements in the PR rather than resolving them silently.
* Gated features: SSO, config policies, GPU, budget controls, site-to-site connectivity and audit log streaming are Scale. IP ranges and unregistered user spend prevention are Performance and Scale. macOS is on all plans.

**Availability sidebar** (`extensions/page-availability-extension.js`, shared logic in `extensions/lib/page-availability.js`)
* Generated from `page-plan` and `page-vcs` on `guides` and `reference` pages. Never write one by hand.
* HTML shows only restricted lines (plan not all three, VCS not `all`). No restricted lines means no sidebar.
* The markdown mirror always gets both lines and `cloud_plans`/`version_control`/`platform` frontmatter. The search index skips the sidebar.
* Unknown values log a build warning.

## Enforcement (DOC-279)

Options considered:

| Option | Pros | Cons |
|---|---|---|
| **Small Node script reading the schema** (recommended) | No new dependency. The schema stays the single source of truth. Runs in about a second over all pages. Easy to run locally | Hand-rolled header parsing. Supports only the JSON Schema keywords we use |
| Vale rules (`scope: raw` Tengo scripts, like `PageDescriptionLength.yml`) | Existing tool, editor integration | Duplicates the schema in Tengo. Only lints changed files. Touching a file surfaces all its prose debt. `docs/contributors` needs excluding |
| Validate in an Antora extension at build time | Real Asciidoctor parsing | Slow feedback (full build). Couples checks to the build |
| Third-party validator (manni, ajv) | Full JSON Schema support | Rejected: dependency risk isn't worth it for this check |

Built on `DOC-279-enforce-metadata`:

* `scripts/check-metadata.js`: reads the page header (title line to first blank line) as plain text. It checks `required`, `enum`, `pattern`, `minLength` and `maxLength` from the schema, and exits with code 2 if the schema uses any other keyword. Extra rules the schema can't express: unique `page-description` across all pages (Server pages include the version), no `page-*` attributes outside the header, no duplicate list values, `all` alone in `page-vcs`, `page-plan` in canonical order, `page-server-*` only with `Server`, and no `page-plan` on Server-only pages. With file arguments it checks only those files and skips anything out of scope.
* CI: a separate `check-metadata` job (small Node image, no `npm ci`) on every branch.
* Local: `npm run check:metadata`. Opt-in pre-commit hook in `.githooks/pre-commit`, enabled with `npm run hooks:install`. It checks staged `.adoc` files only.
* Schema: `page-description` is now 70 to 160 characters (`minLength`/`maxLength`). The 201 pages under 70 were rewritten in the same change.
* Vale's `PageDescriptionLength` rule was removed, so the length rule lives only in the schema.

## Outstanding work

* **`page-content-type`:** 0% coverage. Needs per-page Diátaxis judgment and its own tooling decision.
* **Markdown mirror:** `page-audience`, `page-server-min-version` and `page-server-deprecated-in` still don't reach the `.md` frontmatter.
* **Duplicate plan NOTEs:** remove inline "available on the Scale Plan" NOTEs that now repeat the generated sidebar.
* **Server admin components:** `server-admin-4.7` to `4.10` are 4 near-duplicate components. The version attributes could let them merge into one. Needs its own ticket.
* **Soft flags from the backfill:**
  * `permissions-authentication:sso-group-mapping.adoc` doesn't state its Scale restriction in the body.
  * `deploy:deployment-overview.adoc` has a plan-tiered data retention table worth a pricing cross-check.
  * `security:security.adoc` has `page-audience: admin` but reads as general audience.
  * `deploy:set-up-deploys.adoc` is `github, github-enterprise`. Broaden it if deploys gain other providers.
* **Optional:** a dedicated pricing cross-reference audit of every plan claim in guides/reference. The classification pass found no disagreements.
