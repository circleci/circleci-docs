---
layout: classic-docs2
title: "Caching"
short-title: "Caching"
categories: []
order: 1000
---

- Caching strategies: Caching is really really subtle.  Using these tactics will make a big difference in cache performance:
  - Partial cache restores are usually what you want: partial cache-hits are preferable to zero cache-hits.  At least 80% of the time, it's better for to get X% of your dependencies from an older cache, rather than 0% from a cache-miss and re-install all dependencies.
    - cache-restore prefix matching, latest first: Our docs mention this with the `{{ epoch }}` key-component, but it applies to any and all key-components.  If you use `{{ Branch }}` or `{{ checksum "filename" }}`, without those, your job is more likely to cache-hit.
    - restore with "keys" not "key": for cache-restore, using "keys" with multiple candidates gives a higher chance of partial cache-hits.
      - our cache restore strategy on 1.0 was to use something like [ mycache-{{ .Branch }}, mycache-master ]
      - when restoring against multiple keys, start with more specific keys and go broader.  Example: [ mycache-{{ .Branch }}-{{ checksum "package.json" }}, mycache-{{ .Branch }} ]
  - Be aware of caching risks: Cache restoring can create confusing failures.  Broadening your cache-restore scope to a wider history increases this risk.
    - This might happen if, for example, you have a dependency cache with old dependency versions on another branch.  Perhaps you have dependencies for Node v6 on an upgrade branch, and your other branches are on Node v5.  A cache-restore that searches other branches might restore incompatible dependencies.

2.0 offers more flexibility than 1.0:
- each build can restore from multiple caches (you can have multiple cache-restore steps with different keys).  You can lower the cost of a cache-miss by shrinking the size of each cache.  While onboarding early customers, we routinely split caches into their language type (Npm, pip, bundler, etc).
  - this comes with the cost that you need to learn how each dependency manager works: where it stores its files, how it upgrades, and how it checks dependencies
- cache compiled steps where it makes sense: Scala and Elixir users have costly compilation steps.  Some Rails users compile their frontend assets in their build.
  - This is technically possible on 1.0, but taking Rails as an example, assets are built into the project directory.  The order of 1.0 build operations was fixed.  Caching happened after the machine phase and before the test phase.  Some users found this unintuitive, while others just found it too restricting: what if you only want to build assets after a successful test run?

- source caching is possible, but usually slower than pulling from Github.  We use S3 for caching, and file lookups and transfers are slower than Github clones for our large customers.  It's faster for small repos, when the pull is less than 30 seconds.  One might want a simpler circle.yml than save 5 seconds.  For large repos, it's 3-5x slower (30 seconds to clone from github, 2 minutes to restore from s3, 2 minutes to save to s3 for next time).
  - The one case you will want source caching is when you face rate-limiting from Github.  You'll know if you need this, as you have run into this problem on 1.0.  For the majority of users, this shouldn't be a concern.

