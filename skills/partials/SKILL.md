---
name: partials
description: >
  Discover, preview, and insert CircleCI docs AsciiDoc partials with the correct
  include syntax. Propose when new or existing content should become a shared
  partial, then create it and replace duplicates after confirmation. Use this
  skill whenever the user mentions partials, includes, reusable snippets, or
  /partials, and whenever you are writing or editing .adoc pages that need
  shared navigation steps, notes, tips, FAQs, troubleshooting, resource tables,
  runner setup, or other repeated content. Other docs-authoring skills must
  follow this skill instead of copying reusable content by hand.
---

# CircleCI Docs Partials

Use existing AsciiDoc partials instead of rewriting shared steps, notes, tables, or FAQs. Always scan the repo. Do not invent filenames or rely on a memorized catalog.

## How other skills should use this

If another skill is writing or editing docs content:

1. Read this file before drafting reusable steps, notes, FAQs, tables, or troubleshooting.
2. Follow **Suggest from context** for the page you are writing.
3. Insert an `include::` line. Never paste the body of a partial into a page.
4. If the page restates an existing partial, or the same new chunk will appear on two or more pages, follow **Propose extraction**. Do not extract and replace across pages until the user confirms.

## Source of truth

Scan these trees. Do not treat the category map below as a file list.

| Content | Path | Ignore |
|---|---|---|
| Shared docs partials | `docs/guides/modules/ROOT/partials/` | `ui/src/partials/` (Handlebars UI templates) |
| Server Admin partials | `docs/server-admin-<version>/modules/ROOT/partials/` | Versioned copies. Edit the version you are working on. |

List files with Glob (`**/partials/**/*.adoc` under `docs/`) or:

```bash
find docs/guides/modules/ROOT/partials -name '*.adoc' | sort
```

## Include syntax

**Same component** (a guides page including a guides partial):

```adoc
include::ROOT:partial$category/filename.adoc[]
```

**Cross-component** (orbs, reference, or another component including a guides partial):

```adoc
include::guides:ROOT:partial$category/filename.adoc[]
```

Prefer the short `ROOT:partial$` form inside guides. Use the full `guides:ROOT:partial$` coordinate from every other component.

**Optional author comment** (does not change rendered content; common on well-known notes and nav steps):

```adoc
include::ROOT:partial$notes/standalone-unsupported.adoc[This feature is not supported for GitLab, GitHub App or Bitbucket Data Center]
```

**AsciiDoc include attributes** (do change rendering). Use `leveloffset` when the partial starts with section headings that must nest under the current heading:

```adoc
include::guides:ROOT:partial$deploy/configure-validation-providers.adoc[leveloffset=+2]
```

Do not put a comment and `leveloffset` in the same brackets unless you are sure both are valid attributes.

## Category map

Use the directory name to browse. Confirm the file still exists before inserting.

| Directory | Use when the page needs |
|---|---|
| `app-navigation/` | Steps to project, org, user, or job settings, or to find IDs |
| `create-project/` | Shared Create Project / choose-a-repo / GitLab cleanup steps |
| `notes/` | Reusable notes and warnings (Docker auth, feature support, org ID) |
| `tips/` | How to check org type, GitHub type, project slug, env vars vs contexts |
| `faq/` | FAQ answers (`*-snip.adoc`). Usually included from FAQ pages |
| `troubleshoot/` | Troubleshooting snippets (`*-snip.adoc`) |
| `runner/` | Self-hosted runner terms, install steps, package install, examples |
| `orbs/` | Orb type definitions and comparison table |
| `pipelines-and-triggers/` | Schedule triggers, custom webhooks, pipeline values |
| `execution-resources/` | Executor resource class tables and related notices |
| `using-expressions/` | Expression operators and env-var caveats |
| `deploy/` | Deploy/release shared sections (supported versions, validation providers) |
| `prerequisites/` | Shared prerequisite bullets (for example org admin) |
| `shared-sections/` | Longer shared sections (API token, secrets masking, product features) |
| `installation/` | Server Admin install-phase partials only |

## Workflows

Decide which workflow the user asked for. A write-docs skill usually wants **Suggest from context**, then **Insert**. When content is duplicated or clearly reusable, follow **Propose extraction** before writing a second copy.

