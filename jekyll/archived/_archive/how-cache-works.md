---
layout: classic-docs
title: Caching in CircleCI
categories: [optimization]
description: "How caching works on CircleCI 1.0"
sitemap: false
---

When we talk about caching on CircleCI, we're usually talking about the dependency cache. Dependency caching saves the state of your dependencies between builds, thereby making them run faster.

## What Is Cached?

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

Cache is saved **after** the `dependencies: override` phase and **before** the
`test` phase. This means that the directory (or directories) you'd like to
cache must exist after `dependencies: override`, so if the desired cache
directory hasn't been created automatically, you'll need to create it manually,
like this:

```yaml
dependencies:
  pre:
    - mkdir ~/my_cache_dir
    # now add files and directories to the above directory
  cache_directories:
    - "~/my_cache_dir"
```
Also, make sure that the directory you are trying to cache is not a part of your repository (i.e. files in this directory are not tracked).

## Save Cache Output

The checkmark and X characters indicate which paths exist at the time when the caches are saved – any paths with a X do not exist.

There are some subtleties here though, in CircleCI 1.0 we create a read-only BTRFS snapshot, and save caches from these. If there are any symlinks that point outside of the snapshot, then they will not be cached, since BTRFS snapshots do not recursively follow symlinks.

## Per-branch Cache

Each branch of your project will have a separate cache. If it is the
very first build for a branch, the cache from the default branch on
GitHub or Bitbucket (normally `master`) will be used. If there is no cache for
`master`, the cache from other branches will be used.

## Clearing Cache

![](  {{ site.baseurl }}/assets/img/docs/cache-build-button-rebuild.png)

The _Rebuild without cache_ button in the UI will disable the cache for
a single build so you can debug any problems caused by your
dependencies.

If that rebuild successfully passes the dependency phase, it will save
a new cache which will be used by future builds.

You shouldn't generally need to clear the cache permanently, but if you'd
like to do so, you can just remove the necessary parts of
the cache anywhere in your `circle.yml`’s `dependencies` section,
before the cache is saved:

```yaml
dependencies:
  post:
    - rm -r ~/.gradle
```

## Caching in Parallel Builds

The cache is collected from the first container only (the container with index 0). On the next build, the previously collected cache from container 0 is distributed across all machines in the parallel build.

## Git Cache

There's another type of caching that CircleCI does. This is to cache the Git repository of your project. This feature allows for speedier `git clone`s of your project. Control of this cache isn't user accessible and shouldn't need to be. In rare scenarios, if something seems to be wrong with your source cache (for example, certain files are in your repo that shouldn't be), please contact support.
