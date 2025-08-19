# CircleCI Docs Static Site: Contributing Guide

This guide provides comprehensive information for contributors to the CircleCI Docs Static Site project.

## Table of Contents
- [Ways to Contribute](#ways-to-contribute)
- [Setting Up Your Development Environment](#setting-up-your-development-environment)
- [Contribution Workflow](#contribution-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Review Process](#review-process)
- [Release Process](#release-process)

## Ways to Contribute

There are several ways to contribute to the CircleCI Docs Static Site:

1. **Documentation content**: Add or improve documentation pages
2. **Technical improvements**: Enhance the site's functionality
3. **UI improvements**: Improve the user interface and experience
4. **Bug fixes**: Fix issues with the site or content
5. **Feature requests**: Suggest new features or improvements

### Types of Contributions Needed

- Writing tutorials and how-to guides
- Improving API and reference documentation
- Translating content
- Fixing typos and clarifying explanations
- Developing new UI components
- Improving build performance
- Adding new functionality to the site

## Setting Up Your Development Environment

### Prerequisites

- **Node.js**: v22 or later
- **npm**: v8 or later
- **Git**: Latest version recommended
- A code editor of your choice (VS Code, IntelliJ, etc.)

### Initial Setup

1. **Fork the repository**:
   - Visit [https://github.com/circleci/circleci-docs](https://github.com/circleci/circleci-docs)
   - Click the "Fork" button to create your own copy

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/circleci-docs.git
   cd circleci-docs
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/circleci/circleci-docs.git
   ```

4. **Install dependencies**:
   ```bash
   npm ci
   ```

## Contribution Workflow

### Creating a Branch

Create a new branch for your work:

```bash
git checkout -b type/description
```

Branch naming conventions:
- `docs/`: Documentation changes
- `feature/`: New features
- `fix/`: Bug fixes
- `refactor/`: Code refactoring
- `style/`: Style and UI changes
- `test/`: Adding or modifying tests

Example: `docs/add-kubernetes-guide` or `fix/broken-navigation`

### Making Changes

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch-name
   git rebase main
   ```

2. **Make your changes**:
   - Edit files as needed
   - Follow the code style guidelines
   - Add tests if applicable

3. **Test your changes locally**:
   ```bash
   npm run start:dev
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

   Commit message format: 
   ```
   type(scope): Brief description
   
   Longer description if needed
   
   Fixes #123
   ```

   Types:
   - `docs`: Documentation changes
   - `feat`: New features
   - `fix`: Bug fixes
   - `refactor`: Code refactoring
   - `style`: Style changes
   - `test`: Test-related changes

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin your-branch-name
   ```

2. **Create a pull request**:
   - Go to your fork on GitHub
   - Click "Pull Request"
   - Select your branch and fill in the PR template
   - Add reviewers if you know who should review your changes

3. **Address feedback**:
   - Make requested changes
   - Push additional commits
   - Respond to comments

4. **Update your PR if needed**:
   If main has been updated while your PR was open:
   ```bash
   git checkout your-branch-name
   git pull upstream main --rebase
   git push origin your-branch-name --force
   ```

## Code Style Guidelines

### JavaScript

- Follow the ESLint configuration in the project
- Use modern JavaScript (ES6+) features
- Document functions with JSDoc comments
- Use meaningful variable and function names
- Limit line length to 100 characters

Example:

```javascript
/**
 * Performs a specific task
 * @param {string} input - Description of input
 * @returns {Object} Description of return value
 */
function performTask(input) {
  const result = doSomething(input);
  return result;
}
```

### CSS

- Follow the project's TailwindCSS conventions
- Use utility classes when appropriate
- Extract components for repeated patterns
- Use meaningful class names for custom components

### AsciiDoc

- Follow the content authoring guidelines in [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md)
- Use consistent heading levels
- Include proper metadata and attributes
- Use the appropriate formatting for different content types

## Testing Guidelines

### Types of Tests

- **Content validation**: Ensuring documentation is accurate
- **Link checking**: Verifying all links work correctly
- **UI testing**: Checking for visual and interactive issues
- **Build testing**: Ensuring the site builds correctly

### Running Tests

- **Content verification**:
  ```bash
  npm run start:dev
  ```
  Review the site locally for content issues.

- **Link checking**:
  The CI pipeline includes automatic link checking.

## Documentation Guidelines

### Code Documentation

- Document all functions, classes, and modules
- Explain complex algorithms and decisions
- Use inline comments for non-obvious code
- Keep code documentation up-to-date with changes

### Project Documentation

- Update the README.md for significant changes
- Document new features and components
- Update usage instructions when needed
- Add examples for new functionality

## Review Process

### Pull Request Review

All contributions go through a review process:

1. **Automated checks**: CI system runs tests and checks
2. **Code review**: Maintainers review the code for:
   - Code quality and style
   - Security considerations
   - Performance impact
   - Test coverage
3. **Content review**: For documentation changes:
   - Technical accuracy
   - Clarity and completeness
   - Adherence to style guide

### What Reviewers Look For

- Does the change solve the stated problem?
- Is the code well-structured and maintainable?
- Is the documentation clear and complete?
- Are there adequate tests?
- Does it follow project conventions?

### After Approval

Once your PR is approved:

1. It will be merged by a maintainer
2. Your contribution will be included in the next release
3. You'll be credited as a contributor

## Release Process

### Release Schedule

The CircleCI Docs Static Site follows a continuous delivery model:

- Documentation changes: Released as soon as they're approved
- Technical changes: Released on a scheduled basis
- Emergency fixes: Released as needed

### Release Process

1. Changes are merged to `main`
2. CI pipeline builds and tests the site
3. Automatic deployment to staging environment
4. Review and testing in staging
5. Deployment to production

### Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Backward-incompatible changes
- **MINOR**: New functionality (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

For the documentation content itself, individual pages aren't versioned, but the site structure supports versioned components through Antora's versioning system.

## Getting Help

If you need help with your contribution:

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Refer to the technical docs

## Recognition

Contributors are recognized in several ways:

- Attribution in commit history
- Inclusion in the contributors list
- Recognition in release notes for significant contributions

Thank you for contributing to the CircleCI Docs Static Site!
