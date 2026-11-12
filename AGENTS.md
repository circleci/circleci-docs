# CircleCI Documentation Style Guide for AI Assistants

This guide provides style, voice, and formatting rules for AI assistants when creating and editing CircleCI documentation. Follow these guidelines when working on AsciiDoc content in the docs directory.

## Documentation Overview

For a comprehensive overview of the CircleCI documentation structure, see the auto-generated `llms.txt` file on the live site at https://circleci.com/docs/llms.txt. This file provides:
- Complete documentation structure with all components
- Full navigation hierarchy
- Content statistics and URL patterns
- Technical stack information

This guide focuses on **how to write documentation**. The llms.txt file tells you **what documentation exists and where**.

One other file serves a different audience and must not be confused with this one:

- `docs/agent-guide.md` is published verbatim as `AGENTS.md` at the site root (`https://circleci.com/docs/AGENTS.md`), for AI agents and humans using the CircleCI product. It carries current defaults, deprecated patterns, and Cloud/Server differences. Update it, not this file, when you change API versioning, MCP offerings, runner install paths, or a deprecated pattern.

The human-facing "find the right starting point" table lives as a section in `docs/guides/modules/getting-started/pages/getting-started.adoc` (Quickstart guide), not on a dedicated page.

## Git worktrees

- **Local agents** (Claude Code CLI, Cursor Desktop): work in the main `circleci-docs` checkout. **Ask before creating a git worktree**, and create one only when asked. Worktrees accumulate quickly and are awkward to unwind mid-task.
- **Cloud agents** (started via `@cursor` in Linear or GitHub): always create a worktree, since there is no one to ask. Use `../circleci-docs-worktrees/<issue-id>-<short-description>`, for example `git worktree add ../circleci-docs-worktrees/LIN-123-fix-nav -b LIN-123-fix-nav`. With no issue ID, use a short description only.

