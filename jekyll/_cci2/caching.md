---
layout: classic-docs
title: "Caching Dependencies"
short-title: "Caching Dependencies"
description: "Caching Dependencies"
categories: [optimization]
order: 50
---

Caching is one of the most effective ways to make jobs faster on CircleCI. Automatic dependency caching is not available in CircleCI 2.0, so it is important to plan and implement your caching strategy to get the best performance. Manual configuration in 2.0 provides enables more advanced strategies and finer control. 

This document describes the manual caching available, the costs and benefits of a chosen strategies, and tips for using and avoiding problems with caching. **Note:** The Docker images used for CircleCI 2.0 job runs are automatically cached on infrastructure where possible. 

## <a name="dependency-caching"></a>Basic Example of Dependency Caching

The extra control and power in 2.0 manual dependency caching requires that you be explicit about what you cache and how you cache it. See the [save cache section](https://circleci.com/docs/2.0/configuration-reference/#save_cache) of the Writing Jobs and Steps document for the specific keys and requirements.

To save a cache of a file or directory, add the `save_cache` step to a job in your `.circleci/config.yml` file:

```
- save_cache:
    key: my-cache
    paths:
      - my-file.txt
      - my-project/my-dependencies-directory
```

The path for directories is relative to the `working_directory` of your job. You can specify an absolute path if you choose.

## Caching Libraries 

The dependencies that are important to cache during a job are the libraries that your project depends on. For example, cache the libraries the are installed with `pip` in Python or `npm` for Node.js. The various language dependency managers, for example `npm` or `pip`, each have their own paths where dependencies are installed. See our Language guides and demo projects for the specifics for your stack: <https://circleci.com/docs/2.0/demo-apps/>.

Tools that are not explicitly required for your project are best stored on the Docker image. The Docker image(s) pre-build by CircleCI have tools preinstalled that are generic for building projects using the language the image is focused on. For example the `circleci/ruby:2.4.1` image has useful tools like git, openssh-client and gzip preinstalled.  

## Using cache keys and template values to control what is cached and restored

This section describes using cache keys and template values to control what is cached and restored. Caching is a balance between reliability (not using an out-of-date or inappropriate cache) and getting maximum performance (using a full cache for every build).

In general it is safer to preserve reliability than to risk a corrupted build or build using stale dependencies very quickly. So, the ideal is to balance performance gains while maintaining high reliability. 

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

When storing a new cache, the `key` value may contain special template values:

Template | Description
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | the VCS branch currently being built
{% raw %}`{{ .BuildNum }}`{% endraw %} | the CircleCI build number for this build
{% raw %}`{{ .Revision }}`{% endraw %} | the VCS revision currently being built
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | the environment variable `variableName`
{% raw %}`{{ checksum "filename" }}`{% endraw %} | a base64 encoded SHA256 hash of the given filename's contents. This should be a file committed in your repo. Consider using dependency manifests, such as `package.json`, `pom.xml` or `project.clj`. The important factor is that the file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key that is different from the file used at `restore_cache` time.
{% raw %}`{{ epoch }}`{% endraw %} | the number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), also known as POSIX or Unix epoch.
{: class="table table-striped"}

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`.

### Choose a strategy by understanding how cache is restored

To decide how to save your cache, it's useful to first understand how CircleCI selects what will be restored. Here's an example of a restore step using multiple keys:

{% raw %}
```YAML
- restore_cache:
    keys:
      # Find a cache corresponding to this specific package.json checksum
      # when this file is changed, this key will fail
      - v1-projectname-npm-deps-{{ .Branch }}-{{ checksum "package.json" }}
      # Find a cache corresponding to any build in this branch, regardless of package.json
      # checksum.  The most recent one will be used.
      - v1-projectname-npm-deps-{{ .Branch }}
      # Find the most recent cache used from any branch
      - v1-projectname-npm-deps-
