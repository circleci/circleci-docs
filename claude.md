# CircleCI Documentation Style Guide for Claude Code

This guide provides style, voice, and formatting rules for creating and editing CircleCI documentation. Follow these guidelines when working on AsciiDoc content in the docs directory.

## Documentation Overview

For a comprehensive overview of the CircleCI documentation structure, see the auto-generated `llms.txt` file on the live site at https://circleci.com/docs/llms.txt. This file provides:
- Complete documentation structure with all components
- Full navigation hierarchy
- Content statistics and URL patterns
- Technical stack information

This guide (CLAUDE.md) focuses on **how to write documentation**. The llms.txt file tells you **what documentation exists and where**.

## Creating New Documentation Pages

**IMPORTANT**: When creating new documentation pages, always start with the appropriate page template from `docs/contributors/modules/templates/pages/`:
- `template-how-to.adoc` - Task-oriented guides
- `template-conceptual.adoc` - Explanatory content
- `template-tutorial.adoc` - Learning-oriented tutorials

All pages require standard attributes (`:page-platform:`, `:page-description:`, `:experimental:`) at the top. See the "Working with the Docs Site" section for complete details on templates and page attributes.

## Voice and Style

### Active Voice and Direct Language
- **Use active voice**: Talk directly to the reader using simple, direct, clear, and confident language
- Active voice keeps instructions short and quickly conveys meaning
- **Good**: Click **Go** and your project will complete.
- **Bad**: When you click the **Go** button your project should complete.

### Accessibility
- Write for anyone and everyone
- Assume technical competence but explain concepts clearly and simply
- Complex concepts should be accessible to non-technical readers

### Word Choices to Avoid
- **Do not** make assumptions about complexity: Avoid "easy", "easily", "simply"
- **Avoid** using "please"
- **Avoid** ambiguous language like "should" and "should be". If something is optional, say so. If not, make it clear it's essential
- Use "using" instead of "via" (easier for non-English speakers)
- **Avoid contractions**: Don't use "don't", "you're", "can't", etc. (harder for non-native English speakers)
- **Avoid time-sensitive language** in main prose: "new", "soon", "in preview". Use admonitions/banners instead

### Inclusive Language
Replace problematic terms with inclusive alternatives:

| Avoid | Use Instead |
|-------|-------------|
| Blacklist / Whitelist | Blocklist / Safelist |
| Master / Slave | Leader / Follower or Primary / Replica |
| Insane / Sane / Crazy | Unreasonable / Reasonable |
| Killer | Very successful |
| Guys | Folks, y'all, people, humans, teammates |

### CircleCI-Specific Terminology
- The CircleCI web interface is the "web app"
- Use "CI/CD" to describe what we do
- Pipelines are **triggered**, not "run"
- Feature names are rarely capitalized (exceptions: Insights)

## Abbreviations
- **Do not use** "e.g." or "i.e."
- **Use instead**: "for example" and "that is"

## Punctuation
- **Avoid semicolons and dashes** (en or em) to split sentences. Use new sentences or commas and periods
- **Do not use ampersands (&)** as a substitute for "and" (reserved for logical AND operator)
- **No period at end** if sentence ends with URL, code sample, or command (prevents copy-paste errors)
- **Use the Oxford comma**: "Please bring me a pencil, eraser, and notebook."

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
- Use "open source" (not "opensource" or "open-source")

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
CircleCI docs use a custom icon macro for UI icons that automatically switches between light and dark theme versions.

**Syntax:**
```adoc
icon:icon-name[Alt text description]
```

**Available icons** (located in `docs/guides/modules/ROOT/images/icons/`):
- `icon:more[Ellipsis menu icon]` - Three-dot menu (ellipsis)
- `icon:edit-solid[Edit icon]` - Edit button
- `icon:delete[Trash bin icon]` - Delete/trash button
- `icon:settings[Settings icon]` - Settings button
- `icon:cancel[Cancel icon]` - Cancel button
- `icon:passed[Passed icon]` - Success/passed indicator
- `icon:warning[Warning icon]` - Warning indicator
- `icon:rebuild[Rebuild icon]` - Rebuild button
- `icon:promote[Promote icon]` - Promote button
- `icon:chunk[Chunk icon]` - Chunk feature icon
- `icon:github-app[GitHub App icon]` - GitHub App integration
- `icon:github-oauth[GitHub OAuth icon]` - GitHub OAuth integration

**Usage examples:**
```adoc
Select the icon:more[Ellipsis menu icon] to open the menu.
Click the icon:settings[Settings icon] to access project settings.
```

**Important notes:**
- Always include descriptive alt text for accessibility
- The macro automatically handles light/dark theme switching
- Each icon has a light version (`name.svg`) and dark version (`name-dark.svg`)
- Use this macro instead of the older `image:` syntax for theme-aware icons

