---
name: partials
description: >
  Discover, preview, and insert CircleCI docs reusable includes: AsciiDoc
  partials and shared code examples. Propose when new or existing content
  should become a shared partial or example, then create it and replace
  duplicates after confirmation. Use this skill whenever the user mentions
  partials, examples, includes, reusable snippets, /partials, or /examples,
  and whenever you are writing or editing .adoc pages that need shared
  navigation steps, notes, tips, FAQs, troubleshooting, resource tables,
  runner setup, or shared config snippets. Other docs-authoring skills must
  follow this skill instead of copying reusable content by hand.
---

# CircleCI Docs Partials and Examples

Two reusable families live next to each other under `docs/guides/modules/ROOT/`:

| Family | Directory | Use for | Include family |
|---|---|---|---|
| **Partials** | `partials/` | Shared AsciiDoc prose (steps, notes, FAQs, tables) | `partial$` |
| **Examples** | `examples/` | Shared code snippets, usually YAML config | `example$` |

Choose the family from the request (`/partials` vs `/examples`) or from the content. Always scan the repo. Do not invent filenames or rely on a memorized catalog.

## How other skills should use this

If another skill is writing or editing docs content:

1. Read this file before drafting reusable steps, notes, FAQs, tables, troubleshooting, or config snippets.
2. Follow **Suggest from context** for the page you are writing.
3. Insert an `include::` line. Never paste the body of a partial or example into a page.
4. If the page restates an existing include, or the same new chunk will appear on two or more pages, follow **Propose extraction**. Do not extract and replace across pages until the user confirms.

## Source of truth

Scan these trees. Do not treat the category maps below as file lists.

| Content | Path | Ignore |
|---|---|---|
| Shared docs partials | `docs/guides/modules/ROOT/partials/` | `ui/src/partials/` (Handlebars UI templates) |
| Shared code examples | `docs/guides/modules/ROOT/examples/` | External GitHub sample repos linked from pages |
| Server Admin partials | `docs/server-admin-<version>/modules/ROOT/partials/` | Versioned copies. Edit the version you are working on. |

```bash
find docs/guides/modules/ROOT/partials -name '*.adoc' | sort
find docs/guides/modules/ROOT/examples -type f | sort
```

## Include syntax

### Partials

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

### Examples

Wrap the include in a source or listing block. The example file is raw code, not AsciiDoc.

**Same component:**

```adoc
.Optional title for the snippet
[source,yaml]
----
include::ROOT:example$category/filename.yml[]
----
```

**Cross-component:**

```adoc
[source,yaml]
----
include::guides:ROOT:example$orchestration-examples/job-group.yml[]
----
```

Match the page's existing fence style if it already has one (`[source,yaml]` or `[,yaml]`). Default to `[source,yaml]`. Put titles on the listing block (`.Title`), not in the include brackets. Comments that explain the snippet belong in the example file.

## Category maps

Confirm the file still exists before inserting.

### Partials (`partials/`)

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

### Examples (`examples/`)

| Directory | Use when the page needs |
|---|---|
| `expression-examples/` | Current expression syntax (`when: pipeline.git.branch == "main"`). Subdirs include `workflow-when/` and `job-filters/` |
| `logic-statement-examples/` | Legacy logic-statement maps (`when: or: equal:`). Use only when documenting the old syntax |
| `orchestration-examples/` | Job groups, serial groups, and `override-with` config |

Prefer `expression-examples/` over `logic-statement-examples/` unless the page is explicitly about legacy logic statements.

## Workflows

Decide which workflow the user asked for. A write-docs skill usually wants **Suggest from context**, then **Insert**. When content is duplicated or clearly reusable, follow **Propose extraction** before writing a second copy.

`/partials` scopes to `partials/`. `/examples` scopes to `examples/`. If the request is only `/partials` or `/examples`, list that family's category directories first.

### Browse (`/partials`, `/partials navigation`, `/examples`, `/examples orchestration`)

1. Resolve the family, then the category (`navigation` → `app-navigation/`, `orchestration` → `orchestration-examples/`).
2. Glob that directory. For each file, give **path**, a **one-line summary** from the actual content, and the **exact `include::` line** (for examples, show the full source-block wrapper). Do not dump every file body.
3. Preview only the best match (or the one the user picks) by quoting the file.
4. Ask whether to insert it, unless the user already named the file and said to insert it.
5. Follow **Insert**.

### Search (`/partials search project settings`, `/examples search job-group`)

1. Search filenames and file bodies in the chosen family (or both, if the request did not specify):

