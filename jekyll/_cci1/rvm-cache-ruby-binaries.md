---
layout: classic-docs
title: Caching Compiled Rubies with RVM
description: Caching Compiled Rubies with RVM
last_updated: January 25, 2017
sitemap: false
---

We get requests to install different Ruby versions into our images.  It takes some time to update, test, and roll out images into our build fleet, and our current Ubuntu 12 image has 81 preinstalled Ruby versions, in response to user requests.

If we don't have a pre-installed ruby version you want, there's an easy way to make this quickly available for your builds.  Here's an example of compiling Ruby 2.3.3 and caching it.

```
machine:
  post:
    - "echo Removing project .rvmrc, contents were: &&
        cat $CIRCLE_PROJECT_REPONAME/.rvmrc"
    - "rm $CIRCLE_PROJECT_REPONAME/.rvmrc"

    - "echo Removing project .ruby-version, contents were: &&
      cat $CIRCLE_PROJECT_REPONAME/.ruby-version"
    - "rm $CIRCLE_PROJECT_REPONAME/.ruby-version"

    - |
      if [[ -e ~/rvm_binaries/ruby-2.3.3.tar.bz2 ]]
      then
        rvm mount ~/rvm_binaries/ruby-2.3.3.tar.bz2
      else
        mkdir -p ~/rvm_binaries
        rvm install 2.3.3
        cd ~/rvm_binaries && rvm prepare 2.3.3
      fi
    - rvm --default use 2.3.3

dependencies:
  cache_directories:
    - ~/rvm_binaries

test:
  override:
    - gem list
    - ruby --version
```

Ruby installs could be ~30 seconds or 4-5 minutes (as is the case with ruby 2.3.3), depending on whether RVM has a pre-compiled binary available for your platform (Ubuntu 12/14, x86_64).  Once Ruby is compiled, `rvm prepare` makes a .tar.bz2 file that can be loaded by `rvm mount`.

A build with the above `circle.yml` will take 4-5 minutes to install Ruby the first time, and about 30 seconds after that.

This configuration also ensures that any `.rvmrc` and `.ruby-version` files are removed from the project before the dependencies phase.