### Browse (`/partials`, `/partials navigation`)

1. Resolve the category from the request (`navigation` → `app-navigation/`, `faq` → `faq/`, and so on). If the request is just `/partials`, list the category directories first and ask which to open.
2. Glob that directory. For each file, give **path**, a **one-line summary** from the actual content, and the **exact `include::` line**. Do not dump every file body.
3. Preview only the best match (or the one the user picks) by quoting the partial.
4. Ask whether to insert it, unless the user already named the file and said to insert it.
5. Follow **Insert**.

### Search (`/partials search project settings`)

1. Search filenames and file bodies:

```bash
find docs/guides/modules/ROOT/partials -iname '*<term>*'
rg -l -i '<term>' docs/guides/modules/ROOT/partials
```

2. Read the matches. Rank in this order:
   1. Filename matches the request
   2. The partial's primary purpose is the request (`app-navigation/` for "how do I get there", `tips/` for "how do I check X")
   3. Body-only mentions in `faq/`, `troubleshoot/`, or other pages that just happen to say the words
3. Show 2–4 candidates with path, one-line summary, and the exact `include::` line.
4. Preview the chosen file, then follow **Insert**.

### Suggest from context

Use this when writing or editing a page, even if the user did not say "partial".

1. Grep the page for existing `include::` lines. Do not re-suggest partials that are already there.
2. Read the page (or the draft outline) and list repeated or standard chunks: nav steps, support caveats, resource tables, FAQs, runner install, org-type checks.
3. For each chunk, search `docs/guides/modules/ROOT/partials/` by filename and content.
4. Read every candidate. Prefer the **most specific** partial:
   - Finding a project slug → `tips/find-project-slug.adoc`, not the generic project-settings steps
   - Finding a project or org ID → `app-navigation/steps-to-project-id.adoc` or `steps-to-org-id.adoc` (these already include the settings steps)
   - Checking GitHub App vs OAuth → `tips/check-github-type.adoc`
5. Suggest a partial only when the wording and scope match.
6. If a page has a **shortened** version of a standard nav partial, offer the full partial for that shared prefix and keep the page-specific steps that follow. Do not auto-insert if the reader is clearly already mid-flow (for example, already on the Projects page).
7. If one candidate is a clear match, insert it and tell the user which partial you used.
8. If several could work, show the options and ask.
9. If none fit, write the content inline. If the same chunk already exists on another page, or will be needed on a second page, follow **Propose extraction**.

Common starting points (still verify by reading the file):

| Need | First file to open |
|---|---|
| Steps to project settings | `app-navigation/steps-to-project-settings.adoc` |
| Steps to org settings | `app-navigation/steps-to-org-settings.adoc` |
| Create Project through pipeline setup | `create-project/steps-up-to-pipeline.adoc` |
| Docker authenticated pulls note | `notes/docker-auth.adoc` |
| Feature unsupported for some VCS / pipeline types | `notes/standalone-unsupported.adoc` |
| Check organization type | `tips/check-org-type.adoc` |
| Check GitHub App vs OAuth | `tips/check-github-type.adoc` |
| Find organization ID | `notes/find-organization-id.adoc` |
| Find project slug | `tips/find-project-slug.adoc` |
| Resource class table | Matching file in `execution-resources/` |
| Pipeline values reference | `pipelines-and-triggers/pipeline-values.adoc` |

### Insert

1. Confirm the target file exists at the path you will put in the include.
2. Choose the coordinate (`ROOT:partial$` vs `guides:ROOT:partial$`) from the including page's component.
3. Read the partial for composition: some files already `include::` another partial (for example `steps-to-project-id.adoc` includes `steps-to-project-settings.adoc`). Use the composed file. Do not stack both.
4. Read the partial for `ifdef::` / `ifndef::`. If present, set the matching page attributes before the include. Examples used today: `:machine:`, `:container:`, `:provisioner:`, `:linux:`, `:macos:`, `:windows:`, `:server:`.
5. Note the partial's wrapper (`****` sidebar, `NOTE:`, `TIP:`, or bare list items). Only insert when that wrapper fits the page.
6. If the partial starts with `==` / `===` headings, add `leveloffset` so they nest correctly.
7. Insert only the `include::` line. Do not copy the partial body into the page.
8. If the include sits inside a list or tab, read the partial's first lines and confirm the list markers or tab syntax still work. Some nav and create-project partials start with ordered-list `.` items on purpose.
9. Add an author comment in brackets when that file is already included that way elsewhere, or when the comment helps a human scan the source. Copy an existing comment when one is established (`standalone-unsupported`, `steps-to-project-settings`, `steps-up-to-pipeline`).
10. Tell the user the path you included and why.

