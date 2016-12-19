---
layout: classic-docs
title: "Install and Use Yarn (the NPM replacement) on CircleCI"
short-title: "Install and Use Yarn on CircleCI"
categories: [how-to]
description: "How to modify `circle.yml` in order to install and use Yarn on CircleCI."
---

<img src="{{site.baseurl}}/assets/img/logos/yarn-logo.svg" style="display:block;margin:15px auto;width:40%;min-width:320px;" alt="Yarn Logo" />

[Yarn][yarn-site] is an open-source package manager for JavaScript. CircleCI can cache both Yarn and the packages it installs. This can potentially speed up builds but, more importantly, can reduce errors related to network connectivity.

## Setup

```
machine:
  environment:
    YARN_VERSION: 0.18.1
    PATH: "${PATH}:${HOME}/.yarn/bin:${HOME}/${CIRCLE_PROJECT_REPONAME}/node_modules/.bin"
```

We've set the Yarn version here to reduce the number of moving parts in the build. Although the Yarn install script sets its `PATH`, running from cache requires adding `~/.yarn/bin/` explicitly.

## Installing Yarn

```
dependencies:
  pre:
    - |
      if [[ ! -e ~/.yarn/bin/yarn || $(yarn --version) != "${YARN_VERSION}" ]]; then
        curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version $YARN_VERSION
      fi
  cache_directories:
    - ~/.yarn
    - ~/.cache/yarn
```

Here, the Yarn install script runs if and only if:

* Yarn isn't already installed.
* The installed version of Yarn doesn't match the specified version in the machine section.

**`~/.yarn`** is specified as a cached directory for **Yarn itself**. **`~/.yarn-cache`** is specific as a cached directory for **Yarn packages**.

## Override CircleCI's Inferred Commands

```
dependencies:
  override:
    - yarn install
test:
  override:
    - yarn test
```

When CircleCI detects a JavaScript project, certain commands (like `npm install` or `npm test`) might be run. To use Yarn instead of NPM, we override both the `dependencies` and `test` sections.

## Ubuntu 12.04 Compatibility

This doc assumes you are using CircleCI's Ubuntu 14.04 image. If you are using Ubuntu 12.04, you will need to specify a newer version of NodeJS in `circle.yml`:

```
machine:
  node:
    version: 5.0.0
```

## Full Example

```
machine:
  environment:
    YARN_VERSION: 0.18.1
    PATH: "${PATH}:${HOME}/.yarn/bin:${HOME}/${CIRCLE_PROJECT_REPONAME}/node_modules/.bin"

dependencies:
  pre:
    - |
      if [[ ! -e ~/.yarn/bin/yarn || $(yarn --version) != "${YARN_VERSION}" ]]; then
        echo "Download and install Yarn."
        curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version $YARN_VERSION
      else
        echo "The correct version of Yarn is already installed."
      fi
  override:
    - yarn install
  cache_directories:
    - ~/.yarn
    - ~/.cache/yarn

test:
  override:
    - yarn test
```



[yarn-site]: https://yarnpkg.com/
