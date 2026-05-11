# CircleCI docs site: Development Guide

This document provides comprehensive guidance for developers working on the CircleCI docs site.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Content Authoring](#content-authoring)
- [UI Customization](#ui-customization)
- [Advanced Development Tasks](#advanced-development-tasks)
- [Testing](#testing)
- [Common Issues and Solutions](#common-issues-and-solutions)

## Development Environment Setup

### Prerequisites

- **Node.js**: v22 or later
- **npm**: v8 or later
- **Git**: Latest version recommended

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/circleci/circleci-docs.git
   cd circleci-docs
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```
   This uses the `package-lock.json` to ensure consistent installations.

3. **Environment variables**:
   The project uses `dotenvx` to manage environment variables. Create a `.env` file in the project root with any necessary environment variables. (a .env.copy is provided)

### Editor Configuration

For optimal developer experience, configure your editor with:

- **AsciiDoc Extension**: For editing `.adoc` files
- **ESLint**: For JavaScript linting
- **Prettier**: For code formatting

## Development Workflow

### Starting the Development Server

Run the development server to preview changes locally:

```bash
npm run start:dev
```

This command:
1. Builds the UI bundle if necessary
2. Starts a local server with live reload
3. Watches for changes and rebuilds automatically

The site will be available at `http://localhost:3000` by default.

### Development Commands

- **Start development server**:
  ```bash
  npm run start:dev
  ```

- **Preview UI changes**:
  ```bash
  npm run preview:ui
  ```
  This focuses on UI development with faster rebuilds.

- **Build UI bundle only**:
  ```bash
  npm run build:ui
  ```

- **Build complete site**:
  ```bash
  npm run build:docs
  ```

#### Markdown Export

The site includes a markdown export feature that generates downloadable `.md` versions of all documentation pages. This feature is optimized for different environments:

- **Local development** (default): Markdown generation is **disabled** for faster rebuilds
- **CI/production**: Markdown generation is **enabled automatically** when `CI=true` is set
- **Manual override**: Set `ENABLE_MARKDOWN_EXPORT=true` to enable or disable explicitly

**To preview markdown export locally**:
```bash
ENABLE_MARKDOWN_EXPORT=true npm run start:dev
```

**To build without markdown (faster local builds)**:
```bash
npm run build:docs
```

**Note**: Generating markdown files processes all 563+ pages and adds significant time to each rebuild. Keep it disabled during active development and enable only when you need to test the download functionality.


### Branch Strategy

- `main` - Production-ready code
- Feature branches - Named according to the feature being developed

## Content Authoring

### Content Structure

Documentation is organized as Antora components:

```
docs/
├── component-name/
│   ├── antora.yml           # Component configuration
│   └── modules/
│       ├── ROOT/            # Default module
│       │   ├── nav.adoc     # Navigation
│       │   ├── pages/       # Content pages
│       │   └── ...
```

### Creating New Content

1. **Create a new page**:
   Add an AsciiDoc file in the appropriate `pages/` directory.

   Example (`docs/guides/modules/getting-started/pages/new-feature.adoc`):
   ```asciidoc
   = New Feature Guide
   :description: How to use the new feature
   :page-toclevels: 3

   == Introduction
   This guide explains how to use the new feature.

   == Steps
   1. First step
   2. Second step
   ```

2. **Update navigation**:
   Add an entry to the appropriate `nav.adoc` file.

   Example:
   ```asciidoc
   * xref:index.adoc[Getting Started]
   ** xref:installation.adoc[Installation]
   ** xref:new-feature.adoc[New Feature Guide]
   ```

3. **Add images and attachments**:
   Place images in the `assets/images/` directory of the module.

   Reference them using:
   ```asciidoc
   image::image-name.png[Alt text]
   ```

### AsciiDoc Guidelines

- Use headings (`=`, `==`, `===`) for document structure
- Include a document title and description
- Use AsciiDoc features like:
  - Lists (`*` for bullets, `.` for numbered)
  - Code blocks (indented with 4 spaces)
  - Admonitions (`NOTE:`, `TIP:`, `IMPORTANT:`, `WARNING:`, `CAUTION:`)
  - Tables
  - Cross-references (`xref:`)

### Using Tabs

The documentation supports tabbed content using the `@asciidoctor/tabs` extension:

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

## UI Customization

### UI Directory Structure

The UI project is located in the `ui/` directory:

```
ui/
├── src/
│   ├── css/            # CSS styles
│   ├── helpers/        # Handlebars helpers
│   ├── img/            # Images
│   ├── js/             # JavaScript
│   ├── layouts/        # Page layouts
│   └── partials/       # Reusable template parts
├── gulpfile.js         # UI build configuration
├── package.json        # UI dependencies
└── tailwind.config.js  # Tailwind CSS configuration
```

### Making UI Changes

1. **Modify UI files**:
   Edit files in the `ui/src/` directory.

2. **Build UI bundle**:
   ```bash
   npm run build:ui
   ```

3. **Preview changes**:
   ```bash
   npm run preview:ui
   ```

### CSS Customization

The UI uses Tailwind CSS for styling:

1. **Add or modify styles**:
   Edit files in `ui/src/css/`

2. **Customize Tailwind**:
   Modify `ui/tailwind.config.js`

3. **Add custom components**:
   Create new CSS files in `ui/src/css/` and import them in the main CSS file

### JavaScript Customization

1. **Add or modify scripts**:
   Edit files in `ui/src/js/`

2. **Bundle structure**:
   The main JavaScript bundle is `ui/src/js/site.js`

3. **Add new features**:
   Create new JavaScript files and import them in the main bundle

## Advanced Development Tasks

### Creating a New Component

1. **Create component directory**:
   ```bash
   mkdir -p docs/new-component/modules/ROOT/{pages,partials,examples,attachments}
   ```

2. **Create component configuration**:
   Create `docs/new-component/antora.yml`:
   ```yaml
   name: new-component
   title: New Component
   version: ~
   nav:
   - modules/ROOT/nav.adoc
   ```

3. **Create navigation file**:
   Create `docs/new-component/modules/ROOT/nav.adoc`:
   ```asciidoc
   * xref:index.adoc[Introduction]
   ```

4. **Create index page**:
   Create `docs/new-component/modules/ROOT/pages/index.adoc`

5. **Add to Antora playbook**:
   Add an entry to `antora-playbook.yml`:
   ```yaml
   content:
     sources:
     # existing entries...
     - url: .
       start_path: docs/new-component
   ```

### Custom Extensions

To create a custom extension:

1. **Create extension file**:
   Create a file in the `extensions/` directory

2. **Implement the extension**:
   ```javascript
   module.exports.register = function (registry, context) {
     // Extension code here
   }
   ```

3. **Register in Antora playbook**:
   Add to `antora-playbook.yml`:
   ```yaml
   asciidoc:
     extensions:
     - ./extensions/your-extension.js
   ```

#### Existing Extensions

The project includes several custom extensions:

- **`page-metadata-extension.js`**: Adds metadata to pages (reading time, last updated, etc.)
  - Registered in: `antora-playbook.yml` and command line
- **`export-content-extension.js`**: Exports content for search indexing
  - Registered in: command line only
- **`markdown-export-extension.js`**: Generates downloadable markdown versions of all pages
  - Converts HTML to markdown using Turndown
  - Preserves code blocks with syntax highlighting
  - Converts relative links to absolute URLs
  - **Registered in: command line only** (conditionally based on environment)
  - Enabled automatically in CI, disabled in local development by default
  - See [Markdown Export](#markdown-export) section for configuration
  - Processes 563+ pages, adding significant build time

## Testing

### Testing Content Changes

1. **Preview locally**:
   Run the development server and verify content displays correctly

2. **Check for broken links**:
   Review console output for link validation warnings

3. **Verify cross-references**:
   Ensure all `xref:` links resolve correctly

### Testing UI Changes

1. **Browser compatibility**:
   Test changes in multiple browsers

2. **Responsive design**:
   Verify layouts work on different screen sizes

3. **JavaScript functionality**:
   Ensure interactive features work as expected

## Common Issues and Solutions

### UI Bundle Issues

**Problem**: UI bundle fails to build
**Solution**:
```bash
# Clean UI directory and rebuild
rm -rf ui/build ui/node_modules
rm ui-bundle.zip
npm run build:ui
```

### Navigation Problems

**Problem**: Pages don't appear in navigation
**Solution**:
- Verify `nav.adoc` entries use correct `xref:` syntax
- Ensure page files exist at the referenced locations
- Check component configuration in `antora.yml`

### Content Not Updating

**Problem**: Changes don't appear after rebuilding
**Solution**:
- Clear your browser cache
- Restart the development server
- Check for AsciiDoc syntax errors
- Verify file path and structure

### Slow Rebuilds During Development

**Problem**: Development server takes 30-60+ seconds to rebuild after file changes
**Solution**:
- Check if markdown export is enabled (look for "Markdown export enabled" in console output)
- Markdown generation processes 563+ pages and significantly slows down rebuilds
- Ensure `ENABLE_MARKDOWN_EXPORT` is not set to `true` in your environment
- Restart the development server without the environment variable:
  ```bash
  npm run start:dev
  ```
- Markdown export should be disabled by default for local development
- Only enable it when testing the download functionality:
  ```bash
  ENABLE_MARKDOWN_EXPORT=true npm run start:dev
  ```

### AsciiDoc Formatting Issues

**Problem**: Content doesn't render as expected
**Solution**:
- Check AsciiDoc syntax
- Verify attributes are correctly defined
- Ensure proper spacing around blocks and elements
