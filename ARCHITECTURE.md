# CircleCI Docs Static Site: Architecture

This document provides an in-depth look at the architecture of the CircleCI Docs Static Site project.

## Table of Contents
- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [Content Organization](#content-organization)
- [Build Pipeline](#build-pipeline)
- [UI Framework](#ui-framework)
- [Extension Mechanisms](#extension-mechanisms)

## Overview

The CircleCI Docs Static Site is built using [Antora](https://antora.org/), a multi-repository documentation site generator. The project is structured as a collection of components, each represented by a directory in the `docs/` folder.

### Key Architectural Principles

1. **Component-based Organization**: Documentation is divided into logical components
2. **Separation of Content and Presentation**: Content in AsciiDoc format, presentation handled by UI bundle
3. **Modular Build Process**: Separate processes for building UI and content
4. **Extensibility**: Custom extensions for specialized functionality

## Component Architecture

### Main Components

1. **Documentation Content (`docs/`)**
   - Contains all documentation content organized as Antora components
   - Each component has its own configuration, navigation, and pages

2. **UI Bundle (`ui/`)**
   - Custom UI theme based on Antora's default UI
   - Uses Gulp as build system
   - Outputs `ui-bundle.zip` for use by Antora

3. **Build System (`gulp.d/`)**
   - Gulp tasks for building and serving the documentation
   - Handles watching for changes and live reload

4. **Extensions (`extensions/`)**
   - Custom Antora extensions for specialized functionality
   - Handles content export and page metadata

5. **Utility Scripts (`scripts/`)**
   - Helper scripts for various maintenance tasks
   - Tools for content migration and maintenance

## Content Organization

The documentation content is organized into components, each with its own directory structure:

```
docs/
├── component-1/
│   ├── antora.yml           # Component configuration
│   └── modules/
│       ├── ROOT/            # Default module
│       │   ├── nav.adoc     # Navigation
│       │   ├── pages/       # Content pages
│       │   ├── partials/    # Reusable fragments
│       │   ├── examples/    # Code examples
│       │   └── assets/      # Images and attachments
│       └── module-2/        # Additional module
│           └── ...
├── component-2/
│   └── ...
└── ...
```

### Component Configuration

Each component has an `antora.yml` file that defines:

- Component name and title
- Version information
- Navigation sources
- Start page

Example:
```yaml
name: guides
title: Guides
version: ~
nav:
- modules/ROOT/nav.adoc
start_page: getting-started:first-steps.adoc
```

### Navigation Structure

Navigation is defined in `nav.adoc` files using AsciiDoc cross-references:

```asciidoc
* xref:index.adoc[Introduction]
** xref:getting-started.adoc[Getting Started]
*** xref:installation.adoc[Installation]
```

This creates a hierarchical navigation structure that renders as a sidebar.

## Build Pipeline

The build pipeline consists of several stages, orchestrated by Gulp tasks:

1. **UI Bundle Build**
   - Processes UI source files (CSS, JS, Handlebars templates)
   - Applies optimizations (minification, bundling)
   - Packages into `ui-bundle.zip`

2. **Content Processing**
   - Loads component configurations
   - Processes AsciiDoc content
   - Applies extensions
   - Generates HTML pages

3. **Site Assembly**
   - Combines UI bundle with processed content
   - Copies assets (images, attachments)
   - Generates navigation and cross-references

4. **Output**
   - Writes final site to `build/` directory
   - Optionally serves locally for development

## UI Framework

The UI is built on Antora's default UI with custom modifications:

- **Templating**: Handlebars for HTML templates
- **Styling**: Custom CSS with Tailwind CSS framework
- **JavaScript**: Modular JavaScript for interactive features
- **Build System**: Gulp for processing and bundling

### Key UI Components

- **Page Templates**: Define the structure of different page types
- **Navigation**: Sidebar, breadcrumbs, and page navigation
- **Search**: Integration with Algolia search
- **Theme**: Custom styling and branding

## Extension Mechanisms

The project uses custom extensions to enhance Antora's core functionality:

1. **Content Export Extension**
   - Exports content in various formats
   - Enables integration with external systems (like Algolia)

2. **Page Metadata Extension**
   - Adds custom metadata to pages
   - Used last update date, link to commit and additional features

### Extending the Project

To add custom functionality:

1. Create a new extension in the `extensions/` directory
2. Register the extension in `antora-playbook.yml`
3. Access the extension through Antora's API

For UI customization:

1. Modify files in `ui/src/`
2. Rebuild the UI bundle with `npm run build:ui`
3. Rebuild the site with `npm run build:docs`
