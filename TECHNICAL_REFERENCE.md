# CircleCI Docs Static Site: Technical Reference

This technical reference provides detailed information about the CircleCI Docs Static Site's components, configuration options, and integration points.

## Table of Contents
- [Antora Configuration](#antora-configuration)
- [Gulp Tasks](#gulp-tasks)
- [UI Components](#ui-components)
- [Extensions API](#extensions-api)
- [Content Component Reference](#content-component-reference)
- [Script Reference](#script-reference)
- [Environment Variables](#environment-variables)
- [Build Output](#build-output)

## Antora Configuration

### Antora Playbook

The `antora-playbook.yml` file is the primary configuration file for the Antora site generator. It defines how components are loaded, processed, and assembled.

#### Site Configuration

```yaml
site:
  title: CircleCI Documentation
  url: https://circleci.com/docs
  robots: allow
```

- **`title`**: The title displayed on the website
- **`url`**: The production URL of the site
- **`robots`**: Controls the robots.txt file (allow/disallow)

#### Content Sources

```yaml
content:
  sources:
  - url: .
    start_path: docs/root
  - url: .
    start_path: docs/guides
  # Additional components...
```

- **`url`**: The repository URL (`.` for local repository)
- **`start_path`**: The path to the component in the repository
- **`branches`**: Optional list of branches to include
- **`tags`**: Optional list of tags to include

#### UI Configuration

```yaml
ui:
  bundle:
    url: ./ui-bundle.zip
```

- **`url`**: The path or URL to the UI bundle

#### Output Configuration

```yaml
output:
  dir: ./build
  clean: true
  destinations:
  - provider: fs
```

- **`dir`**: Output directory for the generated site
- **`clean`**: Whether to clean the output directory before building
- **`destinations`**: List of output destinations

#### AsciiDoc Configuration

```yaml
asciidoc:
  attributes:
    serverversion4: 4.0.6
    # Additional attributes...
  extensions:
  - '@asciidoctor/tabs'
  # Additional extensions...
```

- **`attributes`**: AsciiDoc attributes available to all pages
- **`extensions`**: AsciiDoc extensions to enable

### Component Configuration

Each component has an `antora.yml` file with the following structure:

```yaml
name: guides
title: Guides
version: ~
nav:
- modules/ROOT/nav.adoc
start_page: getting-started:first-steps.adoc
```

- **`name`**: Component name (used in URLs and xrefs)
- **`title`**: Display name for the component
- **`version`**: Version identifier (~ for unversioned)
- **`nav`**: List of navigation files
- **`start_page`**: Default landing page for the component

## Gulp Tasks

The project uses Gulp for task automation. Here's a reference of the main tasks:

### Main Tasks

| Task | Command | Description |
|------|---------|-------------|
| Build UI | `gulp build:ui` | Builds the UI bundle |
| Build Site | `gulp build:docs` | Builds the complete site |
| Preview Docs | `gulp preview:docs` | Starts a server for docs preview |
| Preview UI | `gulp preview:ui` | Starts a server for UI preview |

### Task Implementations

#### Build UI Task (`gulp.d/tasks/build-ui.js`)

This task:
1. Cleans previous UI bundle
2. Installs UI dependencies if needed
3. Runs the UI build process
4. Copies the resulting bundle to the project root

#### Build Site Task (`gulp.d/tasks/build-site.js`)

This task:
1. Ensures the UI bundle exists
2. Runs Antora with the configured playbook
3. Processes the output for any additional tasks

#### Preview Tasks

These tasks:
1. Start a local server
2. Watch for changes to relevant files
3. Trigger rebuilds when changes are detected
4. Reload the browser to show changes

## UI Components

### Directory Structure

The UI project is organized as follows:

```
ui/
├── src/
│   ├── css/            # CSS styles
│   │   ├── base.css    # Base styles
│   │   ├── site.css    # Site-specific styles
│   │   └── ...         # Component styles
│   ├── helpers/        # Handlebars helpers
│   ├── img/            # Images
│   ├── js/             # JavaScript
│   │   ├── vendor/     # Third-party scripts
│   │   └── site.js     # Main site script
│   ├── layouts/        # Page layouts
│   └── partials/       # Reusable template parts
│       ├── header.hbs  # Site header
│       ├── footer.hbs  # Site footer
│       └── ...         # Other partials
```

### Handlebars Templates

The UI uses Handlebars for HTML templating. The main templates are:

- **`layouts/default.hbs`**: Default page layout
- **`partials/header.hbs`**: Site header
- **`partials/footer.hbs`**: Site footer
- **`partials/nav.hbs`**: Navigation sidebar

### Available Variables

Templates have access to these variables:

| Variable | Description |
|----------|-------------|
| `site` | Site-wide configuration |
| `page` | Current page information |
| `content` | Page content |
| `navigation` | Navigation structure |
| `components` | List of all components |
| `uiRootPath` | Path to UI assets |

### CSS Framework

The UI uses Tailwind CSS with custom components. Key concepts:

- **Utility-first**: Uses utility classes for most styling
- **Component extraction**: Common patterns extracted into components
- **Responsive design**: Mobile-first approach with breakpoints

### JavaScript Architecture

The JavaScript is organized into modular components:

- **Core modules**: Basic functionality (navigation, search)
- **Page-specific modules**: Functionality for specific page types
- **Utilities**: Helper functions

## Extensions API

### Creating Extensions

Custom extensions follow this pattern:

```javascript
module.exports.register = function (registry, context) {
  registry.blockProcessor('myblock', function () {
    // Extension logic
  })
}
```

### Available Extension Points

Antora provides these extension points:

- **Block processors**: Process custom blocks
- **Inline processors**: Process inline content
- **Tree processors**: Modify the document AST
- **Postprocessors**: Work with the final document

### Extension Context

Extensions have access to:

- **`contentCatalog`**: All content pages
- **`siteCatalog`**: Site structure information
- **`playbook`**: Antora playbook configuration

## Content Component Reference

### Component Structure

Each component should adhere to this structure:

```
component-name/
├── antora.yml
└── modules/
    ├── ROOT/
    │   ├── nav.adoc
    │   ├── pages/
    │   │   ├── index.adoc
    │   │   └── ...
    │   ├── partials/
    │   └── assets/
    │       └── images/
    └── [module-name]/
        └── ...
```

### Required Files

Each component must have:

- **`antora.yml`**: Component configuration
- **`modules/ROOT/nav.adoc`**: Main navigation file
- **`modules/ROOT/pages/index.adoc`**: Landing page

### Optional Files

Components may include:

- **`modules/*/partials/*.adoc`**: Reusable content
- **`modules/*/examples/*`**: Example files
- **`modules/*/assets/images/*`**: Image files
- **`modules/*/attachments/*`**: Downloadable files

## Script Reference

### Content Migration Scripts

| Script | Description |
|--------|-------------|
| `convert_frontmatter.py` | Converts YAML frontmatter to AsciiDoc attributes |
| `convert_tabs.py` | Converts HTML tabs to AsciiDoc tabs |
| `update_image_blocks.py` | Updates image block syntax |

### Maintenance Scripts

| Script | Description |
|--------|-------------|
| `fetch-server-branches.sh` | Fetches server version branches |
| `gen-git-last-update-meta.sh` | Generates last update metadata |
| `update-xrefs.py` | Updates cross-references |

### Using the Scripts

Most scripts can be run directly:

```bash
python scripts/convert_frontmatter.py path/to/file.adoc
```

Or through npm scripts defined in `package.json`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FORCE_NPM_INSTALL` | Force reinstallation of UI dependencies | `false` |
| `LIVERELOAD` | Enable live reload for preview | `true` |
| `ALGOLIA_APP_ID` | Algolia search app ID | - |
| `ALGOLIA_API_KEY` | Algolia search API key | - |
| `ALGOLIA_INDEX_NAME` | Algolia search index name | - |
| `SEGMENT_WRITE_KEY` | Segment write key for analytics | - |
| `NODE_ENV` | Node environment | `development` |

## Build Output

The build process generates output in the `build/` directory with this structure:

```
build/
├── 404.html                 # Not found page
├── index.html               # Site landing page
├── sitemap.xml              # Site map for search engines
├── robots.txt               # Robots control file
├── _/                       # UI assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript
│   ├── font/                # Fonts
│   └── img/                 # Images
└── component-name/          # Component output
    ├── index.html           # Component landing page
    ├── page-name/           # Directories for pages
    │   └── index.html       # Page output
    └── _images/             # Component images
```

### Asset Organization

- **UI assets**: Stored in the `_/` directory
- **Component assets**: Stored in component-specific directories
- **Images**: Stored in `_images/` directories
- **Attachments**: Stored in `_attachments/` directories

### Output URLs

The URL structure follows this pattern:

- **Component page**: `/component-name/page-name.html`
- **Module page**: `/component-name/module-name/page-name.html`
- **Image**: `/component-name/_images/image-name.png`
- **Attachment**: `/component-name/_attachments/file-name.ext`

### Optimizations

The build process includes these optimizations:

- **CSS minification**: Reduces stylesheet size
- **JavaScript bundling**: Combines and minifies scripts
- **Image optimization**: Compresses images
- **HTML compression**: Reduces HTML size
