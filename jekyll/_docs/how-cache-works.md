---
layout: classic-docs
title: How Cache Works
categories: [reference]
description: "How caching works on CircleCI 1.0"
---

When discussing cache on CircleCI, majority of the time it's dependency cache that is being referred to. Dependency cache saves the state of your dependencies between builds, therefore making them run faster.

## What is Cached?

There are two collections of directories which are cached.

1. The directories used by the following languages and dependency managers:

   - Bower
   - Bundler
   - Cabal
   - CocoaPods
   - Ivy
   - Go
   - Gradle
   - Maven
   - NPM
   - Play
   - Virtualenv

2. The directories which you specify in the `dependencies: cache_directories`
   section of `circle.yml`:

```yaml
dependencies:
  # we automatically cache and restore many dependencies between
  # builds. If you need to, you can add custom paths to cache:
  cache_directories:
    - "custom_1"   # relative to the build directory
    - "~/custom_2" # relative to the user's home directory
```

Cache is saved **after** the `dependencies` phase and **before** the `test` phase.

## Per-branch Cache

Each branch of your project will have a separate cache. If it is the
very first build for a branch, the cache from the default branch on
GitHub or Bitbucket (normally `master`) will be used. If there is no cache for
`master`, the cache from other branches will be used.

## Clearing Cache

![]({{ site.baseurl }}/assets/img/docs/cache-build-button-rebuild.png)

The _Rebuild without cache_ button in the UI will disable the cache for
a single build so that you could debug any problems caused by your
dependencies.

If such rebuild successfully passes the dependency phase, it will save
a new cache which will be used by future builds.

Normally you will not have to clear the cache permanently, but if you
feel that’s what you need, you can just remove the necessary parts of
the cache anywhere in your `circle.yml`’s `dependencies` section,
before the cache is saved:

```yaml
dependencies:
  post:
    - rm -r ~/.gradle
```

## Caching in Parallel Builds

The cache is collected from the first container only (container with the index 0). On the next build, the previously collected cache from the node 0 is distributed across all the machines in the parallel build.

## Git Cache

There's another type of caching that CircleCI does. This is to cache the Git repository of your project. This features allows for speedier `git clones` of your project. Control of this cache isn't user accessible and shouldn't need to be. In rare scenarios, you can contact support if something seems to be wrong with your source cache. This is typically the case when certain files are in your repo that shouldn't be.
