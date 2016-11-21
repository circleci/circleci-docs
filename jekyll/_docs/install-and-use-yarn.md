---
layout: classic-docs
title: "Install and Use Yarn (the NPM replacement) on CircleCI"
short-title: "Install and Use Yarn on CircleCI"
categories: [how-to]
description: "How to modify `circle.yml` in order to install and use Yarn on CircleCI."
---

<img src="{{site.baseurl}}/assets/img/logos/yarn-logo.svg" style="display:block;margin:15px auto;width:40%;min-width:320px;" alt="Yarn Logo" />

[Yarn][yarn-site] is an open-source package manager for JavaScript. Both Yarn itself as well as the packages it installs can be cached on CircleCI. This can potentially speed up builds but more importantly can remove network connectivity as a source of problems.

## Setup

```
machine:
  environment:
    YARN_VERSION: 0.17.8
    PATH: "${PATH}:${HOME}/.yarn/bin"
```

The Yarn install script seen later can be used without a version. That will download the latest stable version of Yarn. Here a Yarn version is set in order to reduce the number of variables in a build.

`~/.yarn/bin/` is added to the PATH as well. The Yarn install script also builds the path however in the scenario where we're running from cache, this is needed.

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
    - ~/.yarn-cache
```

Here in the `dependencies` section, Yarn is installed via an install script if and only if:

* Yarn isn't already installed.
* The installed version of Yarn doesn't match the specified version in the machine section.

`~/.yarn` is specified as a cached directory for Yarn itself. `~/.yarn-cache` is specific as a cached directory for Yarn packages.

## Override CircleCI's Inferred Commands

```
dependencies:
  override:
    - yarn install
test:
  override:
    - yarn test
```

When CircleCI detects a JavaScript based project, certain commands can be run such as `npm install` or `npm test`. To use Yarn instead, we override both the `dependencies` and `test` section.

## Full Example

Here is the full example `circle.yml` file:

```
machine:
  environment:
    YARN_VERSION: 0.17.8
    PATH: "${PATH}:${HOME}/.yarn/bin"

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
    - ~/.yarn-cache

test:
  override:
    - yarn test
```



[yarn-site]: https://yarnpkg.com/
