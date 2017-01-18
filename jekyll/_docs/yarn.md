---
layout: classic-docs
title: "Using Yarn (the npm replacement) on CircleCI"
short-title: "Yarn Package Manager"
categories: [how-to]
description: "How to use the Yarn package manager on CircleCI."
---

<img src="{{site.baseurl}}/assets/img/logos/yarn-logo.svg" style="display:block;margin:15px auto;width:40%;min-width:320px;" alt="Yarn Logo" />

[Yarn][yarn-site] is an open-source package manager for JavaScript. Yarn is pre-installed on CircleCI and the packages it installs can be cached. This can potentially speed up builds but, more importantly, can reduce errors related to network connectivity.

[yarn-site]: https://yarnpkg.com/

## Setup

```yaml
dependencies:
  override:
    - yarn
test:
  override:
    - yarn test
```

When CircleCI detects a JavaScript project, certain commands (like `npm install` or `npm test`) might be run. To use Yarn instead of npm, we override both the `dependencies` and `test` sections.

```yaml
machine:
  environment:
    PATH: "${PATH}:${HOME}/${CIRCLE_PROJECT_REPONAME}/node_modules/.bin"
```

Overriding the `dependencies` phase means that the `node_modules/.bin` directory doesn't get added to `PATH`. We add it in the `machine` phase.

## Cache

```yaml
dependencies:
  cache_directories:
    - ~/.cache/yarn
```

Yarn stores packages for caching in `~/.cache/yarn`. This is specified as a cache directory to CircleCI and will be cached after the `dependencies` phase completes.

## Full Example

```
machine:
  environment:
    PATH: "${PATH}:${HOME}/${CIRCLE_PROJECT_REPONAME}/node_modules/.bin"

dependencies:
  override:
    - yarn
  cache_directories:
    - ~/.cache/yarn

test:
  override:
    - yarn test
```
