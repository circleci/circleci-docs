# CircleCI docs content authoring guide

This guide provides comprehensive information for authors contributing content to the CircleCI docs site.

## Table of Contents
- [Content Organization](#content-organization)
- [AsciiDoc Essentials](#asciidoc-essentials)
- [Document Structure](#document-structure)
- [Advanced Formatting](#advanced-formatting)
- [Navigation and Cross-References](#navigation-and-cross-references)
- [Working with Media](#working-with-media)
- [Semantic Guidelines](#semantic-guidelines)
- [Review Process](#review-process)

## Content Organization

The CircleCI documentation is organized into logical components, each focusing on a specific area:

| Component | Description | Path |
|-----------|-------------|------|
| `root` | Home and landing pages | `docs/root/` |
| `guides` | How-to guides and tutorials | `docs/guides/` |
| `reference` | API and configuration references | `docs/reference/` |
| `orbs` | CircleCI orbs documentation | `docs/orbs/` |
| `server-admin` | Server administration guides | `docs/server-admin-4.*/` |
| `contributors` | Contributor guidelines | `docs/contributors/` |

### File Organization

Within each component, content follows this structure:

```
component/
├── antora.yml            # Component metadata and configuration
└── modules/
    ├── ROOT/             # Default module
    │   ├── nav.adoc      # Navigation file for the module
    │   ├── pages/        # Content pages as AsciiDoc files
    │   │   └── index.adoc # Landing page for this module
    │   ├── partials/     # Reusable content fragments
    │   ├── examples/     # Code examples
    │   └── assets/       # Images and other assets
    │       └── images/   # Image files
    └── [module-name]/    # Additional modules if needed
        └── ...
```

## AsciiDoc Essentials

The CircleCI docs site uses [AsciiDoc](https://asciidoc.org/) for content authoring. Here's how to use it effectively:

### Basic Syntax

```asciidoc
= Page Title
:page-description: A brief description of the page content

== Section Heading
This is a paragraph of text.

=== Subsection Heading
Another paragraph with *bold text* and _italic text_.

* Bulleted list item 1
* Bulleted list item 2
** Nested list item

. Numbered list item 1
. Numbered list item 2
.. Nested numbered item
```

For a more complete example, see the [template pages](https://github.com/circleci/circleci-docs/tree/main/docs/contributors/modules/templates/pages).

### Document Attributes

Document attributes control various aspects of rendering:

```asciidoc
= Page Title
:page-platform: Cloud, Server     # Displays platform badges in the page info bar
:page-description: Used for SEO and meta description
:experimental:                    # Enables macro features for menu and button macros
:page-aliases: some-old-page.adoc # redirects archived pages

```

### Page Title Badges

Add visual badges next to page titles to indicate content status. Currently we are using a `Preview` badge to indicate when a page is for a feature in open or closed preview.

A page is closed preview will display the `Preview` badge and **will not be** listed in the navigation.
A page in open preview will display the `Preview` badge and **will be** listed in the navigation.

#### Basic Usage

```asciidoc
= Page Title
:page-badge: Preview
```

This displays a simple badge with default styling (black text, border, no background).

#### Custom Styling with Tailwind Classes

```asciidoc
= Page Title
:page-badge: Preview
:page-badge-classes: text-white bg-orange-500 border border-orange-600
```

#### Custom Colors with Hex Values

```asciidoc
= Page Title
:page-badge: Preview
:page-badge-bg: #FF6B35
:page-badge-border: #C44D2C
:page-badge-classes: text-white
```

#### Common Badge Styles

**Preview:**
```asciidoc
:page-badge: Preview
```

Currently we are not adding styling to these badges but this may change in future.

#### Badge Attributes Reference

- **`:page-badge:`** - The text to display in the badge (required)
- **`:page-badge-classes:`** - Tailwind CSS classes for styling (optional, defaults to `text-terminal-black border`)
- **`:page-badge-bg:`** - Hex color code for background (optional, overrides classes)
- **`:page-badge-border:`** - Hex color code for border (optional, requires `page-badge-bg`)

### Admonitions

Use admonitions to call attention to important information:

```asciidoc
NOTE: This is a note admonition.

TIP: This provides helpful advice.

IMPORTANT: This is important information.

WARNING: This is a warning.

CAUTION: This requires special attention.
```

## Document Structure

### Page Structure Template

Use the [template pages](https://github.com/circleci/circleci-docs/tree/main/docs/contributors/modules/templates/pages) as a starting point for new content.


### Headings

Use hierarchical headings to structure your content:

```asciidoc
= Level 0 (Page Title)
== Level 1
=== Level 2
==== Level 3
```

Avoid skipping levels, and don't go deeper than level 4 unless absolutely necessary.

## Advanced Formatting

### Code Blocks

For code blocks with syntax highlighting:

```asciidoc
.Title for code block, explain what it is and what it does
[source,yaml]
----
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm install
      - run: npm test
----
```

### Tables

Create formatted tables that can scroll horizontally as needed:

```asciidoc
[.table-scroll]
--
.Table Title
[cols="1,1,2", options="header"]
|===
|Column 1 |Column 2 |Column 3

|Row 1, Cell 1
|Row 1, Cell 2
|Row 1, Cell 3

|Row 2, Cell 1
|Row 2, Cell 2
|Row 2, Cell 3
|===
--
```

### Tabs

Use tabs for showing different options:

```asciidoc
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

### Collapsible Sections

**We do not currently use collapsible sections.**

For long content that might be hidden initially:

```asciidoc
.Click to expand
[%collapsible]
====
This content is initially collapsed but can be expanded by clicking.
====
```

## Navigation and Cross-References

### Internal Cross-References

Link to other pages within the documentation:

```asciidoc
xref:page-name.adoc[Link Text]
```

To link to a page in another module in the same component:

```asciidoc
xref:module-name:page-name.adoc[Link Text]
```

To link to another component:

```asciidoc
xref:component-name:module-name:page-name.adoc[Link Text]
```

To link to a specific section:

```asciidoc
xref:page-name.adoc#section-id[Link Text]
```

### External Links

Link to external resources:

```asciidoc
link:https://circleci.com[CircleCI Website]
```

The `link:` is not strictly necessary but makes it easier to find when editing or making bulk changes.

### Navigation Files

The `nav.adoc` file defines the sidebar navigation structure:

```asciidoc
* xref:index.adoc[Getting Started]
** xref:installation.adoc[Installation]
*** xref:requirements.adoc[System Requirements]
** xref:configuration.adoc[Configuration]
* xref:advanced.adoc[Advanced Topics]
```

## Working with Media

### Images

Include images with optional attributes:

```asciidoc
.Image title
image::filename.png[Alt Text,width=500,role=center]
```

Place image files in the `modules/ROOT/assets/images/` directory.

### Videos

Embed videos using the block image macro with a link:

```asciidoc
.Video Title
video::video-id[youtube,width=640,height=360]
```

### Diagrams

You can add mermaid diagrams to a page, as follows:

```asciidoc
.Example of a mermaid diagram
[mermaid]
....
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
....
```

## Semantic Guidelines

### Writing Style

- Use clear, concise language
- Address the reader directly using "you"
- Use present tense whenever possible
- Break complex ideas into simple steps
- Use active voice instead of passive voice

### Documentation Types

Structure your content based on its purpose:

1. **Tutorials**: Learning-oriented, helping new users get started
2. **How-to Guides**: Task-oriented, solving specific problems
3. **Technical Reference**: Information-oriented, providing detailed specifications
4. **Explanations**: Understanding-oriented, explaining concepts

### Versioning Content

For version-specific content, use negative conditional statements ([ifndef directive](https://docs.asciidoctor.org/asciidoc/latest/directives/ifdef-ifndef/)) :

```asciidoc
ifndef::aws
This content is only visible for non-AWS pages and sections
endif::[]
```

## Review Process

### Self-Review Checklist

Before submitting content for review, check that:

- [ ] The document follows the structure guidelines
- [ ] All cross-references work correctly
- [ ] Code examples are correct and tested
- [ ] Images are optimized and have alt text
- [ ] No spelling or grammatical errors
- [ ] Content is technically accurate
- [ ] Navigation entries are correctly formatted

### Peer Review

All content should go through peer review:

1. Create a pull request with your changes. Code ownders will be pinged for review automatically (docs team and PM team).
2. Request review from subject matter experts, for most changes we will want a review from an engineer in the relevant team or the PM for the feature. The docs team can manage this process for you.
3. Address any feedback or suggestions.
4. Update based on technical accuracy review.
5. Final editorial review for consistency and style.