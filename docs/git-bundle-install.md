---

title: Git errors during a bundle install
layout: doc
tags:
  - troubleshooting
  - ruby

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
gem "rails", :git => "git://github.com/rails/rails.git"
```

If the repository is public, just change the dependency to use a
`https` url:

```
gem "rails", :git => "https://github.com/rails/rails"
```

If the repository is private, you will need to enable user keys
from your project's **Project Settings > Checkout SSH keys**
page.
