---
layout: classic-docs
title: "Caching Dependencies"
short-title: "Caching Dependencies"
description: "Caching Dependencies"
categories: [optimization]
order: 50
---

This document describes the manual caching available, the costs and benefits of a chosen strategies, and tips for avoiding problems with caching in the following sections:

* TOC
{:toc}

## Overview

---
layout: classic-docs
title: "Caching Dependencies"
short-title: "Caching Dependencies"
description: "Caching Dependencies"
categories: [optimization]
order: 50
---

Caching is one of the most effective ways to make jobs faster on CircleCI. Automatic dependency caching is not available in CircleCI 2.0, so it is important to plan and implement your caching strategy to get the best performance. Manual configuration in 2.0 enables more advanced strategies and finer control. However, the keys are simple to configure, for example, updating a cache if it changes, by using checksum of `pom.xml` with a cascading fallback:

{% raw %}
```		
		restore_cache:
		  keys:
		    - m2-{{ checksum pom.xml }}
		    - m2- # used if checksum fails
```
{% endraw %}

This document describes the manual caching available, the costs and benefits of a chosen strategies, and tips for avoiding problems with caching. **Note:** The Docker images used for CircleCI 2.0 job runs are automatically cached on the server infrastructure where possible. 

## Overview

A cache stores a hierarchy of files under a key. Use the cache to store data that makes your job faster, but in the case of a cache miss or zero cache restore the job will still run successfully, for example, by caching Npm, Gem, or Maven package  directories.

Caching is a balance between reliability (not using an out-of-date or inappropriate cache) and getting maximum performance (using a full cache for every build).

In general it is safer to preserve reliability than to risk a corrupted build or to build using stale dependencies very quickly. So, the ideal is to balance performance gains while maintaining high reliability. 

## Caching Libraries 

The dependencies that are most important to cache during a job are the libraries on which your project depends. For example, cache the libraries that are installed with `pip` in Python or `npm` for Node.js. The various language dependency managers, for example `npm` or `pip`, each have their own paths where dependencies are installed. See our Language guides and demo projects for the specifics for your stack: <https://circleci.com/docs/2.0/demo-apps/>.

Tools that are not explicitly required for your project are best stored on the Docker image. The Docker image(s) pre-built by CircleCI have tools preinstalled that are generic for building projects using the language the image is focused on. For example the `circleci/ruby:2.4.1` image has useful tools like git, openssh-client and gzip preinstalled.  

## Writing to the Cache
 
Cache is written in chronological order. Consider a workflow of Job1 -> Job2 -> Job3. If Job1 and Job3 write to the same cache key, a rerun of Job2 may use the changes written by Job3 because Job2 ran last. That is, any job that runs inside a project will always use the latest write. For example, when you increment versions of a Gem package, the `~/.gem` contains both the old and new versions and the cache is made more useful by the addition of data.

## Restoring Cache

To decide how to save your cache, it is useful to first understand that CircleCI selects what will be restored in the order in which they are listed in the special `restore_cache` step. Each cache key is namespaced to the project and retrieval is prefix-matched. As caches become less specific going down the list in the following example, there is greater likelihood that the dependencies they contain are different from those that the current job requires. When your dependency tool runs (for example, `npm install`) it will discover out-of-date dependencies and install those the current job specifies. This is also referred to as *partial cache* restore. 

Here's another example of a `restore_cache` step with two keys:

{% raw %}
```YAML
- restore_cache:
    keys:
      # Find a cache corresponding to this specific package.json checksum
      # when this file is changed, this key will fail
      - v1-npm-deps-{{ checksum "package.json" }}
      # Find the most recent cache used from any branch
      - v1-npm-deps
```
{% endraw %}

### Clearing Cache 

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example.   

<div class="alert alert-info" role="alert">
<b>Tip:</b> Caches are immutable so it is useful to start all your cache keys with a version prefix, for example <code class="highlighter-rouge">v1-...</code>. This enables you to regenerate all of your caches by incrementing the version in this prefix.
</div>

For example:

* Dependency manager version change, for example, you change npm from 4 to 5
* Language version change, for example, you change ruby 2.3 to 2.4
* Dependencies are removed from your project

## <a name="dependency-caching"></a>Basic Example of Dependency Caching

