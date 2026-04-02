# CircleCI docs site: technical documentation

Welcome to the comprehensive technical documentation for the CircleCI docs project. This documentation is designed to help developers, content authors, and contributors understand the project's architecture, workflow, and best practices.

## Table of contents

- [Overview](#overview)
- [Documentation Files](#documentation-files)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

## Overview

The CircleCI docs site is a documentation platform built using [Antora](https://antora.org/), a static site generator designed for technical documentation. This project combines:

- **Component-based architecture**: Organized documentation into logical sections
- **AsciiDoc content**: Powerful markup language for technical documentation
- **Custom UI**: Tailored presentation with modern web technologies
- **Automated build pipeline**: Streamlined development and deployment process

## Documentation Files

This technical documentation consists of several specialized files:

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview and basic usage |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Detailed system architecture |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development setup and workflows |
| [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md) | Writing and formatting guidelines |
| [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) | Detailed technical specifications |
| [API_DOCS_INTEGRATION.md](API_DOCS_INTEGRATION.md) | API documentation integration guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guidelines for contributors |

## Getting Started

### For Contributors

1. **Set up your environment**:
   ```bash
   git clone https://github.com/circleci/circleci-docs.git
   cd circleci-docs
   npm ci
   ```

2. **Start the development server**:
   ```bash
   npm run start:dev
   ```

### For API Documentation

This project includes integrated API documentation built with Redocly. See [API_DOCS_INTEGRATION.md](API_DOCS_INTEGRATION.md) for details.

The API docs are built along with the docs site.

### Technical Reference

You can review the CircleCI docs site architechture in the following documents:

* [ARCHITECTURE.md](ARCHITECTURE.md) for system design
* [DEVELOPMENT.md](DEVELOPMENT.md) for development workflow
* [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) for detailed specs

### For Content Authors

1. **Understand the content organization**:
   - Read [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md) for guidelines
   - Review existing content for examples and patterns

2. **Set up your environment**:
   - Follow the developer setup instructions
   - Start the development server to preview changes

3. **Create or edit content**:
   - Check whether the content you want to add or edit already exists. Consider whether you need to add a new page or edit existing material
   - Check the CircleCI docs style guide and templates [here](https://circleci.com/docs/contributors/docs-style/)
   - Follow the AsciiDoc formatting guidelines
   - Use the appropriate component structure
   - Test your content locally. You can also preview a change by checking the [CircleCI build assets](https://app.circleci.com/pipelines/github/circleci/circleci-docs)

## Contributing

We welcome contributions to both the documentation content and the technical infrastructure. To contribute:

1. Review [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
2. Set up your development environment
3. Create a branch for your changes
4. Submit a pull request