See [Agent Environment Context](#agent-environment-context) for the two environments.

## Creating New Documentation Pages

**IMPORTANT**: When creating new documentation pages, always start with the appropriate page template from `docs/contributors/modules/templates/pages/`:
- `template-how-to.adoc` - Task-oriented guides
- `template-conceptual.adoc` - Explanatory content
- `template-tutorial.adoc` - Learning-oriented tutorials

All pages require standard attributes (`:page-platform:`, `:page-audience:`, `:page-description:`, `:experimental:`) at the top. See the "Working with the Docs Site" section for complete details on templates and page attributes.

## Voice and Style

### Active Voice and Direct Language
- **Use active voice**: Talk directly to the reader using simple, direct, clear, and confident language
- Active voice keeps instructions short and quickly conveys meaning
- **Good**: Click **Go** and your project will complete.
- **Bad**: When you click the **Go** button your project should complete.

### Dated and Scheduled Changes
- Put the date first, then the actor and the action, in the present tense. A date at the end of a sentence can read as the time the action in the sentence happens.
- Use the present tense for a dated, announced change. It stays correct whenever the reader sees it, and the `FutureTense` Vale rule flags "will". An announced removal or deprecation is a current fact, not aspirational behavior.
- **Good**: On 1 February 2027, CircleCI removes nine endpoints. These endpoints trigger and rerun builds.
- **Bad**: CircleCI removes nine endpoints that trigger and rerun builds on 1 February 2027.

### No Working Notes in Pages
- Do not leave `TODO`, `FIXME`, or reviewer notes in a page, including AsciiDoc `//` comments. Put open questions in the pull request description checklist.
- Do not describe history in a page, a schema description, or a comment. Avoid "previously", "no longer", and "now supports". State the current behavior or rule.

### Accessibility
- Write for a general audience
- Assume technical competence but explain concepts clearly and simply
- Complex concepts should be accessible to non-technical readers

### Current Product Behavior Only
- Docs state what the product does now. Do not document planned, upcoming, or aspirational behavior
- Do not write "will be supported from", "coming soon", or a future version number for a feature that is not yet available
- If a feature is unavailable on a platform, say so plainly and leave out when it might arrive
- **Good**: `$CIRCLE_OIDC_TOKEN_V3` is not available on server.
- **Bad**: `$CIRCLE_OIDC_TOKEN_V3` will be supported from server v5.0+.

### Word Choices
- Do not describe a process as "easy", "easily", or "simply". You cannot know what is easy for the reader
- Avoid "please"
- Use "using" instead of "via", which is harder for non-native English speakers
- Do not use time-sensitive language such as "new", "soon", or "in preview" in main prose. It goes stale. If it is needed, put it in an admonition that makes the time-sensitive nature clear
- Use inclusive terms:

| Avoid | Use instead |
|---|---|
| Blacklist / Whitelist | Blocklist / Safelist |
| Master / Slave | Leader / Follower, or Primary / Replica, depending on context |
| Insane / Sane / Crazy | Unreasonable / Reasonable |
| Killer | Very successful |
| Guys | Folks, people, humans, teammates |

### CircleCI-Specific Terminology
- The CircleCI web interface is the "web app"
- Use "CI/CD" to describe what we do
- A pipeline is the definition of what code to run and which config to use. It does not run and is not triggered
- A **trigger** starts a **run** (the web app labels it "Pipeline run"). Write "trigger a pipeline run" or "a run is triggered", not "trigger a pipeline" or "run a pipeline"
- **Workflows** and **jobs** run. Runs and pipelines do not
- **Good**: Push a commit to trigger a pipeline run.
- **Good**: Push a commit to trigger a run.
- **Good**: The workflow starts once the pipeline run is triggered.
- **Good**: The workflow starts once the run is triggered.
- **Bad**: Push a commit to trigger your pipeline.
- **Bad**: Run the pipeline to build your project.
- **Bad**: The pipeline runs when you push a commit.
- Feature names are rarely capitalized (exceptions: Insights)
- A CircleCI configuration file can have any name. Do not state that it must be `.circleci/config.yml` or assume the reader's file has that name. Write "your CircleCI configuration file, commonly stored as `.circleci/config.yml`". Vale warns on this (`ConfigFileName`)

## Numbers
- **Write out** numbers one through nine
- **Use numerals** for 10 and above
- **Exceptions**:
  - Addresses: 6 Maple St.
  - Ages: Beth, a 12-year-old turtle; the 2-year-old testing framework
  - Dollars and cents: $5; 5 cents
  - Measurements: 6 feet tall, 9-by-12 workspace; 7 miles per hour
  - Millions, billions: 3 million users

## Grammar
- **"Login" and "Setup" are nouns, not verbs**:
  - The login screen …
  - Log in to your account …
  - Read the setup guide …
  - Set up your account …

- **Use "open source"**, not "opensource" or "open-source"

## Abbreviations and Symbols
- **Do not use "e.g." or "i.e."**. Use "for example" and "that is"
- **Do not use "&"** in place of "and"
- **Use the Oxford comma**: "a pencil, eraser, and notebook"

## Punctuation

### Semicolons
- **Avoid semicolons**. Prefer a new sentence, or use commas and periods.
- Use a semicolon only sparingly, and only in these cases:
  - When joining two closely related independent clauses where a period or a comma is not as effective.
    - Recommended: Start with a smaller resource class; if the job fails due to memory limits, increase the class.
  - When preceding a conjunctive adverb (like *therefore*) or a phrase (like *that is*) that joins two independent clauses.
    - Recommended: The workflow skips the deploy job on feature branches; therefore, only the test jobs run.
    - Recommended: Set the executor at the job level; that is, declare `docker`, `machine`, or `macos` under the job, not under the workflow.
  - When separating a series of long or complex items that contain their own punctuation.
    - Recommended: Review the page one more time, checking for the following: present tense and active voice; typos, punctuation, and grammar; and whether you can shorten anything.

### Colons
- **Avoid mid-sentence colons** to introduce an explanation or continuation. Prefer a new sentence.
  - Not recommended: This saves round trips: instead of fetching each step's log in a separate call, you retrieve all failure context at once.
  - Recommended: This saves round trips. Instead of fetching each step's log in a separate call, you retrieve all failure context at once.
- Use a colon to introduce a list, a code block, or a table.
- Use a colon to separate an item and its description (not a dash).
  - Recommended: Resource class: The compute size assigned to a job.

### Dashes
- **Avoid dashes** (en or em) to split sentences. Prefer a new sentence, or use commas and periods.
- If you use an em dash (—) to indicate a break in a sentence, do not put a space before or after it. Do not use an en dash or a hyphen in place of an em dash.
- **Do not use en dashes** (–). Use a hyphen or the word "to" instead.
  - Recommended: Server v4.0 to v4.8
  - Not recommended: Server v4.0–v4.8
- Do not use a dash to separate an item and its description. Use a colon or a period.
  - Recommended: Resource class: The compute size assigned to a job.
  - Not recommended: Resource class - The compute size assigned to a job.

## AsciiDoc Formatting

### Text Styling
- **Use bold** for GUI menu options and button text:
  - Select **Org** from the sidebar
  - Click **Set Up Project**
- **Use italics** for commonly understood technical concepts (not CircleCI features):
  - _Continuous Integration_
  - _Concurrency_
  - _Parallelism_

### Icons
Use the icon macro for UI icons. It switches between light and dark versions:

```adoc
Select the icon:more[Ellipsis menu icon] to open the menu.
```

- Always include alt text, and use this macro instead of `image:` for theme-aware icons
- Icons live in `docs/guides/modules/ROOT/images/icons/`. List the directory for the available names
- To add one, add `name.svg` (light theme, dark icon color, typically `#161616`) and `name-dark.svg` (dark theme, light icon color, typically `#D7DBE3`)

### Page Badges
Set `:page-badge:` to `Beta`, `Preview`, or `Deprecated` to show a badge next to the page title and its navigation entry. Never use `New`, because it goes stale. A closed preview page has the `Preview` badge and is **not** listed in the navigation. An open preview page has the `Preview` badge and **is** listed. For optional styling attributes, see xref:contributors:docs-style:title-badges.adoc[Page Title Badges].

### Subsection Badges
Put `[badge="Beta"]` on the line above a heading (h2-h6) to badge it. Common badges: `Preview`, `Beta`, `Deprecated`, `Cloud only`, `Server v4+`. Badges do not appear in xref link text. For styling attributes, see xref:contributors:docs-style:title-badges.adoc#subsection-badges[Subsection Badges].

### Headings
- Write headings in **logical sequence** that tells a story
- **Do not skip heading levels** (for example, h2 to h4)
- Antora creates the `h1` from the page title, so use only `h2` and below in the body
- Include at least an intro paragraph before subheadings
- Headings are in **sentence case**. Only xref link text is title case, so an xref to a heading does not match the heading's capitalization
- **Start headings with verbs** where possible:
  - **Good**: "Grooming cats"
  - **Bad**: "Cats"
- When referencing headings in prose, use full heading with no quotes and title case

### Cross-References
- Use resource ID coordinates:
```adoc
xref:guides:integration:github-integration.adoc#user-keys-and-deploy-keys[User Keys and Deploy Keys]
```
- **Explicitly name** the document or section:
  - **Good**: Refer to the xref:guides:security:set-environment-variable.adoc[Setting an Environment Variable in a Project] section
  - **Bad**: For more information head xref:guides:security:set-environment-variable.adoc[here]
- **Use title case for link text** (Vale enforced):
  - **Good**: `xref:guides:orchestrate:schedule-triggers.adoc[Schedule Triggers]`
  - **Bad**: `xref:guides:orchestrate:schedule-triggers.adoc[schedule triggers]`
- Always verify xrefs before using them. Check that the page you are referencing exists in the location you are using to create the resource ID
- **Heading hashes are lowercase kebab-case of the heading text.** The playbook sets `idprefix: ""` and `idseparator: "-"`, so `== Install CircleCI agent skills` becomes `#install-circleci-agent-skills`. Do not use AsciiDoc's default underscore IDs (`#_install_circleci_agent_skills`). `validate-html` fails when a hash does not exist on the built page.
- Add an explicit `[#custom-id]` only when the hash must differ from that kebab-case heading. Otherwise link to the generated ID:
```adoc
== Install CircleCI agent skills

See the Codex and Copilot tabs in <<install-circleci-agent-skills>>.
```
- For cross-page section links: `xref:guides:toolkit:circleci-agent-skills.adoc#install-circleci-agent-skills[Install CircleCI Agent Skills]`

Before adding any xref, verify the target file exists and the path is correct (`find docs -name "filename.adoc"`). Do not guess file names, module names, or locations.

The format is `xref:component:module:filename.adoc[Link Text]`. The component is usually `guides`, `reference`, or `orbs`. The module is the directory under `modules/`. For example, `docs/guides/modules/deploy/pages/configure-deploy-markers.adoc` becomes `xref:guides:deploy:configure-deploy-markers.adoc[Configure Deploy Markers]`.

### External Links
- Use this format:
```adoc
link:https://circleci.com[CircleCI]
```
- Links must have descriptive link text (not "click here", "here", or "this")
- **Use title case for link text on CircleCI-owned URLs** (including API reference docs at `circleci.com/docs/api/`):
 - **Good**: `link:https://circleci.com/docs/api/v3#tag/triggers[API v3 Triggers Reference]`
 - **Bad**: `link:https://circleci.com/docs/api/v3#tag/triggers[Triggers section of the API v3 docs]`
- **Links to third-party sites may use sentence case** (match the name or title as it appears on that site)

### Code Samples
- **Reuse shared snippets** from `docs/guides/modules/ROOT/examples/` when the same config already exists. Include them with `example$` inside a source block. Follow `skills/partials/SKILL.md` to discover, insert, or extract examples.
- **Provide working examples**: Code should be tested and valid
- Readers should copy-paste with minimal changes
- **Specify language** for syntax highlighting:
```adoc
[source,yaml]
----
version: 2.1
----
```
- **For commands**, use `console` language with dollar sign:
```adoc
[source,console]
----
$ circleci version
----
```
- The dollar sign won't be copied with the copy button
- **For commands with a multi-line body**, such as a JSON payload or heredoc, use `shell` without a dollar sign. The copy button only copies lines that start with `$ `, so a `console` block would lose the body:
```adoc
[source,shell]
----
curl --request POST https://example.com/api \
  --data '{
    "key": "value"
  }'
----
```
- When users need to substitute data, use `<my-data>` format
- Point out what needs replacement, including whether to replace `< >` or `" "`
- **Show full job or workflow**, not just relevant lines
- Add titles and comments to explain code:
```adoc
.A title for the code snippet
[source,yaml]
----
version: 2.1
jobs:
  hello-job:
    docker:
      - image: cimg/node:17.2.0 # the primary container
----
```

### Lists
- **Use ordered lists** (numbered) for sequential steps:
```adoc
. Step one
. Step two
. Step three
```
- **Use unordered lists** for everything else, including alternatives. If the reader picks one option, such as API v3 or API v2, or rerunning all jobs or only failed jobs, use bullets. Ask whether the reader does every item in order. If not, it is not a numbered list.
- Use `+` to include blocks within steps:
```adoc
. Step one
. Step two involves code
+
[source,shell]
----
some code
----
. Step three
```
- **Capitalize first word** of each list item
- **Use periods** if item is a full sentence or completes the intro stem
- **Split literal-heavy paragraphs into lists**: a paragraph with three or more inline code spans or literal values is hard to read. Use a bulleted or description list where it fits, for example one item per format or variant

### Tables
- Wrap tables in scrollable container:
```adoc
[.table-scroll]
--
[cols=4*, options="header"]
|===
| Key
| Required
| Type
| Description

| Version
| Y
| String
| Should currently be `2`
|===
--
```

### Reusable Partials

Follow `skills/partials/SKILL.md` to discover, insert, or create partials (`docs/guides/modules/ROOT/partials/`, shared AsciiDoc prose) and shared examples. Scan the directory instead of relying on a list. Do not paste a partial's content into a page, and do not copy reusable content by hand in other skills.

- Use a partial for content that appears on two or more pages and must stay in sync: navigation steps, standard notes, FAQ entries, resource tables, troubleshooting. Do not use one for page-specific content.
- Include syntax: `include::ROOT:partial$category/filename.adoc[]`. Custom text goes in the brackets, for example `include::ROOT:partial$notes/standalone-unsupported.adoc[This feature is not supported for GitLab]`.
- Give a new partial a descriptive filename in the right category directory. End FAQ and troubleshooting snippets with `-snip.adoc`.
- A change to a partial changes every page that includes it.

### Reusable Examples

Shared code snippets live in `docs/guides/modules/ROOT/examples/`, next to `partials/`. Include them with `example$` **inside** a source block. Do not paste the snippet into the page.

```adoc
.Optional title for the snippet
[source,yaml]
----
include::ROOT:example$orchestration-examples/job-group.yml[]
----
```

From another component, use `include::guides:ROOT:example$path.yml[]`. Current categories: `expression-examples/` (current expression syntax), `logic-statement-examples/` (legacy logic statements), `orchestration-examples/` (job groups, serial groups, `override-with`). Follow `skills/partials/SKILL.md` to browse, search, insert, or extract examples.

### Images
- **Always include descriptive alt text**:
```adoc
.Image Title
image::guides:ROOT:name-of-image.png[Alternative text describing the image]
```
- Images without alt text are accessibility violations
- Include title above image using `.Title` syntax

### Diagrams
Add diagrams with a `[mermaid]` block.

```adoc
[mermaid]
....
sequenceDiagram
    Alice->>Bob: Hello Bob
....
```

### Admonitions (Notes, Tips, Warnings)
Use admonitions sparingly. If every paragraph is important, nothing is. Keep each one short, and if a note runs long, make it its own section. Choose the type from the situation:

| Situation | Use |
|---|---|
| An optional shortcut or efficiency hint for a step | `TIP:` |
| An important point that does not fit neatly into the flow | `NOTE:` |
| A feature is in beta or subject to change | `NOTE:` (and set `:page-badge:`) |
| Key details that cause extra work if missed | `IMPORTANT:` |
| A setting or action might have unintended consequences | `CAUTION:` |
| A security concern the reader must be aware of | `CAUTION:` |
| An action that cannot be undone, such as data loss or a security breach | `WARNING:` |
| A procedure to follow to avoid future issues | Main text, not an admonition |
| A known limitation that affects what the reader can expect | A limitations section, not an admonition |

Simple syntax:
```adoc
NOTE: This is a note.
```

Block syntax for longer content:
```adoc
[NOTE]
====
This is a longer note with:

. Step 1
. Step 2
====
```

### Tabs
Use for showing different options:
```adoc
[tabs]
====
Tab A::
+
--
Content for Tab A
--
Tab B::
+
--
Content for Tab B
--
====
```

### Cloud and Server Content

The `guides` component builds twice from one set of source files: a Cloud build (the unversioned default) and a Server build (latest release). The Server build sets the AsciiDoc attribute `server`. The Cloud build does not. There is no `cloud` attribute. The `enabled` setting on the `guides-versions-extension.js` entry in `antora-playbook.yml` turns the Server build on or off. The human-facing version of this section is `docs/contributors/modules/docs-style/pages/cloud-and-server-content.adoc`.

**Decide first.** Most content is the same on both platforms, so use as few conditionals as possible.

- If the text is correct for both platforms, leave it alone. Do not hide Cloud examples or comparison tables from Server readers.
- Facts about scope are the same on both platforms. When a change affects both, such as a deprecation, state it the same way in the opening, even when some of it does not apply to Server. Do not use conditionals to make a change look smaller or larger on one platform. Use conditionals only where the steps differ.
- If a feature does not exist on Server, wrap it in `ifndef::server[]`.
- If Server works differently, keep the Cloud text unchanged and add a Server variant in `ifdef::server[]`.
- If only the version differs, state the version in the text ("from Server 4.9"). Do not branch on version, and do not use `ifeval`.

**Syntax.** Put each directive on its own line.

```adoc
ifndef::server[]
Cloud-only content.
endif::server[]
ifdef::server[]
Server-only content.
endif::server[]
```

**Rules:**

- Use `ifndef::server[]` for Cloud-only content and `ifdef::server[]` for Server-only content. Never test for a `cloud` attribute, because partials are shared with the `reference` component. Vale (`ServerConditionals`) enforces some of these rules.
- **Cloud output must not change** when you add conditionals to an existing page. Keep the original Cloud text byte-for-byte inside `ifndef::server[]`. Put wanted Cloud wording changes in a separate commit or pull request.
- Whole-page availability comes from metadata (`:page-platform:`, `:page-server-min-version:`, `:page-server-deprecated-in:`), not conditionals. Never wrap page attributes, such as `:page-description:`, in conditionals.
- In a `[tabs]` block, a conditional may wrap a complete tab, from its `Label::` line to the end of its body. Do not put a conditional inside a tab body or around part of a tab. When only part of a tab differs, move the tab body into a partial and include it in the tab and in an `ifdef::server[]` block.
- Do not put a directive mid-sentence. Write two complete sentences.
- Keep one explicit kebab-case heading ID for both builds. Do not wrap the `[#id]` line.
- Close every directive. Unbalanced conditionals fail Vale (`AsciiDoc.ValidConditions`).
- Wrap an xref to a Cloud-only page (`:page-platform: Cloud`) in `ifndef::server[]`. The Server build replaces unwrapped links with plain text and lists them in `extensions/.temp/guides-server-unlinked.md`. The `maxunlinkedxrefs` setting in `antora-playbook.yml` fails the build if the count rises.
- On Server, name the web app without a link. Link to `app.circleci.com` only on Cloud. When an example uses `circleci.com`, add a Server note to replace it with the Server hostname.
- The pipeline type table in `docs/guides/modules/integration/pages/version-control-system-integration-overview.adoc` ("GitHub OAuth on Server" column) is the source of truth for Server support. If unsure, ask rather than guess.

**Verify.** Build `main` and your branch with `npm run build:docs`, then diff the HTML in `build/`. Ignore `edit/<branch>/` URLs and timestamps in the sitemap and `llms.txt`. Treat any other difference as a real change to Cloud output. To preview the Server build, set `enabled: true` on the `guides-versions-extension.js` entry in `antora-playbook.yml`, and do not commit that change.

## Common Mistakes to Avoid

Vale (rules in `styles/`) catches most wording and punctuation problems. Watch for the ones it cannot:

1. Contractions
2. Periods at the end of sentences that end in a URL or code
3. Missing page attributes (`:page-platform:`, `:page-audience:`, `:page-description:`, `:experimental:`), or not starting a new page from a template
4. Xrefs to files that do not exist
5. Underscore heading IDs (`<<_install_circleci_agent_skills>>`) instead of the site kebab-case ID (`<<install-circleci-agent-skills>>`)
6. Semicolons, en dashes, or dashes that separate an item from its description
7. Documenting planned or future behavior, such as "will be supported from v5.0"
8. Paragraphs dense with inline code or literal values that should be a bulleted list
9. A date at the end of a sentence about a change, so it reads as when the action happens
10. A numbered list for alternatives the reader chooses between
11. `TODO` notes, or descriptions of history such as "previously" or "now supports", left in a page or schema
12. **Committing without running Vale and fixing errors**

## AsciiDoc Validation Rules
- Close all attribute blocks properly
- Use valid admonition block syntax
- Use valid code block syntax
- Use valid table block syntax
- Close ID quotes properly

## Linting and Validation

Vale (rules in `styles/`, configuration in `.vale.ini`) and the build enforce most mechanical rules, so this guide does not restate them. **Run Vale locally before committing and fix all error-level violations.** Vale errors fail the `lint` CI job and block the PR. Do not request review until they are resolved.

### Agent Environment Context

- **Cloud agents** (started via `@cursor` in Linear or GitHub) run in isolated VMs without your local tools, credentials, or the CircleCI CLI. Install Vale yourself.
- **Local agents** (Cursor Desktop or Claude Code CLI) have the CircleCI CLI, MCP servers, and local credentials. Still run Vale locally.

### Installing Vale

CI runs the `jdkato/vale:latest` image, so install the latest Vale. On macOS, `brew install vale` (or `brew upgrade vale`). On Linux, including cloud agents:

```bash
VALE_VERSION=$(curl -sL https://api.github.com/repos/vale-cli/vale/releases/latest | grep -o '"tag_name": *"v[^"]*' | cut -d'v' -f2)
curl -sL "https://github.com/vale-cli/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o /tmp/vale.tar.gz
tar -xzf /tmp/vale.tar.gz -C /tmp && sudo mv /tmp/vale /usr/local/bin/
sudo apt-get update && sudo apt-get install -y asciidoctor   # Vale needs it to parse AsciiDoc
```

Then run `vale sync` once, and again whenever `.vale.ini` changes. Without it the packaged rules do not load and local results differ from CI.

### Running Vale

```bash
vale docs/guides/modules/toolkit/pages/your-file.adoc          # a file or a directory
git diff --cached --name-only | grep '\.adoc$' | xargs vale   # staged files
```

CI is authoritative. If a local run disagrees with the `lint` job, compare `vale --version` with the `lint` output and run `vale sync` before concluding a rule is wrong. Local agents with the CircleCI CLI can read the CI result with `circleci run get`, then `circleci job output get <job-uuid>`. On GitHub, open the `ci/circleci: lint` check. To fix many errors at once, use `skills/vale-linter/SKILL.md`.

### AsciiDoc Validation

The build also catches broken xrefs, unlisted pages (not in `nav.adoc`), invalid attributes, and malformed code blocks or tables. `npm run start:dev` shows warnings and `npm run build:docs` catches all errors.

### Pre-commit Checklist

Before committing documentation changes:

1. ✅ **REQUIRED**: Run Vale locally and fix all error-level violations. Confirm `vale --version` matches CI and that you have run `vale sync`, or your results will not match the `lint` job
2. ✅ **REQUIRED**: Run `npm run check:metadata` and fix any page attribute errors. It also enforces the `:page-description:` length
3. ✅ Preview locally to check formatting and links
4. ✅ Verify all xrefs point to existing files, and that heading hashes use kebab-case of the heading (not `_underscore_ids`)
5. ✅ Confirm the page is added to `nav.adoc` if new
6. ✅ If you add or change code samples that pin an orb or `cimg` version, or name a resource class, machine image, or Xcode version, run `node scripts/check-code-versions.js <files>` and fix what it reports, unless the example needs it

## Documentation Architecture

### Component Structure

The CircleCI docs use Antora's component-based architecture:

**When to use each component:**

- **Root**: Landing page and site home
- **Guides**: Tutorial and how-to content for end users
- **Reference**: Technical reference material (config, API, CLI)
- **Orbs**: Orb-related documentation
- **Server Admin**: Self-hosted server docs (versioned by release)
- **Services**: Field engineering service docs
- **Contributors**: Documentation for contributors including the style guide and page templates

### Component Organization

Each component follows this structure:
```
docs/component-name/
├── antora.yml              # Component metadata
└── modules/
    └── ROOT/
        ├── nav.adoc        # Navigation structure
        └── pages/          # AsciiDoc content
```

### Navigation Structure (nav.adoc)

Navigation uses AsciiDoc list syntax:

```adoc
* Top Level Category
** xref:getting-started:first-steps.adoc[Page Title]
** Subcategory
*** xref:getting-started:tutorial.adoc[Tutorial]
```

Rules:
- Every page should appear in navigation
- Use `xref:` for internal cross-references
- Format: `xref:module:filename.adoc[Link Text]`

### Cross-Referencing Between Components

Full coordinate system:
```adoc
xref:component:module:filename.adoc[Link Text]
```

Examples:
```adoc
xref:guides:getting-started:first-steps.adoc[First Steps]
xref:reference:configuration-reference.adoc[Config Reference]
```

## Working with the Docs Site

### Previewing Changes Locally

```bash
npm run start:dev
```

Opens http://localhost:5000 with live reload

### Build Commands

```bash
npm run build:docs    # Full site build
npm run build:ui      # UI bundle only
npm run build:api-docs # API docs only
```

### Adding a New Page

1. Choose the appropriate page template from `docs/contributors/modules/templates/pages/`:
   - `template-how-to.adoc` - For task-oriented guides showing how to accomplish a specific goal
   - `template-conceptual.adoc` - For explanatory content about features or concepts
   - `template-tutorial.adoc` - For learning-oriented, step-by-step tutorials
2. Create `.adoc` file in appropriate `pages/` directory
3. Add required page attributes at the top of the file (see Page Attributes section below)
4. Write content following the template structure and style guide
5. Add entry to `nav.adoc`
6. Preview locally
7. Commit both files

**Note on templates**: For very short, simple pages (like toggling a single setting), you can use a simplified structure rather than the full template format. Use your judgment based on content complexity.

### Page Attributes

All documentation pages must include attributes at the top of the file, before the main content. These attributes provide metadata and enable certain AsciiDoc features.

The full metadata contract is defined in `schemas/docs-metadata.schema.json` (DOC-269). This section summarizes it; if the two ever disagree, the schema file wins.

The `check-metadata` CI job validates every page against the schema. Run the same check locally with `npm run check:metadata`, or pass file paths to check only those files (`node scripts/check-metadata.js <file>...`). To run it automatically on staged `.adoc` files before each commit, run `npm run hooks:install` once.

**Required attributes:**

```adoc
= Page Title
:page-platform: Cloud, Server
:page-server-min-version: "4.7"
:page-audience: developer
:page-description: A brief description for SEO and metadata (70-160 characters)
:experimental:
```

**Attribute descriptions:**

- `:page-platform:` - Which CircleCI platform(s) support the feature. Displays as badges under the page title.
  - Comma-separated, capitalized: `Cloud`, `Server`, or `Cloud, Server`
  - Do not put a version number here — use `:page-server-min-version:` instead

- `:page-server-min-version:` - Only when `server` is in `:page-platform:`. The minimum Server version the feature is available from, for example `"4.7"`.
  - **Always quote the value.** An unquoted `4.10` is parsed as the number `4.1`, silently dropping the trailing zero.

- `:page-server-deprecated-in:` - Optional. Same format and quoting rule as above, for a feature deprecated or removed in Server, for example `"5.0"`.

- `:page-audience:` - Who the page is for.
  - `admin` - Server operators/administrators (installation, cluster management, upgrades)
  - `developer` - everyone else; this is the default for Cloud-only and general content

- `:page-content-type:` - Optional. One or more Diátaxis types, comma-separated: `tutorial`, `how-to`, `reference`, `explanation`. A page can legitimately carry more than one.

- `:page-vcs:` - Optional. Comma-separated VCS providers the feature supports: `all`, `github`, `github-enterprise`, `gitlab`, `gitlab-self-hosted`, `bitbucket`, `cursor-origin`. Use `all` on its own — never combine it with specific providers.

- `:page-badge:` - Optional. One of `Beta`, `Preview`, `Deprecated`. Never `New` — it's date-relative and goes stale as soon as someone forgets to remove it.

- `:page-plan:` - Optional. Which CircleCI cloud plan(s) the page's functionality is available on: one to three of `Free`, `Performance`, `Scale`, comma-separated, in that order, for example `Performance, Scale`.
  - Title case, unlike the other enum attributes — it matches the product's own plan names.
  - No `all` shorthand — a page available on every plan lists all three: `Free, Performance, Scale`.
  - Not used on Server-only pages (`:page-platform: server` with no `cloud`); Server is a separate plan covered by `page-platform`, not by `page-plan`.
  - A page gets a plan if the feature is available on it at all, even at a lower limit (for example capped flaky test detection). If only a section of the page is gated, the page still lists all three plans and the gated section carries its own inline note.
  - On `guides` and `reference` pages, `page-plan` and `page-vcs` drive a generated availability sidebar (Cloud plans / Version control) — don't write one by hand as a `****` sidebar or NOTE. It's built at build time from these attributes; see `extensions/page-availability-extension.js`.

- `:page-description:` - Used for SEO meta descriptions and page previews
  - **Must be between 70-160 characters** (enforced by `check-metadata`)
  - Must be unique across the site. On `server-admin-*` pages, include the Server version (for example `CircleCI Server 4.10`), since each version has its own copy of the page
  - Write a clear, concise summary of what the page covers
  - Use active voice

- `:experimental:` - Enables experimental AsciiDoc macros
  - Required for UI macros like `btn:[Button Text]`, `menu:`, `kbd:`
  - Include this attribute on all pages as it's commonly needed

**How to determine attribute values:**

To find examples of proper attribute usage, check existing pages in the same module:
```bash
# View attributes from similar pages
head -10 docs/guides/modules/toolkit/pages/existing-page.adoc
```

### Troubleshooting

**"Unlisted page" errors**: Page not in `nav.adoc` - add to navigation

**"Unresolved page ID" errors**: Check xref coordinates and file exists

**Navigation not updating**: Restart dev server after nav.adoc changes

## When Editing Existing Documentation
- Follow these guidelines for new content
- When touching existing sections, update them to meet current standards
- Help maintain consistency across the documentation