The extra control and power in CircleCI 2.0 manual dependency caching requires that you be explicit about what you cache and how you cache it. See the [save cache section](https://circleci.com/docs/2.0/configuration-reference/#save_cache) of the Writing Jobs and Steps document for additional examples.

To save a cache of a file or directory, add the `save_cache` step to a job in your `.circleci/config.yml` file:

```
- save_cache:
    key: my-cache
    paths:
      - my-file.txt
      - my-project/my-dependencies-directory
```

The path for directories is relative to the `working_directory` of your job. You can specify an absolute path if you choose.

## Using Keys and Templates

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, it will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, have a `key` that generates a new cache only if something actually changes.

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

Following are some examples of caching strategies for different goals:

 * {% raw %}`myapp-{{ checksum "package.json" }}`{% endraw %} - Cache will be regenerated every time something is changed in `package.json` file, different branches of this project will generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package.json" }}`{% endraw %} - Cache will be regenerated every time something is changed in `package.json` file, different branches of this project will generate the separate cache keys.
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - Every build will generate separate cache keys.
 
During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`. The following table describes the available cache `key` templates:

Template | Description
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | the VCS branch currently being built
{% raw %}`{{ .BuildNum }}`{% endraw %} | the CircleCI build number for this build
{% raw %}`{{ .Revision }}`{% endraw %} | the VCS revision currently being built
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | the environment variable `variableName`
{% raw %}`{{ checksum "filename" }}`{% endraw %} | a base64 encoded SHA256 hash of the given filename's contents, so that a new cache key is generated if the file changes. This should be a file committed in your repo. Consider using dependency manifests, such as `package.json`, `pom.xml` or `project.clj`. The important factor is that the file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key that is different from the file used at `restore_cache` time.
{% raw %}`{{ epoch }}`{% endraw %} | the number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), also known as POSIX or Unix epoch.
{: class="table table-striped"}

**Note:** When defining a unique identifier for the cache, be careful about overusing template keys that are highly specific such as {% raw %}`{{ epoch }}`{% endraw %}. If you use less specific template keys such as {% raw %}`{{ .Branch }}`{% endraw %} or {% raw %}`{{ checksum "filename" }}`{% endraw %}, you’ll increase the odds of the cache being used. But, there are tradeoffs as described in the following section.

### Full Example of Saving and Restoring Cache

The following example demonstrates how to use `restore_cache` and `save_cache` together with templates and keys in your `.circleci/config.yml` file.

{% raw %}
```YAML
docker:
  - image: customimage/ruby:2.3-node-phantomjs-0.0.1
    environment:
      RAILS_ENV: test
      RACK_ENV: test
  - image: circleci/mysql:5.6

steps:
  - checkout
  - run: cp config/{database_circleci,database}.yml

  # Run bundler
  # Load installed gems from cache if possible, bundle install then save cache
  # Multiple caches are used to increase the chance of a cache hit
  - restore_cache:
      keys:
        - gem-cache-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - gem-cache-{{ .Branch }}
        - gem-cache
  - run: bundle install --path vendor/bundle
  - save_cache:
      key: gem-cache-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
      paths:
        - vendor/bundle
  - save_cache:
      key: gem-cache-{{ .Branch }}
      paths:
        - vendor/bundle
  - save_cache:
      key: gem-cache
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
        - asset-cache-{{ .Branch }}-{{ checksum "VERSION" }}
        - asset-cache-{{ .Branch }}
        - asset-cache
  - run: bundle exec rake assets:precompile
  - save_cache:
      key: asset-cache-{{ .Branch }}-{{ checksum "VERSION" }}
      paths:
        - public/assets
        - tmp/cache/assets/sprockets
  - save_cache:
      key: asset-cache-{{ .Branch }}
      paths:
        - public/assets
        - tmp/cache/assets/sprockets
  - save_cache:
      key: asset-cache
      paths:
        - public/assets
        - tmp/cache/assets/sprockets


  - run: bundle exec rspec
  - run: bundle exec cucumber
  ```
{% endraw %}

## Caching Strategy Tradeoffs 

In cases where the build tools for your language include elegant handling of dependencies, partial cache restores may be preferable to zero cache restores for performance reasons. If you get a zero cache restore, you have to reinstall all of your dependencies, which can result in reduced performance.  One alternative is to get a large percentage of your dependencies from an older cache instead of starting from zero.

However, for other types of languages, partial caches carry the risk of creating code dependencies that are not aligned with your declared dependencies and do not break until you run a build without a cache. If the dependencies change infrequently, consider listing the zero cache restore key first. Then, track the costs over time. If the performance costs of zero cache restores (also referred to as a *cache miss*) prove to be significant over time, only then consider adding a partial cache restore key.

Listing multiple keys for restoring a cache increases the odds of a partial cache hit. However, broadening your `restore_cache` scope to a wider history increases the risk of confusing failures. For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

### Using a Lock File

Language dependency manager lockfiles (for example, `Gemfile.lock` or `yarn.lock`) may be a useful cache key.

An alternative is to do `ls -laR your-deps-dir > deps_checksum` and reference it with {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file you could install the dependencies within a virtualenv in the project root `venv` and then do `ls -laR venv > python_deps_checksum`.

### Using Multiple Caches For Different Languages

It is also possible to lower the cost of a cache miss by splitting your job across multiple caches. By specifying multiple `restore_cache` steps with different keys, each cache is reduced in size thereby reducing the performance impact of a cache miss. Consider splitting caches by language type (npm, pip, or bundler) if you know how each dependency manager stores its files, how it upgrades, and how it checks dependencies.

### Caching Expensive Steps

Certain languages and frameworks have more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Do not cache everything, but _do_ consider caching for costly steps like compilation.