### Headings
- Write headings in **logical sequence** that tells a story
- **Do not skip heading levels** (e.g., h2 to h4)
- Include at least an intro paragraph before subheadings
- **Use sentence case**: Only capitalize first word and proper nouns
  - **Good**: CircleCI docs style guide
  - **Bad**: CircleCI Docs Style Guide
- **Start headings with verbs** where possible:
  - **Good**: "Grooming cats"
  - **Bad**: "Cats"
- **No punctuation at end of headings** (no periods or colons)
- **Do not use inline literal text** (backticks) in headings
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
  - Capitalize all major words in the link text (nouns, verbs, adjectives, adverbs)
  - Keep articles (a, an, the), conjunctions (and, but, or), and short prepositions (in, on, at) lowercase unless they're the first word

**IMPORTANT: Always verify xrefs before using them**

Before adding any xref to a document, you must verify the target file exists and the path is correct:

```bash
# Search for the file
find docs -name "filename.adoc"

# Or use glob pattern
glob pattern: **/filename.adoc
```

Common mistakes:
- Making up file names that don't exist
- Using incorrect module names in the path
- Guessing at file locations without checking

The xref format is: `xref:component:module:filename.adoc[Link Text]`
- **component**: Usually `guides`, `reference`, `orbs`, etc.
- **module**: The module directory name (e.g., `orchestrate`, `deploy`, `toolkit`)
- **filename.adoc**: The actual file name

Example verification process:
1. Search: `glob pattern: **/deploy-markers.adoc` → finds `docs/guides/modules/deploy/pages/configure-deploy-markers.adoc`
2. Read target page title: "Configure deploy markers"
3. Build xref: Component=`guides`, Module=`deploy`, File=`configure-deploy-markers.adoc`
4. Result: `xref:guides:deploy:configure-deploy-markers.adoc[Configure Deploy Markers]` (title case)

### External Links
- Use this format:
```adoc
link:https://circleci.com[CircleCI]
```
- Links must have descriptive link text (not "click here", "here", or "this")

### Code Samples
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
- **Use unordered lists** for everything else
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

CircleCI docs use reusable partials to maintain consistency and reduce duplication. Partials are AsciiDoc snippets that can be included in multiple pages.

**When to use partials:**
- Repeated instructions that appear across multiple pages (navigation steps, setup procedures)
- Standard notes, tips, or warnings used in multiple locations
- Content that needs to stay synchronized across pages (resource tables, FAQ entries)
- Common troubleshooting steps

**When NOT to use partials:**
- Content that appears only once
- Page-specific information that would not be reused
- Content that needs different context on each page

**Include syntax:**
```adoc
include::ROOT:partial$category/filename.adoc[]
```

**Include with custom text or comment:**
```adoc
include::ROOT:partial$notes/standalone-unsupported.adoc[This feature is not supported for GitLab, GitHub App or Bitbucket Data Center]
```

**Partial categories and locations:**

All partials are located in `docs/guides/modules/ROOT/partials/`

