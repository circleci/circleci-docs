---
layout: classic-docs
title: "Caching Dependencies"
description: "This document is a guide to caching dependencies in CircleCI pipelines."
categories: [optimization]
order: 50
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

Caching is one of the most effective ways to make jobs faster on CircleCI. By reusing the data from previous jobs, you also reduce the cost of fetch operations. After an initial job run, subsequent instances of the job run faster, as you are not redoing work.

* TOC
{:toc}

![caching data flow]({{site.baseurl}}/assets/img/docs/caching-dependencies-overview.png)

Caching is particularly useful with **package dependency managers** such as Yarn, Bundler, or Pip. With dependencies restored from a cache, commands like `yarn install` need only download new or updated dependencies, rather than downloading everything on each build.


**Warning:** Caching files between different executors, for example, between Docker and machine, Linux, Windows or macOS, or CircleCI image and non-CircleCI image, can result in file permissions and path errors. These errors are often caused by missing users, users with different UIDs, and missing paths. Use extra care when caching files in these cases.
{: class="alert alert-warning"}


## Introduction
{: #introduction }
{:.no_toc}

Automatic dependency caching is not available in CircleCI, so it is important to plan and implement your caching strategy to get the best performance. Manual configuration enables advanced strategies and fine-grained control. See the [Caching Strategies]({{site.baseurl}}/caching-strategy/) and [Persisting Data]({{site.baseurl}}/persist-data/) pages for tips on caching strategies and management.

This document describes the manual caching options available, the costs and benefits of a chosen strategy, and tips for avoiding problems with caching.

By default, cache storage duration is set to 15 days. This can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. Currently, 15 days is also the maximum storage duration you can set.

The Docker images used for CircleCI jobs are automatically cached on the server infrastructure where possible.
{: class="alert alert-info"}

**Warning:** Although several examples are included below, caching strategies need to be carefully planned for each individual project. Copying and pasting the code examples will not always be appropriate for your needs.
{: class="alert alert-warning"}

For information about caching and reuse of unchanged layers of a Docker image, see the [Docker Layer Caching]({{site.baseurl}}/docker-layer-caching/) document.

## How caching works
{: #how-caching-works }

A cache stores a hierarchy of files under a key. Use the cache to store data that makes your job faster, but, in the case of a cache miss or zero cache restore, the job still runs successfully. For example, you might cache `NPM` package directories (known as `node_modules`). The first time your job runs, it downloads all your dependencies, caches them, and (provided your cache is valid) the cache is used to speed up your job the next time it is run.

Caching is about achieving a balance between reliability and getting maximum performance. In general, it is safer to pursue reliability than to risk a corrupted build or to build very quickly using out-of-date dependencies.

## Basic example of dependency caching
{: #basic-example-of-dependency-caching }

### Saving cache
{: #saving-cache }

CircleCI manual dependency caching requires you to be explicit about what you cache and how you cache it. See the [save cache section]({{site.baseurl}}/configuration-reference/#save_cache) of the Configuring CircleCI document for additional examples.

To save a cache of a file or directory, add the `save_cache` step to a job in your `.circleci/config.yml` file:

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

CircleCI imposes a 900-character limit on the length of a `key`. Be sure to keep your cache keys under this maximum.
The path for directories is relative to the `working_directory` of your job. You can specify an absolute path if you choose.

**Note:**
Unlike the special step [`persist_to_workspace`]({{site.baseurl}}/configuration-reference/#persist_to_workspace), neither `save_cache` nor `restore_cache` support globbing for the `paths` key.

### Restoring cache
{: #restoring-cache }

CircleCI restores caches in the order of keys listed in the `restore_cache` step. Each cache key is namespaced to the project and retrieval is prefix-matched. The cache is restored from the first matching key. If there are multiple matches, the most recently generated cache is used.

In the example below, two keys are provided:

{% raw %}
```yaml
    steps:
      - restore_cache:
          keys:
            # Find a cache corresponding to this specific package-lock.json checksum
            # when this file is changed, this key will fail
            - v1-npm-deps-{{ checksum "package-lock.json" }}
            # Find the most recently generated cache used from any branch
            - v1-npm-deps-
```
{% endraw %}

Because the second key is less specific than the first, it is more likely there will be differences between the current state and the most recently generated cache. When a dependency tool runs, it would discover outdated dependencies and update them. This is referred to as a **partial cache restore**.

Each line in the `keys:` list manages _one cache_ (each line does **not** correspond to its own cache). The list of keys {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} and `v1-npm-deps-`), in this example, represent a **single** cache. When it is time to restore the cache, CircleCI first validates the cache based on the first (and most specific) key, and then steps through the other keys looking for any other cache key changes.

The first key concatenates the checksum of `package-lock.json` file into the string `v1-npm-deps-`. If this file changed in your commit, CircleCI would see a new cache key.

The next key does not have a dynamic component to it. It is simply a static string: `v1-npm-deps-`. If you would like to invalidate your cache manually, you can bump `v1` to `v2` in your `.circleci/config.yml` file. In this case, you would now have a new cache key `v2-npm-deps`, which triggers the storing of a new cache.

## Basic example of Yarn package manager caching
{: #basic-example-of-yarn-package-manager-caching }

[Yarn](https://yarnpkg.com/) is an open-source package manager for JavaScript. The packages it installs can be cached, which can speed up builds, but, more importantly, can reduce errors related to network connectivity.

Please note, the release of Yarn 2.x comes with a the ability to do [Zero Installs](https://yarnpkg.com/features/zero-installs). If you are using Zero Installs, you should not need to do any special caching within CircleCI.

If you are using Yarn 2.x _without_ Zero Installs, you can do something like the following:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --immutable
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - .yarn/cache
            - .yarn/unplugged
#...
```
{% endraw %}

If you are using Yarn 1.x, you can do something like the following:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --frozen-lockfile --cache-folder ~/.cache/yarn
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## Caching and open source
{: #caching-and-open-source }

If your project is open source/available to be forked and receive PRs from contributors, make note of the following:

- PRs from the same fork repo share a cache (this includes, as previously stated, that PRs in the main repo share a cache with main).
- Two PRs in different fork repos have different caches.
- Enabling the sharing of [environment variables]({{site.baseurl}}/env-vars) allows cache sharing between the original repo and all forked builds.

## Caching libraries
{: #caching-libraries }

If a job fetches data at any point, it is likely that you can make use of caching. The most important dependencies to cache during a job are the libraries on which your project depends. For example, cache the libraries that are installed with `pip` in Python or `npm` for Node.js. The various language dependency managers, for example `npm` or `pip`, each have their own paths where dependencies are installed. See our Language guides and [demo projects]({{site.baseurl}}/demo-apps/) for the specifics for your stack.

Tools that are not explicitly required for your project are best stored on the Docker image. The Docker image(s) prebuilt by CircleCI have tools preinstalled that are generic for building projects using the relevant language. For example, the `cimg/ruby:3.1.2` image includes useful tools like git, openssh-client, and gzip.

![Caching Dependencies]({{site.baseurl}}/assets/img/docs/cache_deps.png)

We recommend that you verify that the dependencies installation step succeeds before adding caching steps. Caching a failed dependency step will require you to change the cache key in order to avoid failed builds due to a bad cache.

Example of caching `pip` dependencies:

{:.tab.dependencies.Cloud}
{% raw %}
```yaml
version: 2.1
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

{:.tab.dependencies.Server_3}
{% raw %}
```yaml
version: 2.1
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

{:.tab.dependencies.Server_2}
{% raw %}
```yaml
version: 2
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

Make note of the use of a `checksum` in the cache `key`. This is used to calculate when a specific dependency-management file (such as a `package.json` or `requirements.txt` in this case) _changes_, and so the cache will be updated accordingly. In the above example, the
[`restore_cache`]({{site.baseurl}}/configuration-reference#restore_cache) example uses interpolation to put dynamic values into the cache-key, allowing more control in what exactly constitutes the need to update a cache.

## Writing to the cache in workflows
{: #writing-to-the-cache-in-workflows }

Jobs in one workflow can share caches. This makes it possible to create race conditions in caching across different jobs in a workflow.

Cache is immutable on write. Once a cache is written for a specific key, for example, `node-cache-main`, it cannot be written to again.

### Caching race condition example 1
{: #caching-race-condition-example-1 }

Consider a workflow of 3 jobs, where Job3 depends on Job1 and Job2: `{Job1, Job2} -> Job3`. They all read and write to the same cache key.

In a run of the workflow, Job3 may use the cache written by Job1 _or_ Job2. Since caches are immutable, this would be whichever job saved its cache first.

This is usually undesirable, because the results are not deterministic. Part of the result depends on chance.

You can make this workflow deterministic by changing the job dependencies. For example, make Job1 and Job2 write to different caches, and Job3 loads from only one. Or ensure there can be only one ordering: `Job1 -> Job2 -> Job3`.

### Caching race condition example 2
{: #caching-race-condition-example-2 }

There are more complex cases where jobs can save using a dynamic key like {% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} and restore using a partial key match like `node-cache-`.

A race condition is still possible, but the details may change. For instance, the downstream job uses the cache from the upstream job that ran last.

Another race condition is possible when sharing caches between jobs. Consider a workflow with no dependency links: `Job1 -> Job2`. Job2 uses the cache saved from Job1. Job2 could sometimes successfully restore a cache, and sometimes report no cache is found, even when Job1 reports saving it. Job2 could also load a cache from a previous workflow. If this happens, this means Job2 tried to load the cache before Job1 saved it. This can be resolved by creating a workflow dependency: Job1 -> Job2. This forces Job2 to wait until Job1 has finished running.

## Using caching in monorepos
{: #using-caching-in-monorepos }

There are many different approaches to utilizing caching in monorepos. The following approach can be used whenever you need to manage a shared cache based on multiple files in different parts of your monorepo.

### Creating and building a concatenated `package-lock` file
{: #creating-and-building-a-concatenated-package-lock-file }

1. Add custom command to config:

      {% raw %}
      ```yaml
      commands:
        create_concatenated_package_lock:
          description: "Concatenate all package-lock.json files recognized by lerna.js into single file. File is used as checksum source for part of caching key."
          parameters:
            filename:
              type: string
          steps:
            - run:
                name: Combine package-lock.json files to single file
                command: npx lerna la -a | awk -F packages '{printf "\"packages%s/package-lock.json\" ", $2}' | xargs cat > << parameters.filename >>
      ```
      {% endraw %}

2. Use custom command in build to generate the concatenated `package-lock` file:

      {% raw %}
      ```yaml
          steps:
            - checkout
            - create_concatenated_package_lock:
                filename: combined-package-lock.txt
            ## Use combined-package-lock.text in cache key
            - restore_cache:
                keys:
                  - v3-deps-{{ checksum "package-lock.json" }}-{{ checksum "combined-package-lock.txt" }}
                  - v3-deps
      ```
      {% endraw %}

## Managing caches
{: #managing-caches }

### Clearing cache
{: #clearing-cache }

Caches cannot be cleared. If you need to generate a new set of caches you can update the cache key, similar to the previous example. You might wish to do this if you have updated language or build management tool versions.

Updating the cache key on save and restore steps in your `.circleci/config.yml` file will then generate new sets of caches from that point onwards. Please note that older commits using the previous keys may still generate and save cache, so it is recommended that you rebase after the 'config.yml' changes when possible.

If you create a new cache by incrementing the cache version, the "older" cache is still stored. It is important to be aware that you are creating an additional cache. This method will increase your storage usage. As a general best practice, you should review what is currently being cached and reduce your storage usage as much as possible.

**Tip:** Caches are immutable, so it is helpful to start all your cache keys with a version prefix, for example <code class="highlighter-rouge">v1-...</code>. This allows you to regenerate all of your caches just by incrementing the version in this prefix.
{: class="alert alert-info"}

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

* Dependency manager version change, for example, you change npm from 4 to 5.
* Language version change, for example, you change Ruby 2.3 to 2.4.
* Dependencies are removed from your project.

**Tip:** Beware when using special or reserved characters in your cache key (for example: <code class="highlighter-rouge">:, ?, &, =, /, #</code>), as they may cause issues with your build. Consider using keys within [a-z][A-Z] in your cache key prefix.
{: class="alert alert-info"}

### Cache size
{: #cache-size }

We recommend keeping cache sizes under 500MB. This is our upper limit for corruption checks. Above this limit, check times would be excessively long. You can view the cache size from the CircleCI Jobs page within the `restore_cache` step. Larger cache sizes are allowed, but may cause problems due to a higher chance of decompression issues and corruption during download. To keep cache sizes down, consider splitting them into multiple distinct caches.

### Viewing network and storage usage

For information on viewing your network and stoarage usage, and calculating your monthly network and storage overage costs, see the [Persisting Data]({{site.baseurl}}/persist-data/#managing-network-and-storage-use) page.

## Using keys and templates
{: #using-keys-and-templates }

A cache key is a _user-defined_ string that corresponds to a data cache. A cache key can be created by interpolating **dynamic values**. These are called **templates**. Anything that appears between curly braces in a cache key is a template. Consider the following example:

```shell
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

The above example outputs a unique string to represent this key. The example is using a [checksum](https://en.wikipedia.org/wiki/Checksum) to create a unique string that represents the contents of a `package-lock.json` file.

The example may output a string similar to the following:

```shell
myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ=
```

If the contents of the `package-lock` file were to change, the `checksum` function would return a different, unique string, indicating the need to invalidate the cache.

When choosing suitable templates for your cache `key`, remember that cache saving is not a free operation. It will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, include a `key` that generates a new cache only if something changes.

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

The following are examples of caching strategies for different goals:

 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - Cache is regenerated every time something is changed in `package-lock.json` file. Different branches of this project generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - Cache is regenerated every time something is changed in `package-lock.json` file. Different branches of this project generate separate cache keys.
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - Every build generates separate cache keys.

During step execution, the templates above are replaced by runtime values and use the resultant string as the `key`. The following table describes the available cache `key` templates:

Template | Description
----|----------
{% raw %}`{{ checksum "filename" }}`{% endraw %}{:.env_var} | A base64 encoded SHA256 hash of the given filename's contents, so that a new cache key is generated if the file changes. This should be a file committed in your repo. Consider using dependency manifests, such as `package-lock.json`, `pom.xml` or `project.clj`. The important factor is that the file does not change between `restore_cache` and `save_cache`, otherwise the cache is saved under a cache key that is different from the file used at `restore_cache` time.
{% raw %}`{{ .Branch }}`{% endraw %} | The VCS branch currently being built.
{% raw %}`{{ .BuildNum }}`{% endraw %} | The CircleCI job number for this build.
{% raw %}`{{ .Revision }}`{% endraw %} | The VCS revision currently being built.
{% raw %}`{{ .Environment.variableName }}`{% endraw %}{:.env_var} | The environment variable `variableName` (supports any environment variable [exported by CircleCI]({{site.baseurl}}/env-vars) or added to a specific [Context]({{site.baseurl}}/contexts), not any arbitrary environment variable).
{% raw %}`{{ epoch }}`{% endraw %} | The number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), also known as POSIX or UNIX epoch. This cache key is a good option if you need to ensure a new cache is always stored for each run.
{% raw %}`{{ arch }}`{% endraw %} | Captures OS and CPU (architecture, family, model) information. Useful when caching compiled binaries that depend on OS and CPU architecture, for example, `darwin-amd64-6_58` versus `linux-amd64-6_62`. See [supported CPU architectures]({{ site.baseurl }}/faq/#which-cpu-architectures-does-circleci-support).
{: class="table table-striped"}

### Further notes on using keys and templates
{: #further-notes-on-using-keys-and-templates }
{:.no_toc}

- A 900 character limit is imposed on each cache key. Be sure your key is shorter than this, otherwise your cache will not save.
- When defining a unique identifier for the cache, be careful about overusing template keys that are highly specific such as {% raw %}`{{ epoch }}`{% endraw %}. If you use less specific template keys such as {% raw %}`{{ .Branch }}`{% endraw %} or {% raw %}`{{ checksum "filename" }}`{% endraw %}, you increase the chance of the cache being used.
- Cache variables can also accept [parameters]({{site.baseurl}}/reusing-config/#using-parameters-in-executors), if your build makes use of them. For example: {% raw %}`v1-deps-<< parameters.varname >>`{% endraw %}.
- You do not have to use dynamic templates for your cache key. You can use a static string, and "bump" (change) its name to force a cache invalidation.

## Full example of saving and restoring cache
{: #full-example-of-saving-and-restoring-cache }

The following example demonstrates how to use `restore_cache` and `save_cache`, together with templates and keys in your `.circleci/config.yml` file.

This example uses a _very_ specific cache key. Making your caching key more specific gives you greater control over which branch or commit dependencies are saved to a cache. However, it is important to be aware that this can **significantly increase** your storage usage. For tips on optimizing your caching strategy, see the [Caching Strategies]({{site.baseurl}}/caching-strategy) page.

**Warning:** This example is only a _potential_ solution and might be unsuitable for your specific needs, and increase storage costs.
{: class="alert alert-warning"}

{% raw %}

```yaml
    docker:
      - image: customimage/ruby:2.3-node-phantomjs-0.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
          RACK_ENV: test
      - image: cimg/mysql:5.7
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: cp config/{database_circleci,database}.yml

      # Run bundler
      # Load installed gems from cache if possible, bundle install then save cache
      # Multiple caches are used to increase the chance of a cache hit

      - restore_cache:
          keys:
            - gem-cache-v1-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
            - gem-cache-v1-{{ arch }}-{{ .Branch }}
            - gem-cache-v1

      - run: bundle install --path vendor/bundle

      - save_cache:
          key: gem-cache-v1-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run: bundle exec rubocop
      - run: bundle exec rake db:create db:schema:load --trace
      - run: bundle exec rake factory_girl:lint

      # Precompile assets
      # Load assets from cache if possible, precompile assets then save cache
      # Multiple caches are used to increase the chance of a cache hit

      - restore_cache:
          keys:
            - asset-cache-v1-{{ arch }}-{{ .Branch }}-{{ .Environment.CIRCLE_SHA1 }}
            - asset-cache-v1-{{ arch }}-{{ .Branch }}
            - asset-cache-v1

      - run: bundle exec rake assets:precompile

      - save_cache:
          key: asset-cache-v1-{{ arch }}-{{ .Branch }}-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - public/assets
            - tmp/cache/assets/sprockets

      - run: bundle exec rspec
      - run: bundle exec cucumber
```

{% endraw %}

## Source caching
{: #source-caching }

It is possible and often beneficial to cache your git repository to save time in your `checkout` step, especially for larger projects. Here is an example of source caching:

{% raw %}

```yaml
    steps:
      - restore_cache:
          keys:
            - source-v1-{{ .Branch }}-{{ .Revision }}
            - source-v1-{{ .Branch }}-
            - source-v1-

      - checkout

      - save_cache:
          key: source-v1-{{ .Branch }}-{{ .Revision }}
          paths:
            - ".git"
```

{% endraw %}

In this example, `restore_cache` looks for a cache hit from the current git revision, then for a hit from the current branch, and finally for any cache hit, regardless of branch or revision. When CircleCI encounters a list of `keys`, the cache is restored from the first match. If there are multiple matches, the most recently generated cache is used.

If your source code changes frequently, we recommend using fewer, more specific keys. This produces a more granular source cache that updates more often as the current branch and git revision change.

Even with the narrowest `restore_cache` option ({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (for example, with [API-triggered builds](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) or when using workflows, where you might otherwise need to `checkout` the same repository once per workflow job.

However, it is worth comparing build times with and without source caching. `git clone` is often faster than `restore_cache`.

**NOTE**: The built-in `checkout` command disables git's automatic garbage collection. You might choose to manually run `git gc` in a `run` step prior to running `save_cache` to reduce the size of the saved cache.

## See also
{: #see-also }
{:.no_toc}

- [Persisting Data]({{site.baseurl}}/persist-data)
- [Caching Strategies]({{site.baseurl}}/caching-strategy)
- [Workspaces]({{site.baseurl}}/workspaces)
- [Artifacts]({{site.baseurl}}/artifacts)
- [Optimizations Overview]({{site.baseurl}}/optimizations)

