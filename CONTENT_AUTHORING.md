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
| `guides` | Feature and usage docs, how-to guides and tutorials | `docs/guides/` |
| `reference` | API and configuration references | `docs/reference/` |
| `orbs` | CircleCI orbs documentation | `docs/orbs/` |
| `server-admin` | Server administration guides | `docs/server-admin-4.*/` |
| `services` | Field engineering service information | `docs/services` |
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

The CircleCI docs site uses [AsciiDoc](https://asciidoc.org/) for content authoring. For a guide to using AsciiDoc and writing to follow the CircleCI docs style, see the following pages:

* [Style guide](https://circleci.com/docs/contributors/docs-style/)
* [Template pages](https://github.com/circleci/circleci-docs/tree/main/docs/contributors/modules/templates/pages)

## Navigation Files

The `nav.adoc` file defines the sidebar navigation structure:

```asciidoc
* xref:index.adoc[Getting Started]
** xref:installation.adoc[Installation]
*** xref:requirements.adoc[System Requirements]
** xref:configuration.adoc[Configuration]
* xref:advanced.adoc[Advanced Topics]
```

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