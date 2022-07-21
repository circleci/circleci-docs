---
layout: classic-docs
title: "Caching Strategies"
description: "This document is a guide to the various caching strategies available for managing dependency caches in CircleCI."
categories: [optimization]
order: 50
version:
- Cloud
- Server v3.x
- Server v2.x
---

Caching is one of the most effective ways to make jobs faster on CircleCI. By reusing the data from previous jobs, you also reduce the cost of fetch operations. Caching is project-specific, and there are a number of strategies to help optimize caches for effectiveness and storage optimization.

* TOC
{:toc}

## Cache storage customization
{: #caching-and-self-hosted-runner }

When using self-hosted runners, there is a network and storage usage limit included in your plan. There are certain actions related to artifacts that will accrue network and storage usage. Once your usage exceeds your limit, charges will apply.

Retaining caches for a long period of time will have storage cost implications, therefore, it is best to determine why you are retaining caches, and how long caches need to be retained for your use case. To lower costs, consider a lower storage retention for caches, if that suits your needs.

You can customize storage usage retention periods for caches on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. For information on managing network and storage usage, see the [Persisting Data]({{site.baseurl}}/persist-data/#managing-network-and-storage-use) page.

## Cache optimization
{: #cache-optimization }

When setting up caches for your projects, the goal is a 10x - 20x ROI (return on investment). This means you are aiming for a situation where the amount of cache restored is 10x - 20x the cache saved. The following tips can help you achieve this.

### Avoid strict cache keys
{: #avoid-strict-cache-keys }

Using cache keys that are too strict can mean that you will only get a minimal number of cache hits for a workflow. For example, if you used the key `CIRCLE_SHA1` (SHA of the last commit of the current pipeline), this would only get matched once for a workflow. Consider using cache keys that are less strict to ensure more cache hits.

### Avoid unnecessary workflow reruns
{: #avoid-unnecessary-workflow-reruns }

If your project has "flaky tests," workflows might be rerun unnecessarily. This will both use up your credits and increase your storage usage. To avoid this situation, address flaky tests. For help with identifying them, see [Test Insights]({{ site.baseurl }}/insights-tests/#flaky-tests)). You can also consider configuring your projects to only rerun failed jobs rather than entire workflows. To achieve this you can use the `when` step. For further information see the [Configuration Reference]({{ site.baseurl }}/configuration-reference/#the-when-attribute).

### Split cache keys by directory
{: #split-cache-keys-by-directory }

Having multiple directories under a single cache key increases the chances of there being a change to the cache. In the example below, there may be changes in the first two directories but no changes in the `a` or `b` directory. Saving all four directories under one cache key increases the potential storage usage. The cache restore step will also take longer than needed as all four sets of files will be restored.

```yaml
dependency_cache_paths:
  - /mnt/ramdisk/node_modules
  - /mnt/ramdisk/.cache/yarn
  - /mnt/ramdisk/apps/a/node_modules
  - /mnt/ramdisk/apps/b/node_modules
```

### Combine jobs when possible
{: #combine-jobs-when-possible }

As an example, a workflow including three jobs running in parallel:

* lint (20 seconds)
* code-cov (30 seconds)
* test (8 mins)

All running a similar set of steps:

* checkout
* restore cache
* build
* save cache
* run command

The `lint` and `code-cov` jobs could be combined with no affect on workflow length, but saving on duplicate steps.

### Order jobs to create meaningful workflows
{: #order-jobs-to-create-meaningful-workflows }

If no job ordering is used in a workflow all jobs run concurrently. If all the jobs have a `save_cache` step, they could be uploading files multiple times. Consider reordering jobs in a workflow so subsequent jobs can make use of assets created in previous jobs.

### Check for language-specific caching tips
{: #check-for-language-specific-caching-tips }

Check #partial-dependency-caching-strategies to see if there are tips for the language you are using.

### Check cache is being restored as well as saved
{: #check-cache-is-being-restored-as-well-as-saved }

If you find that a cache is not being restored, see [this support article](https://support.circleci.com/hc/en-us/articles/360004632473-No-Cache-Found-and-Skipping-Cache-Generation) for tips.

### Cache unused or superfluous dependencies
{: #cache-unused-or-superfluous-dependencies }

Depending on what language and package management system you are using, you may be able to leverage tools that clear or “prune” unnecessary dependencies.

For example, the node-prune package removes unnecessary files (markdown, typescript files, etc.) from `node_modules`.

### Check if jobs need pruning
{: #check-if-jobs-need-pruning}

If you notice your cache usage is high and would like to reduce it:

* Search for the `save_cache` and `restore_cache` commands in your `.circleci/config.yml` file to find all jobs utilizing caching and determine if their cache(s) need pruning.
* Narrow the scope of a cache from a large directory to a smaller subset of specific files.
* Ensure that your cache `key` is following [best practices]({{ site.baseurl}}/caching/#further-notes-on-using-keys-and-templates):

  {% raw %}
  ```sh
      - save_cache:
          key: brew-{{epoch}}
          paths:
            - /Users/distiller/Library/Caches/Homebrew
            - /usr/local/Homebrew
  ```
  {% endraw %}

  Notice in the above example that best practices are not being followed. `brew-{{ epoch }}` will change every build causing an upload every time even if the value has not changed. This will eventually cost you money, and never save you any time. Instead pick a cache `key` like the following:

  {% raw %}
  ```sh
      - save_cache:
          key: brew-{{checksum “Brewfile”}}
          paths:
            - /Users/distiller/Library/Caches/Homebrew
            - /usr/local/Homebrew
  ```
  {% endraw %}

  This will only change if the list of requested dependencies has changed. If you find that this is not uploading a new cache often enough, include the version numbers in your dependencies.

  Let your cache be slightly out of date. In contrast to the suggestion above where we ensured that a new cache would be uploaded any time a new dependency was added to your lockfile or version of the dependency changed, use something that tracks it less precisely.

  Prune your cache before you upload it, but make sure you prune whatever generates your cache key as well.

## Partial dependency caching strategies
{: #partial-dependency-caching-strategies }

Some dependency managers do not properly handle installing on top of partially restored dependency trees.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - gem-cache-{{ arch }}-{{ .Branch }}
        - gem-cache
```
{% endraw %}

In the above example, if a dependency tree is partially restored by the second or third cache keys, some dependency managers will incorrectly install on top of the outdated dependency tree.

Instead of a cascading fallback, a more stable option is a single version-prefixed cache key:

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

Since caches are immutable, this strategy allows you to regenerate all of your caches by incrementing the version. This is useful in the following scenarios:

- When you change the version of a dependency manager like `npm`.
- When you change the version of a language like Ruby.
- When you add or remove dependencies from your project.

The stability of partial dependency caching relies on your dependency manager. Below is a list of common dependency managers, recommended partial caching strategies, and associated justifications.

### Bundler (Ruby)
{: #bundler-ruby }

**Safe to Use Partial Cache Restoration?**
Yes (with caution).

Since Bundler uses system gems that are not explicitly specified, it is non-deterministic, and partial cache restoration can be unreliable.

To prevent this behavior, add a step that cleans Bundler before restoring dependencies from cache.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-
        - v1-gem-cache-{{ arch }}-
  - run: bundle install
  - run: bundle clean --force
  - save_cache:
      paths:
        - ~/.bundle
      key: v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

### Gradle (Java)
{: #gradle-java }

**Safe to Use Partial Cache Restoration?**
Yes.

Gradle repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are added to classpaths of generated artifacts.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
        - gradle-repo-v1-{{ .Branch }}-
        - gradle-repo-v1-
  - save_cache:
      paths:
        - ~/.gradle
      key: gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
```

{% endraw %}

### Maven (Java) and Leiningen (Clojure)
{: #maven-java-and-leiningen-clojure }

**Safe to Use Partial Cache Restoration?**
Yes.

Maven repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are added to classpaths of generated artifacts.

Since Leiningen uses Maven under the hood, it behaves in a similar way.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - maven-repo-v1-{{ .Branch }}-{{ checksum "pom.xml" }}
        - maven-repo-v1-{{ .Branch }}-
        - maven-repo-v1-
  - save_cache:
      paths:
        - ~/.m2
      key: maven-repo-v1-{{ .Branch }}-{{ checksum "pom.xml" }}
```

{% endraw %}

### npm (Node)
{: #npm-node }

**Safe to Use Partial Cache Restoration?**
Yes (with NPM5+).

With NPM5+ and a lock file, you can safely use partial cache restoration.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
        - node-v1-{{ .Branch }}-
        - node-v1-
  - save_cache:
      paths:
        - ~/usr/local/lib/node_modules  # location depends on npm version
      key: node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
```

{% endraw %}

### pip (Python)
{: #pip-python }

**Safe to Use Partial Cache Restoration?**
Yes (with Pipenv).

Pip can use files that are not explicitly specified in `requirements.txt`. Using [Pipenv](https://docs.pipenv.org/) will include explicit versioning in a lock file.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
        - pip-packages-v1-{{ .Branch }}-
        - pip-packages-v1-
  - save_cache:
      paths:
        - ~/.local/share/virtualenvs/venv  # this path depends on where pipenv creates a virtualenv
      key: pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
```

{% endraw %}

### Yarn (Node)
{: #yarn-node }

**Safe to Use Partial Cache Restoration?**
Yes.

Yarn has always used a lock file for exactly these reasons.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
        - yarn-packages-v1-{{ .Branch }}-
        - yarn-packages-v1-
  - save_cache:
      paths:
        - ~/.cache/yarn
      key: yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
```

We recommend using `yarn --frozen-lockfile --cache-folder ~/.cache/yarn` for two reasons:

1) `--frozen-lockfile` ensures a whole new lockfile is created and it also ensures your lockfile is not altered. This allows for the checksum to stay relevant and your dependencies should identically match what you use in development.

2) The default cache location depends on OS. `--cache-folder ~/.cache/yarn` ensures you are explicitly matching your cache save location.

{% endraw %}

## Caching strategy tradeoffs
{: #caching-strategy-tradeoffs }

In cases where the build tools for your language include elegant handling of dependencies, partial cache restores may be preferable to zero cache restores for performance reasons. If you get a zero cache restore, you have to reinstall all your dependencies, which can cause reduced performance. One alternative is to get a large percentage of your dependencies from an older cache, instead of starting from zero.

However, for other language types, partial caches carry the risk of creating code dependencies that are not aligned with your declared dependencies and do not break until you run a build without a cache. If the dependencies change infrequently, consider listing the zero cache restore key first.

Then track the costs over time. If the performance costs of zero cache restores (also referred to as a *cache miss*) prove significant over time, only then consider adding a partial cache restore key.

Listing multiple keys for restoring a cache increases the chances of a partial cache hit. However, broadening your `restore_cache` scope to a wider history increases the risk of confusing failures. For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

## Using a lock file
{: #using-a-lock-file }

Language dependency manager lockfiles (for example, `Gemfile.lock` or `yarn.lock`) checksums may be a useful cache key.

An alternative is to run the command `ls -laR your-deps-dir > deps_checksum` and reference it with {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file, you could install the dependencies within a virtualenv in the project root `venv` and then run the command `ls -laR venv > python_deps_checksum`.

## Using multiple caches for different languages
{: #using-multiple-caches-for-different-languages }

It is also possible to lower the cost of a cache miss by splitting your job across multiple caches. By specifying multiple `restore_cache` steps with different keys, each cache is reduced in size, thereby reducing the performance impact of a cache miss. Consider splitting caches by language type (npm, pip, or bundler), if you know how each dependency manager stores its files, how it upgrades, and how it checks dependencies.

## Caching expensive steps
{: #caching-expensive-steps }
{:.no_toc}

Certain languages and frameworks include more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Do not cache everything, but _do_ consider caching for costly steps like compilation.

## See also
{: #see-also }
{:.no_toc}

- [Persisting Data]({{site.baseurl}}/persist-data)
- [Caching Dependencies]({{site.baseurl}}/caching)
- [Workspaces]({{site.baseurl}}/workspaces)
- [Artifacts]({{site.baseurl}}/artifacts)
- [Optimizations Overview]({{site.baseurl}}/optimizations)

