# CircleCI Docs Static Site

This repository houses and manages the documentation for CircleCI Docs. Here you will find an overview of the project structure, components, and usage.

## Table of Contents
- [Project Structure](#project-structure)
- [Components](#components)
- [Scripts](#scripts)
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
├── antora-playbook.yml         # Antora playbook: site metadata, component sources, UI bundle, output settings
├── gulpfile.js                 # Local development server and watch tasks
├── package.json                # npm scripts and dependencies
├── package-lock.json           # Locked npm dependencies
└── .gitignore                  # Ignored files and directories
```

## Components
- **docs/**: Contains Antora components. Each subfolder represents a component loaded by the Antora playbook. Place new or updated documentation under `docs/<component-name>/`, defining `antora.yml` and navigation in `modules/ROOT/nav.adoc`.
- **antora-playbook.yml**: Defines how Antora loads components, site metadata (title, URL, robots), UI bundle source, and output directory (`./build`).
- **package.json / package-lock.json**: Manage project dependencies and scripts for building and serving the documentation.

## Scripts
- **`npm run build:docs`**: Builds the entire documentation site and outputs static files to the `build/` directory.
- **`npm run start:dev`**: Launches a local development server with live reload, rebuilding on file changes.

## Getting Started
1. Install dependencies:
   ```bash
   npm ci
   ```
2. Start the development server:
   ```bash
   npm run start:dev
   ```