```bash
find docs/guides/modules/ROOT/partials -iname '*<term>*'
rg -l -i '<term>' docs/guides/modules/ROOT/partials
find docs/guides/modules/ROOT/examples -iname '*<term>*'
rg -l -i '<term>' docs/guides/modules/ROOT/examples
```

2. Read the matches. Rank in this order:
   1. Filename matches the request
   2. The file's primary purpose is the request
   3. Body-only mentions that just happen to say the words
3. Show 2–4 candidates with path, one-line summary, and the exact `include::` line (plus the source-block wrapper for examples).
4. Preview the chosen file, then follow **Insert**.

### Suggest from context

Use this when writing or editing a page, even if the user did not say "partial" or "example".

1. Grep the page for existing `include::` lines. Do not re-suggest files that are already there.
2. Read the page (or the draft outline) and list reusable chunks:
   - Prose: nav steps, support caveats, resource tables, FAQs, runner install, org-type checks → search `partials/`
   - Code: config snippets, workflow `when` clauses, job groups, serial groups → search `examples/`
3. For each chunk, search the matching tree by filename and content.
4. Read every candidate. Prefer the **most specific** file:
   - Finding a project slug → `tips/find-project-slug.adoc`, not the generic project-settings steps
   - Finding a project or org ID → `app-navigation/steps-to-project-id.adoc` or `steps-to-org-id.adoc` (these already include the settings steps)
   - Checking GitHub App vs OAuth → `tips/check-github-type.adoc`
   - Current workflow/job expressions → `expression-examples/`, not `logic-statement-examples/`
   - Job groups or serial groups → `orchestration-examples/`
5. Suggest an include only when the wording and scope match.
6. If a page has a **shortened** version of a standard nav partial, offer the full partial for that shared prefix and keep the page-specific steps that follow. Do not auto-insert if the reader is clearly already mid-flow (for example, already on the Projects page).
7. If one candidate is a clear match, insert it and tell the user which file you used.
8. If several could work, show the options and ask.
9. If none fit, write the content inline (or in a one-off source block). If the same chunk already exists on another page, or will be needed on a second page, follow **Propose extraction**.

Common starting points (still verify by reading the file):

| Need | First file to open |
|---|---|
| Steps to project settings | `partials/app-navigation/steps-to-project-settings.adoc` |
| Steps to org settings | `partials/app-navigation/steps-to-org-settings.adoc` |
| Create Project through pipeline setup | `partials/create-project/steps-up-to-pipeline.adoc` |
| Docker authenticated pulls note | `partials/notes/docker-auth.adoc` |
| Feature unsupported for some VCS / pipeline types | `partials/notes/standalone-unsupported.adoc` |
| Check organization type | `partials/tips/check-org-type.adoc` |
| Check GitHub App vs OAuth | `partials/tips/check-github-type.adoc` |
| Find organization ID | `partials/notes/find-organization-id.adoc` |
| Find project slug | `partials/tips/find-project-slug.adoc` |
| Resource class table | Matching file in `partials/execution-resources/` |
| Pipeline values reference | `partials/pipelines-and-triggers/pipeline-values.adoc` |
| Branch or boolean workflow `when` | Matching file in `examples/expression-examples/workflow-when/` |
| Job group | `examples/orchestration-examples/job-group.yml` |
| Serial group | `examples/orchestration-examples/serial-group.yml` |

### Insert

1. Confirm the target file exists at the path you will put in the include.
2. Choose the coordinate (`ROOT:…` vs `guides:ROOT:…`) from the including page's component.
3. For **partials**:
   1. Read for composition: some files already `include::` another partial (for example `steps-to-project-id.adoc` includes `steps-to-project-settings.adoc`). Use the composed file. Do not stack both.
   2. Read for `ifdef::` / `ifndef::`. If present, set the matching page attributes before the include. Examples used today: `:machine:`, `:container:`, `:provisioner:`, `:linux:`, `:macos:`, `:windows:`, `:server:`.
   3. Note the wrapper (`****` sidebar, `NOTE:`, `TIP:`, or bare list items). Only insert when that wrapper fits the page.
   4. If the partial starts with `==` / `===` headings, add `leveloffset` so they nest correctly.
   5. Insert only the `include::` line. If it sits inside a list or tab, confirm the list markers still work. Some nav and create-project partials start with ordered-list `.` items on purpose.
   6. Add an author comment in brackets when that file is already included that way elsewhere. Copy an existing comment when one is established (`standalone-unsupported`, `steps-to-project-settings`, `steps-up-to-pipeline`).