- **app-navigation/** - Navigation instructions
  - `steps-to-project-settings.adoc` - Steps to access project settings

- **create-project/** - Project creation steps
  - `steps-up-to-pipeline.adoc` - Steps from Create Project to pipeline setup

- **execution-resources/** - Resource specifications
  - `docker-resource-table.adoc` - Docker executor resource table
  - `machine-resource-table.adoc` - Machine executor resource table
  - `macos-resource-table.adoc` - macOS executor resource table
  - `windows-resource-table.adoc` - Windows executor resource table
  - And others for ARM, GPU, and resource class views

- **faq/** - Frequently asked questions snippets
  - `general-faq-snip.adoc` - General FAQ entries
  - `orb-faq-snip.adoc` - Orb-related FAQs
  - `workflows-faq-snip.adoc` - Workflow FAQs
  - `billing-faq-snip.adoc` - Billing FAQs
  - And others for specific topics

- **notes/** - Reusable notes and warnings
  - `docker-auth.adoc` - Docker authentication note
  - `standalone-unsupported.adoc` - Feature support note (accepts custom text)
  - `find-organization-id.adoc` - How to find organization ID
  - `server-api-examples.adoc` - Server API examples note

- **orbs/** - Orb-related content
  - `orb-types.adoc` - Orb type definitions
  - `orb-type-comparison.adoc` - Orb type comparison table

- **pipelines-and-triggers/** - Pipeline setup content
  - `set-up-schedule-trigger.adoc` - Schedule trigger setup steps
  - `custom-webhook-setup.adoc` - Webhook configuration steps
  - `pipeline-values.adoc` - Pipeline values reference

- **runner/** - Self-hosted runner setup
  - `install-with-web-app-steps.adoc` - Runner installation via web app
  - `install-with-cli-steps.adoc` - Runner installation via CLI
  - `container-runner-prereq.adoc` - Container runner prerequisites
  - `terms.adoc` - Runner terminology

- **tips/** - Helpful tips and guidance
  - `check-org-type.adoc` - How to check organization type
  - `find-project-slug.adoc` - How to find project slug
  - `env-var-or-context.adoc` - When to use env vars vs contexts
  - `trigger-pipeline-with-parameters.adoc` - Pipeline parameter triggering

- **troubleshoot/** - Troubleshooting snippets
  - `orb-troubleshoot-snip.adoc` - Orb troubleshooting
  - `pipelines-troubleshoot-snip.adoc` - Pipeline troubleshooting
  - `self-hosted-runner-troubleshoot-snip.adoc` - Runner troubleshooting

- **using-expressions/** - Configuration expressions
  - `operators.adoc` - Expression operators
  - `env-vars-in-conditional-caveat.adoc` - Environment variable caveats

**Example usage:**

```adoc
== Setting up your project

include::ROOT:partial$tips/check-org-type.adoc[]

Follow these steps:

include::ROOT:partial$create-project/steps-up-to-pipeline.adoc[Steps to create project]

include::ROOT:partial$notes/docker-auth.adoc[]
```

**Creating new partials:**

When creating a new partial:
1. Determine if the content will be used in 2+ places
2. Choose the appropriate category directory
3. Use a descriptive filename ending in `.adoc`
4. For FAQ/troubleshooting snippets, use `-snip.adoc` suffix
5. Consider if the partial should accept custom text parameters
6. Test the partial in all intended locations

**Best practices:**
- Keep partials focused on a single concept or set of related steps
- Write partials to work in multiple contexts without requiring modifications
- Document partials that accept custom text parameters
- Update all pages when modifying a partial (partials affect multiple pages)
- Use meaningful filenames that describe the content

### Images
- **Always include descriptive alt text**:
```adoc
.Image Title
image::guides:ROOT:name-of-image.png[Alternative text describing the image]
```
- Images without alt text are accessibility violations
- Include title above image using `.Title` syntax

### Admonitions (Notes, Tips, Warnings)
Use these for visual separation:
- `NOTE:` - Supplementary information to highlight
- `TIP:` - Guidance on how to carry out a step
- `IMPORTANT:` - Rarely used; consider other options first
- `CAUTION:` - Reader needs to be careful
- `WARNING:` - Dangers or consequences exist

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

## Common Mistakes to Avoid

1. Passive voice constructions
2. Wordy phrases like "in order to", "at this time", "due to the fact that"
3. Hedging words like "should", "might", "perhaps" when being definitive
4. Contractions
5. Missing Oxford commas
6. Periods at end of sentences with URLs/code
7. Gender-biased language
8. Missing alt text on images
9. Links without descriptive text
10. Inline code in headings
11. More than 3 commas in a sentence
12. Sentences over 25 words (affects readability)
13. Missing page attributes (`:page-platform:`, `:page-description:`, `:experimental:`)
14. Not using appropriate page templates for new content
15. Using xrefs without verifying the target file exists and path is correct

## AsciiDoc Validation Rules
- Close all attribute blocks properly
- Use matching callouts in code blocks
- Ensure sequential numbered callouts
- Use valid admonition block syntax
- Use valid code block syntax
- Use valid table block syntax
- Close ID quotes properly

## Linting and Validation

The CircleCI docs use automated linting to enforce style rules and catch common errors. Understanding these tools helps you write docs that pass validation on the first try.

### Vale Linter

Vale is a syntax-aware linter that enforces style rules defined in the `styles/` directory. It checks for grammar, style violations, and CircleCI-specific conventions.

**Key automated rules:**

- **Character limits**:
  - `:page-description:` must be 70-160 characters
  - Sentences should not exceed 25 words (readability)
  - Headings have length limits

- **Capitalization**:
  - Link text in xrefs must use title case (e.g., "Schedule Triggers" not "schedule triggers")
  - Headings must use sentence case (only first word and proper nouns capitalized)

- **Forbidden/problematic terms**:
  - Avoid "master/slave" → use "primary/replica" or "leader/follower"
  - Avoid "blacklist/whitelist" → use "blocklist/safelist"
  - Avoid "easy", "easily", "simply", "just" (assumes complexity)
  - No contractions (don't, can't, won't, etc.)

- **Style violations**:
  - More than 3 commas in a sentence
  - Passive voice constructions
  - Missing periods on full sentences in lists

**Running Vale locally:**

```bash
# Check a specific file
vale docs/guides/modules/toolkit/pages/your-file.adoc

# Check all files in a directory
vale docs/guides/modules/toolkit/pages/

# Check staged files before commit
git diff --cached --name-only | grep '.adoc$' | xargs vale
```

**Vale configuration location:**
- Main config: `.vale.ini`
- Style rules: `styles/` directory
- Custom CircleCI rules: `styles/CircleCI/`

**Common Vale errors and fixes:**

| Error | Fix |
|-------|-----|
| `CircleCI.TitleCase` | Use title case in link text: "Schedule Triggers" |
| `CircleCI.SentenceLength` | Break long sentences (25+ words) into shorter ones |
| `CircleCI.Description` | Shorten `:page-description:` to 160 characters or less |
| `Vale.Spelling` | Check spelling or add to custom dictionary |
| `CircleCI.Contractions` | Expand contractions: "don't" → "do not" |

### AsciiDoc Validation

In addition to Vale, the build process validates AsciiDoc syntax:
- Broken xrefs (links to non-existent pages)
- Unlisted pages (pages not in `nav.adoc`)
- Invalid attribute syntax
- Malformed code blocks or tables

**Running validation locally:**

```bash
# Preview with local dev server (shows validation warnings)
npm run start:dev

# Full build (catches all errors)
npm run build:docs
```

### Pre-commit Checklist

Before committing documentation changes:

1. ✅ Run Vale on your files to catch style violations
2. ✅ Preview locally to check formatting and links
3. ✅ Verify all xrefs point to existing files
4. ✅ Check `:page-description:` is 70-160 characters
5. ✅ Ensure link text uses title case
6. ✅ Confirm page is added to `nav.adoc` if new

## Documentation Architecture

### Component Structure

The CircleCI docs use Antora's component-based architecture:

**When to use each component:**

- **Root**: Landing page and site home
- **Guides**: Tutorial and how-to content for end users
- **Reference**: Technical reference material (config, API, CLI)
- **Orbs**: Orb-related documentation
- **Server Admin**: Self-hosted server docs (versioned by release)
- **Services**: Service-specific documentation
- **Contributors**: Meta-documentation for contributors

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

**Required attributes:**

```adoc
= Page Title
:page-platform: Cloud, Server v4+
:page-description: A brief description for SEO and metadata (70-160 characters)
:experimental:
```

**Attribute descriptions:**

- `:page-platform:` - Indicates which CircleCI platforms support the feature. Displays as badges under the page title.
  - Options: `Cloud`, `Server v4+`, `Server v3`, or combinations like `Cloud, Server v4+`
  - If feature is Cloud-only, use `:page-platform: Cloud`
  - If feature is available on all platforms, use `:page-platform: Cloud, Server v4+`

- `:page-description:` - Used for SEO meta descriptions and page previews
  - **Must be between 70-160 characters** (Vale enforced)
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

## Answering User Questions About CircleCI

This file focuses on **how to write documentation**. When users ask questions **about using CircleCI** (not about writing docs), you should:

### Reference the llms.txt File
The `llms.txt` file (available at https://circleci.com/docs/llms.txt) contains:
- CircleCI product overview and features
- Documentation structure and navigation
- Content areas (Guides, Reference, Orbs, Server Admin)
- Common URL patterns and documentation locations

### Two Different Use Cases

**Use Case 1: User asks about CircleCI features**
- Example: "How do I cache dependencies in CircleCI?"
- Example: "What executors does CircleCI support?"
- Example: "How do I set up GitHub integration?"
- **Action**: Reference `llms.txt` to understand documentation structure, then locate and explain relevant content
- **Voice**: Use the same active, direct, accessible voice described in this guide

**Use Case 2: User asks to create/edit documentation**
- Example: "Add a new guide about Docker caching"
- Example: "Update the environment variables page"
- Example: "Fix the formatting in this AsciiDoc file"
- **Action**: Use this file (`claude.md`) for writing style, voice, and formatting rules
- Also reference `llms.txt` to understand where content fits in the overall structure

### Explaining CircleCI Concepts
When answering questions about CircleCI features:
- Apply the same voice and style rules from this guide (active voice, direct language, no jargon)
- Break down complex concepts into simple explanations
- Provide practical, actionable guidance
- Link to relevant documentation sections using the URL patterns in `llms.txt`
- Use correct CircleCI terminology (pipelines are "triggered", web interface is "web app", etc.)

### Example Scenarios

**Question**: "How do I cache npm dependencies?"
- Reference `llms.txt` to find caching is in the Guides > Optimize section
- Explain the concept using active voice and clear language
- Point to: https://circleci.com/docs/guides/optimize/caching-strategies/
- Provide practical code examples if helpful

**Question**: "Add a troubleshooting section about cache misses"
- Use `claude.md` (this file) for writing style
- Use `llms.txt` to determine this fits in Reference > General > Troubleshooting
- Follow all formatting, voice, and style guidelines when creating content

## When Editing Existing Documentation
- Follow these guidelines for new content
- When touching existing sections, update them to meet current standards
- Help maintain consistency across the documentation
