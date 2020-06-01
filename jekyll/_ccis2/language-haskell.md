---
layout: classic-docs
title: "Language Guide: Haskell"
short-title: "Haskell"
description: "Building and Testing with Haskell on CircleCI 2.0"
categories: [language-guides]
order: 2
---

This guide will help you get started with a basic Haskell application on
CircleCI 2.0. If you’re in a rush, feel free to copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

* TOC
{:toc}

## Overview
{:.no_toc}

You can view an example Haskell project that build with CircleCI at the following link:

- <a href="https://github.com/CircleCI-Public/circleci-demo-haskell"
target="_blank">Demo Haskell Project on GitHub</a>

In the project you will find a commented CircleCI configuration file <a
href="https://github.com/CircleCI-Public/circleci-demo-haskell/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>.


## Sample Configuration

{% raw %}

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
    steps:
      - checkout
      - restore_cache:
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          name: Restore Cached Dependencies
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: Resolve/Update Dependencies
          command: stack --no-terminal setup
      - run:
          name: Run tests
          command: stack --no-terminal test
      - run:
          name: Install executable
          command: stack --no-terminal install
      - save_cache:
          name: Cache Dependencies
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - "/root/.stack"
            - ".stack-work"
      - store_artifacts:
          # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: ~/.local/bin/circleci-demo-haskell-exe
          destination: circleci-demo-haskell-exe

```

{% endraw %}

## Config Walkthrough

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2.1
```

Next, we have a `jobs` key. Each job represents a phase in your workflow. Our
sample app only needs a `build` job, so all our steps and commands will live
under that key.

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs).
Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows),
it must have a `build` job.

The steps of a job occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-types/).

In this example, the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used
to specify a custom Docker image. The first image listed becomes the job's [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

All commands for a job execute in this container.

```yaml
jobs:
  build:
    docker:
      - image: fpco/stack-build:lts
```

We are now set to run the Haskell build tool `stack` in our environment. The remainder of our
`config.yml` file all falls under the `steps` key.

Our first step is to run `checkout` to pull our repository's code down and set
it up in our environment. 

Next we check if there are any dependencies that can be restored, enabling our
build to speed up. Following that, we run `stack setup` to pull in the Haskell
compiler as specified in the `stack.yaml` config.

For all `stack` invocations, `--no-terminal` is used to avoid the "sticky output" feature
(implemented using `\b` characters) to pollute the CircleCI log with undisplayable characters.

{% raw %}
```yaml
    steps:
      - checkout
      - restore_cache:
          name: Restore Cached Dependencies
          keys:
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
            - cci-demo-haskell-v1-{{ checksum "stack.yaml" }}
      - run:
          name: Resolve/Update Dependencies
          command: stack --no-terminal setup
      - save_cache:
          name: Cache Dependencies
          key: cci-demo-haskell-v1-{{ checksum "stack.yaml" }}-{{ checksum "package.yaml" }}
          paths:
            - ~/.stack
            - ~/.stack-work
```
{% endraw %}

Note: It's also possible to use a `cabal` build file for caching dependencies.
`stack`, however, is commonly recommended, especially for those new to the Haskell ecosystem. Because this
demo app leverages `stack.yaml` and `package.yaml`, we use these two files as the
cache key for our dependencies. `package.yaml` is more often updated than `stack.yaml` so that two keys are
used to restore the cache.
You can read more about the differences between
`stack` and `cabal` on [The Haskell Tool Stack docs](https://docs.haskellstack.org/en/stable/stack_yaml_vs_cabal_package_file/).

Finally, we can run our application build commands. We'll run our tests first
and then move on to install our executable. Running `stack install` will create
a binary and move it to `~/.local/bin`. 

```yaml
      - run:
          name: Run tests
          command: stack --no-terminal test
      - run:
          name: Install executable
          command: stack --no-terminal install
```

Finally, we can take the built executable and store it as an artifact.

```yaml
      - store_artifacts:
          # Upload buildresults for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: ~/.local/bin/circleci-demo-haskell-exe 
          destination: circleci-demo-haskell-exe
```

Excellent! You are now setup on CircleCI with a Haskell app.

## Common Trouble Shooting

The command `stack test` may fail with an out of memory error. Consider adding the `-j1` flag to the `stack test` command 
as seen below (Note: this will reduce test execution to one core, decreasing memory usage as well, but may also increase your test execution time).

```yaml
      - run:
          name: Run tests
          command: stack --no-terminal test -j1
```

## See Also
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.

The app described in this guide illustrates the simplest possible setup for a
Haskell web app. Real-world projects will be more complex and you may find
you need to customize and tweak settings from those illustrated here (such as
the docker image or [configuration](https://docs.haskellstack.org/en/v1.0.2/docker_integration/) you use, or
which Haskell build tools you use). Have fun!