```
{% endraw %}

Note that the keys become less specific as we move through the list. As caches become less specific there is greater likelihood that the dependencies they contain are different from those that the current job requires. When your dependency tool runs (e.g. `npm install`) it will discover out-of-date dependencies and install the ones the current job specifies. This is 'partial cache' restore.

### Get clean caches when language or dependency management tool versions change

<div class="alert alert-info" role="alert">
<b>Tip:</b> Caches are immutable so it's useful to start all your cache keys with a version prefix, e.g. <code class="highlighter-rouge">v1-...</code>. That way you will be able to regenerate all your caches by incrementing the version in this prefix.
</div>

Using a strategy similar to what is shown above, you can 'clear' your cache when you change things in your project that need a new cache. For example:

* dependency manager version change (e.g. you change npm from 4 -> 5)
* language version change (e.g. you change ruby 2.3 -> 2.4)
* dependencies removed from your project

### `save_cache` template examples:**

Now you understand how cache is restored we can learn how to save caches. Here are some examples of strategies we've found to be useful:

 * {% raw %}`myapp-{{ checksum "package.json" }}`{% endraw %} - cache will be regenerated every time something is changed in `package.json` file, different branches of this project will generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package.json" }}`{% endraw %} - same as the previous one, but each branch will generate separate cache
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - every build will generate separate cache

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, because it will take some time to upload the cache to our storage. So it make sense to have a `key` that generates a new cache only if something actually changed and avoid generating a new one every build.

## Tips and potential pitfalls with dependency caching

### Partial cache restores are better than no cache restore

In most cases, partial cache hits are preferable to zero cache hits. If you get a cache miss, you’ll have to reinstall all your dependencies, which can result in a significant performance hit.

The alternative is to get a good chunk of your dependencies from an older cache instead of starting from scratch. Here are two suggestions to help with that:

#### 1. Define Multiple Keys for Cache Restores

Having multiple key candidates for restoring a cache increases the odds of a partial cache hit. See the example above in "Choose a strategy by understanding how cache is restored".

Be careful not to go overboard with multiple key candidates! Broadening your `restore_cache` scope to a wider history increases the risk of confusing failures.

For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

#### 2. Use `.Buildnum`, `.Revision` and `epoch` wisely

When defining a unique identifier for the cache, be careful about overusing template keys that are highly specific such as {% raw %}`{{ epoch }}`{% endraw %}. If you use less specific template keys such as {% raw %}`{{ .Branch }}`{% endraw %} or {% raw %}`{{ checksum "filename" }}`{% endraw %}, you’ll increase the odds of the cache being used.

### Use or create a checksum lock file based on the exact dependencies installed

If your language dependency manager has some for of 'lockfile' (e.g. `Gemfile.lock` or `yarn.lock`) then these make excellent candidates for cache keys.

An alternative is to do `ls -laR > your-deps-dir > deps_checksum` and reference it with {% raw %}{{ checksum "package.json" }}{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file you could install the dependencies within a virtualenv in the project root `venv` and then do `ls -laR > venv > python_deps_checksum`.

### Use Multiple Caches For Different Languages

Instead of trying to increase the probability of a partial cache hit, you could lower the cost of a cache miss by splitting your job across multiple caches.

Specifying multiple `restore_cache` steps with different keys shrinks each cache, reducing the performance hit of a cache miss.

At CircleCI, we routinely split caches by language type (npm, pip, bundler, etc.). However, this also means that you’d need to learn how each dependency manager works: where it stores its files, how it upgrades, and how it checks dependencies.

### Cache Expensive Steps

Certain languages and frameworks have more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Don’t cache everything, but _do_ keep an eye out for costly steps like compilation.

---
# <a name="source-caching"></a>Source Caching

Source caching is useful when you run into rate-limiting with your VCS hosting provider (e.g. GitHub). Although it's possible to cache your source using CircleCI, it’s often slower than pulling from GitHub.

**Note:** on CircleCI 2.0 there is no source caching by default.

Source caching can save a bit of time for smaller repos, when the pull is less than 30 seconds. The tradeoff is that you'll have a more complex `config.yml` to manage the source caching, and you'll only be saving a few seconds.

For larger repos, source caching will not speed up your jobs. In cases where it takes 30 seconds or more to clone from GitHub, the same source can take 2 minutes to restore from the cache stored on S3, and another 2 minutes to save everything to S3 for next time. So for large repos we don't recommend source caching, unless you're being rate-limited.

Some customers ask us why is it faster to checkout from Github than pull their cached source, which we host on S3 in the same AWS region as most build machines.

Compared to S3, Github is faster for read/write performance.  It's tempting to expect S3 to be faster for read performance to the same region.  But, it was designed with a certain balance for cost, read/write performance, and storage capacity.  Their focus is on nearly unlimited storage capacity.  Github, on the other hand, tunes their service for better read/write performance at the expense of very limited storage capacity.