### Propose extraction

Use this when existing page content should become a shared partial, or when you are about to write the same chunk in a second place.

**Extract when all of these are true:**

- The same steps, note, table, or FAQ will appear on **two or more** pages, or already does
- The wording can stay synchronized. Callers do not need different facts, audiences, or mid-flow shortcuts
- The chunk is a complete reusable unit (nav prefix, caveat, table), not a whole page

**Do not extract when:**

- The content is page-specific or only used once
- A shortened nav path is intentional because the reader is already mid-flow
- Wrapping or tone would not fit the other pages (`****` sidebar vs bare list vs `NOTE:`)
- Replacing would drop unique follow-on steps or change meaning

**Propose, then wait.** Do not create a file or rewrite other pages until the user confirms.

1. Search existing partials first. If one already covers this, propose **replacing** the inline copies with that include. Do not create a duplicate partial.
2. Grep pages (not just `partials/`) for distinctive phrases from the chunk. Read each match. Drop false positives.
3. Show the proposal:
   - Reuse an existing partial, or create `docs/guides/modules/ROOT/partials/<category>/<filename>.adoc`
   - Why it should be shared
   - Every page you would change, with a short before/after (inline block → `include::` line)
   - Anything you would **not** replace, and why
4. After the user confirms, follow **Create a partial** if needed, then **Insert** on each agreed page. Replace only the shared prefix. Leave page-specific steps in place.
5. Report the new or reused path and the list of updated pages. Remind the user that later edits to the partial change all of those pages.

### Create a partial

Create a new partial only after **Propose extraction** is confirmed, or the user asked for one.

1. Search existing partials first. Extend one if the topic already has a home.
2. Choose a category directory from the map above. Add a new directory only when none of the existing ones fit.
3. Name the file descriptively, ending in `.adoc`. Use `-snip.adoc` for FAQ and troubleshooting snippets.
4. Write content that works in more than one page. No `:page-platform:`, `:page-description:`, or other page-only attributes.
5. Keep the partial focused on one concept or one set of related steps.
6. Replace the duplicated page content with includes on the pages the user confirmed.
7. Mention that later edits to this file change every page that includes it.

### Edit a partial

1. Grep for every include of that file before changing it.
2. Summarize the pages that will change.
3. Edit the partial only when the new wording is correct for all of those pages. If it is not, write page-specific content instead of overloading the partial.

## Parameters

Three different things show up in or around includes. Do not mix them up.

**Author comments** in `[brackets]` are for humans. They do not substitute text into the partial. `notes/standalone-unsupported.adoc` does not read the bracket text; every include of that file renders the same support note.

**Include attributes** such as `leveloffset=+2`, `tag=`, or `lines=` change how AsciiDoc includes the file.

**Page attributes** set on the including page control `ifdef::` / `ifndef::` inside the partial. Example from container runner install:

```adoc
:container:

include::ROOT:partial$runner/install-with-web-app-steps.adoc[]
```

When a partial uses `ifdef::`, tell the user which attributes they must set. Suggest those attributes if they are missing.

## Do not

- Invent a partial path or guess a filename without Glob/Grep.
- Copy a partial's body into a page "to make it clearer".
- Extract and replace across pages without listing the consumers and getting confirmation.
- Use `ui/src/partials/` files in docs pages.
- Edit a guides partial to fix one page if that would break the others.
- Include a Server Admin `installation/` partial from a Cloud guides page.

## Example invocations

```
/partials
/partials navigation
/partials search project settings
Use a partial for the Docker auth note
Is there a partial for checking org type?
Should this note be a shared partial?
This project-settings walkthrough is copied on three pages. Extract it.
```
