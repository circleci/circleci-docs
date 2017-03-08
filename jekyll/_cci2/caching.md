---
layout: classic-docs2
title: "Caching in CircleCI"
short-title: "Caching"
categories: [configuring-jobs]
order: 2
---

Caching is one of the most effective ways to reduce job times, but it can also be subtle. This article will outline some strategies you can use to increase caching effectiveness in CircleCI.

## Partial Cache Restores

In most cases, partial cache hits are preferable to zero cache hits. If you get a cache miss, you’ll have to reinstall all your dependencies, which can result in a significant performance hit.

The alternative, then, is to get a good chunk of your dependencies from an older cache instead of starting from scratch. Here are a few specific ways you can do that:

### Use Epoch Wisely

When defining a unique identifier for the cache, be careful about overusing {% raw %}`{{ epoch }}`{% endraw %}. If you limit yourself to {% raw %}`{{ .Branch }}`{% endraw %} or {% raw %}`{{ checksum "filename" }}`{% endraw %}, you’ll increase the odds of a job hitting the cache.

### Define Multiple Keys for Cache Restores

Having multiple key candidates for restoring a cache increases the odds of a partial cache hit. Instead of:

{% raw %}
```YAML
- restore_cache:
    key: projectname-{{ .Branch }}
```
{% endraw %}

try:
{% raw %}
```YAML
- restore_cache:
    keys:
      - projectname-{{ .Branch }}-{{ checksum "package.json" }}
      - projectname-{{ .Branch }}
      - projectname-master
```
{% endraw %}

Note that the keys become less specific as we move through the list.

Be careful not to go overboard with multiple key candidates! Broadening your `restore_cache` scope to a wider history increases the risk of confusing failures.

For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

## Multiple Caches

Instead of trying to increase the probability of a partial cache hit, you could lower the cost of a cache miss by splitting your job across multiple caches.

Specifying multiple `restore_cache` steps with different keys shrinks each cache, reducing the performance hit of a cache miss.

At CircleCI, we routinely split caches by language type (npm, pip, bundler, etc.). However, this also means that you’d need to learn how each dependency manager works: where it stores its files, how it upgrades, and how it checks dependencies.

## Cache Expensive Steps

Certain languages and frameworks have more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Obviously, don’t cache everything, but _do_ keep an eye out for costly steps like compilation.

## Source Caching

Source caching is useful when you run into rate-limiting with your VCS hosting provider (e.g. GitHub). Although it's possible to cache your source using CircleCI, it’s often slower than pulling from GitHub.

Source caching can save a bit of time for smaller repos, when the pull is less than 30 seconds. The tradeoff is that you'll have a more complex `config.yml` to manage the source caching, and you'll only be saving a few seconds.

For larger repos, source caching will not speed up your jobs. In cases where it takes 30 seconds or more to clone from GitHub, the same source can take 2 minutes to restore from the cache stored on S3, and another 2 minutes to save everything to S3 for next time. So for large repos we don't recommend source caching, unless you're being rate-limited.
