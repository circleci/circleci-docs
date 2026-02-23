# CircleCI Documentation Style Guide for Claude Code

This guide provides style, voice, and formatting rules for creating and editing CircleCI documentation. Follow these guidelines when working on AsciiDoc content in the docs directory.

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
  - Select **Organization Settings** from the sidebar
  - Click **Set Up Project**
- **Use italics** for commonly understood technical concepts (not CircleCI features):
  - _Continuous Integration_
  - _Concurrency_
  - _Parallelism_

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
  - **Good**: Refer to the xref:guides:security:set-environment-variable.adoc[Setting an environment variable in a project] section
  - **Bad**: For more information head xref:guides:security:set-environment-variable.adoc[here]

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

## AsciiDoc Validation Rules
- Close all attribute blocks properly
- Use matching callouts in code blocks
- Ensure sequential numbered callouts
- Use valid admonition block syntax
- Use valid code block syntax
- Use valid table block syntax
- Close ID quotes properly

## Answering User Questions About CircleCI

This file focuses on **how to write documentation**. When users ask questions **about using CircleCI** (not about writing docs), you should:

### Reference the llms.txt File
The `llms.txt` file in the project root contains:
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
