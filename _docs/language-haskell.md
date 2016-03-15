---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Haskell
short-title: Haskell
categories: [languages]
last_updated: April 17, 2014
---

Circle supports building Haskell applications with GHC and Cabal. Before each
build we look at your repository and infer commands to run, so most
setups should work automatically.

If you'd like something specific that's not being inferred,
[you can say so](/docs/configuration) with
[a configuration file](/docs/config-sample)
checked into the root of your repository.

### Version

Circle has
[several versions of GHC](/docs/environment#haskell)
available. We use `{{ versions.ghc }}`
as the default; if you'd like a particular version, you
can specify it in your `circle.yml`:

```
machine:
  ghc:
    version: 7.8.3
```

### Dependencies & Tests

If we find a Cabal file at the root of your repository, we install your
dependencies and run `cabal build` and `cabal test`.
You can customize this easily in your `circle.yml` by setting
the `override`, `pre`, and `post` properties in the
[dependencies](/docs/configuration#dependencies)
and [test](/docs/configuration#test) sections.

```
test:
  post:
    - cabal bench
```

Circle can [cache directories](/docs/configuration#cache-directories)
in between builds to avoid unnecessary work. If you use Cabal, our inferred
commands build your project in a Cabal sandbox and cache the sandbox.
This helps your build run as quickly as possible.

### Artifacts

Circle supports saving and uploading arbitrary
[build artifacts](/docs/build-artifacts).

If you'd like to automatically generate documentation with Haddock,
you can put something like this in your `circle.yml`:

```
test:
  post:
    - cabal haddock --builddir=$CIRCLE_ARTIFACTS
```

### Troubleshooting

Our [Haskell troubleshooting](/docs/troubleshooting-haskell)
documentation has information about the following issues:

*   [Unexpected Timeouts During `cabal test`](/docs/cabal-test-timeout)

If you have any further trouble, please [contact us](mailto:sayhi@circleci.com).
We'll be happy to help!
