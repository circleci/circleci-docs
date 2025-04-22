# CircleCI Docs Static Site

This repository houses and manages the documentation for CircleCI Docs. Here you will find an overview of the project structure, components, and usage.

## Table of Contents
- [Project Structure](#project-structure)
- [Components](#components)
- [Scripts](#scripts)
- [UI Customization](#ui-customization)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)

## Project Structure
```text
.
├── .circleci/                  # CircleCI pipelines
├── .github/workflows/          # GitHub Actions configurations
├── docs/                       # Antora component sources
│   ├── about/
│   ├── contributors/
│   ├── guides/
│   ├── orbs/
│   ├── reference/
│   ├── root/
│   └── server-admin/
├── scripts/                    # Helper scripts
│   └── build-ui-bundle.sh      # Script to build the UI bundle
├── ui/                         # Antora UI submodule
├── antora-playbook.yml         # Antora playbook: site metadata, component sources, UI bundle, output settings
├── gulpfile.js                 # Local development server and watch tasks
├── package.json                # npm scripts and dependencies
├── package-lock.json           # Locked npm dependencies
├── ui-bundle.zip               # Generated UI bundle
└── .gitignore                  # Ignored files and directories
```

## Components
- **docs/**: Contains Antora components. Each subfolder represents a component loaded by the Antora playbook. Place new or updated documentation under `docs/<component-name>/`, defining `antora.yml` and navigation in `modules/ROOT/nav.adoc`.
- **scripts/**: Contains utility scripts used for building and maintaining the documentation site.
- **ui/**: Git submodule containing the Antora UI theme. This is used to generate the `ui-bundle.zip` file required by Antora.
- **antora-playbook.yml**: Defines how Antora loads components, site metadata (title, URL, robots), UI bundle source, and output directory (`./build`).
- **package.json / package-lock.json**: Manage project dependencies and scripts for building and serving the documentation.

## Scripts
- **`npm run build:docs`**: Builds the entire documentation site and outputs static files to the `build/` directory. Automatically builds the UI bundle if needed.
- **`npm run start:dev`**: Launches a local development server with live reload, rebuilding on file changes. Ensures the UI bundle is built first.
- **`npm run build:ui`**: Builds only the UI bundle using the `build-ui-bundle.sh` script, creating a `ui-bundle.zip` file in the project root.

## UI Customization
The documentation site uses a custom UI theme managed as a Git submodule. The `build-ui-bundle.sh` script handles:

1. Checking if the UI bundle already exists
2. Initializing the Git submodule if needed
3. Installing dependencies for the UI
4. Building the UI bundle
5. Copying the bundle to the project root

When making UI changes:
1. Update the UI submodule
2. Run `npm run build:ui` to rebuild the UI bundle
3. Then rebuild the docs with `npm run build:docs`

## Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)
- Git (for submodule management)

## Getting Started
1. Clone the repository with submodules:
   ```bash
   git clone --recurse-submodules https://github.com/circleci/circleci-docs-static.git
   ```
   
   If you've already cloned the repository without submodules:
   ```bash
   git submodule init
   git submodule update --remote --checkout
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```
   This will build the UI bundle (if not already built) and start the local server.

4. To build the static site for production:
   ```bash
   npm run build:docs
   ```
   The output will be in the `build/` directory.