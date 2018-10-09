---
layout: classic-docs
title: Customizing Build Environments
categories: [build-images]
description: How to install custom software
sitemap: false
---

The CircleCI environment provides the libraries, languages, and databases needed for most development work.
However, if you need to install a particular version of software&mdash;to match your production systems or to test backward compatibility, for example&mdash;or add custom code, CircleCI makes it easy to set up your environment to meet your testing needs.

## Installing via circle.yml

You can use your [circle.yml]( {{ site.baseurl }}/1.0/configuration/) file to run
arbitrary commands against your build environment. You have root
access to your environment via `sudo`, so you should be able to
customize it to your heart's content!

For example, to install smalltalk, add this to your `circle.yml`:

```
dependencies:
  pre:
    - sudo apt-get update; sudo apt-get install gnu-smalltalk
```

If you need to use a specific version of Redis that isn't provided by
`apt-get`, you can download and compile the needed version into your
home directory:

```
dependencies:
  pre:
    - wget http://redis.googlecode.com/files/redis-2.4.18.tar.gz
    - tar xvzf redis-2.4.18.tar.gz
    - cd redis-2.4.18 && make
```

### Caching

Naturally, downloading and compiling this custom software can take time, making your build longer.
To reduce the time spent installing dependencies, CircleCI will cache them between builds.
You can add arbitrary directories to this cache, allowing you to avoid the overhead of building your custom software during the build.

Tell CircleCI to save a cached copy using the
[`cache_directories` setting, in your `circle.yml` file]( {{ site.baseurl }}/1.0/configuration/#cache-directories).

```
dependencies:
  cache_directories:
    - redis-2.4.18   # relative to the build directory
```

### Avoid recompiles

To take advantage of this, you'll need to test for the presence of an existing cached install of your software.
If the software is already present, no need to build it.
You should test that your cache is there by including a
`test` command in the dependencies section in your `circle.yml` file.

```
dependencies:
  cache_directories:
    - redis-2.4.18
  pre:
    - if [[ ! -e redis-2.4.18/src/redis-server ]]; then wget http://redis.googlecode.com/files/redis-2.4.18.tar.gz && tar xzf redis-2.4.18.tar.gz && cd redis-2.4.18 && make; fi
```

Or, a little more cleanly:

```
dependencies:
  pre:
    - bash ./install-redis-2.4.18.sh
```

where `install-redis-2.4.18.sh` is a file checked into your repository, like the following:

```
set -x
set -e
if [ ! -e redis-2.4.18/src/redis-server ]; then
  wget http://redis.googlecode.com/files/redis-2.4.18.tar.gz
  tar xzf redis-2.4.18.tar.gz
  cd redis-2.4.18
  make;
fi
```
