---
layout: classic-docs
title: Git errors during a bundle install
description: Git errors during a bundle install
last_updated: Feb 3, 2013
sitemap: false
---

When your tests run, during the `bundle install` step, you might see something like this:

```
Fetching git@github.com:rails/rails
Git error: command `git clone 'git@github.com:rails/rails' "/home/ubuntu/circle-2/vendor/bundle/ruby/1.9.1/cache/bundler/git/rails-47ba0391b239cf6d20fc732cd925192bcf3430fc" --bare --no-hardlinks` in directory /home/ubuntu/circle-1 has failed.
Permission denied (publickey).
fatal: The remote end hung up unexpectedly
```

This happens because you have a git repository listed as a dependency in your Gemfile:

```
gem "rails", :github => "rails/rails"
```

If the repository is public, just change the dependency to use a
`https` url:

```
gem "rails", :github => "rails/rails"
```

If the repository is private, you will need to enable user keys
from your project's **Project Settings > Checkout SSH keys**
page.