4. For **examples**:
   1. Insert the include **inside** a source or listing block. Never drop `include::ROOT:example$…` into prose.
   2. Do not copy the YAML (or other code) into the page.
   3. Keep explanatory comments in the example file. Keep the human-facing title on the listing block.
5. Tell the user the path you included and why.

### Propose extraction

Use this when existing page content should become a shared partial or example, or when you are about to write the same chunk in a second place.

**Extract when all of these are true:**

- The same steps, note, table, FAQ, or config snippet will appear on **two or more** pages, or already does
- The wording can stay synchronized. Callers do not need different facts, audiences, or mid-flow shortcuts
- The chunk is a complete reusable unit (nav prefix, caveat, table, or config snippet), not a whole page

**Do not extract when:**

- The content is page-specific or only used once
- A shortened nav path is intentional because the reader is already mid-flow
- Wrapping or tone would not fit the other pages (`****` sidebar vs bare list vs `NOTE:`)
- Replacing would drop unique follow-on steps or change meaning
- A config snippet is a one-off illustration that other pages should not stay synced with

**Propose, then wait.** Do not create a file or rewrite other pages until the user confirms.

1. Search existing partials and examples first. If one already covers this, propose **replacing** the inline copies with that include. Do not create a duplicate file.
2. Grep pages (not just `partials/` or `examples/`) for distinctive phrases from the chunk. Read each match. Drop false positives.
3. Show the proposal:
   - Reuse an existing file, or create `docs/guides/modules/ROOT/partials/<category>/<filename>.adoc` or `docs/guides/modules/ROOT/examples/<category>/<filename>.yml`
   - Why it should be shared
   - Every page you would change, with a short before/after (inline block → `include::` line, including the source-block wrapper for examples)
   - Anything you would **not** replace, and why
4. After the user confirms, follow **Create** if needed, then **Insert** on each agreed page. Replace only the shared prefix. Leave page-specific steps in place.
5. Report the new or reused path and the list of updated pages. Remind the user that later edits to the file change all of those pages.

### Create

Create a new file only after **Propose extraction** is confirmed, or the user asked for one.

1. Search existing files first. Extend one if the topic already has a home.
2. Choose the family and a category directory from the maps above. Add a new directory only when none of the existing ones fit.
3. Name the file descriptively. Partials end in `.adoc` (use `-snip.adoc` for FAQ and troubleshooting snippets). Examples use the language extension, usually `.yml`.
4. Write content that works in more than one page.
   - Partials: no `:page-platform:`, `:page-description:`, or other page-only attributes
   - Examples: valid, copy-pasteable code. Put comments in the file. Do not wrap the file in AsciiDoc source fences
5. Keep the file focused on one concept or one set of related steps or one snippet.
6. Replace the duplicated page content with includes on the pages the user confirmed.
7. Mention that later edits to this file change every page that includes it.

### Edit

1. Grep for every include of that file before changing it.
2. Summarize the pages that will change.
3. Edit the file only when the new wording or snippet is correct for all of those pages. If it is not, write page-specific content instead of overloading the shared file.

## Parameters

These apply to **partials**. Example includes do not take author comments or `leveloffset` in practice.

**Author comments** in `[brackets]` are for humans. They do not substitute text into the partial. `notes/standalone-unsupported.adoc` does not read the bracket text; every include of that file renders the same support note.

**Include attributes** such as `leveloffset=+2`, `tag=`, or `lines=` change how AsciiDoc includes the file.

**Page attributes** set on the including page control `ifdef::` / `ifndef::` inside the partial. Example from container runner install:

```adoc
:container:

include::ROOT:partial$runner/install-with-web-app-steps.adoc[]
```

When a partial uses `ifdef::`, tell the user which attributes they must set. Suggest those attributes if they are missing.

## Do not

- Invent a path or guess a filename without Glob/Grep.
- Copy a partial or example body into a page "to make it clearer".
- Insert an `example$` include outside a source or listing block.
- Extract and replace across pages without listing the consumers and getting confirmation.
- Use `ui/src/partials/` files in docs pages.
- Edit a shared file to fix one page if that would break the others.
- Include a Server Admin `installation/` partial from a Cloud guides page.
- Use a `logic-statement-examples/` snippet when documenting current expression syntax.

## Example invocations

```
/partials
/partials navigation
/partials search project settings
/examples
/examples orchestration
/examples search job-group
Use a partial for the Docker auth note
Is there a partial for checking org type?
Is there a shared example for serial groups?
Should this note be a shared partial?
This project-settings walkthrough is copied on three pages. Extract it.
This workflow when clause is copied in the cookbook and the config reference. Extract it.
```
