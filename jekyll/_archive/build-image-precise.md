---
layout: classic-docs
title: Ubuntu 12.04 (Precise)
categories: [build-images]
description: Ubuntu 12.04 (Precise)
changefreq: "yearly"
sitemap: false
---

<div class="alert alert-danger" markdown="1">
  <strong>Warning: </strong>Ubuntu 12.04 has been End-of-Life'd (EOL) by it's maintainer Canonical. Neither Canonical nor CircleCI are maintaining this image. We strongly suggest switching to CircleCI 2.0, or at the very least the [Ubuntu 14.04 image](https://circleci.com/docs/1.0/build-image-trusty/) for CircleCI 1.0. Read our announcement [here](https://circleci.com/blog/ubuntu-12-04-precise-build-image-end-of-life-warning/).
</div>

Occasionally, bugs in tests arise because CircleCI's environment differs slightly from your local environment.
In the future, we plan to allow as much of this to be configurable as possible.

## Base

Our base image uses Ubuntu 12.04, with the addition of many packages
commonly used in web development.
Some specifics:

*   `Architecture: x86_64`
*   `Username: ubuntu`
*   `Ubuntu 12.04 (precise)`
*   `Kernel version: 3.2`
*   `git {{ site.data.precise.versions.git }}`
*   `gcc {{ site.data.precise.versions.default_gcc }}`
*   `g++ {{ site.data.precise.versions.default_g_plusx2 }}`
*   `GNU make 3.81`

<h2 id="env-vars">Environmental Variables</h2>

See [this doc]( {{ site.baseurl }}/1.0/environment-variables/) for a thorough list of all available environment variables. Here are some of the most
useful ones:
<dl>
<dt>
`CIRCLECI=true`
</dt>
<dt>
`CI=true`
</dt>
<dt>
`DISPLAY=:99`
</dt>
<dt>
`CIRCLE_BRANCH`
</dt>
<dd>
The name of the branch being tested, such as 'master'
</dd>
<dt>
`CIRCLE_SHA1`
</dt>
<dd>
The SHA1 of the commit being tested
</dd>
<dt>
`CIRCLE_BUILD_NUM`
</dt>
<dd>
The build number, same as in circleci.com/gh/foo/bar/123
</dd>
<dt>
`CIRCLE_PROJECT_USERNAME`
</dt>
<dd>
The username of the github repo, 'foo' in github.com/foo/bar
</dd>
<dt>
`CIRCLE_PROJECT_REPONAME`
</dt>
<dd>
The repo name of the github repo, 'bar' in github.com/foo/bar
</dd>
<dt>
`CIRCLE_USERNAME`
</dt>
<dd>
The github login of the user who triggered the build
</dd>
</dl>

You can use the `CI` and `CIRCLECI`
environment variables in your program, if you need to have CI-specific behavior in you application.
Naturally, this is not recommended in principle, but it can occasionally be useful in practice.

<h2 id="browsers">Browsers and GUIs</h2>

CircleCI runs graphical programs in a virtual framebuffer, using xvfb.
This means programs like Selenium, Capybara, Jasmine, and other testing tools which require a browser will work perfectly, just like they do when you use them locally.
You do not need to do anything special to set this up.
We have `phantomjs {{ site.data.precise.versions.phantomjs }}`, `casperjs {{ site.data.precise.versions.casperjs }}`
and `libwebkit (2.2.1-1ubuntu4)` pre-installed, for Capybara and other headless browser interfaces.

Xvfb runs on port 99, and the appropriate `DISPLAY` environment variable has already been set.

Selenium-based tests are able to use Chrome stable channel (Chrome
{{ site.data.precise.versions.Chrome }} with chromedriver {{ site.data.precise.versions.chromedriver }}), and
Firefox {{ site.data.precise.versions.Firefox }}. Chromedriver 23.0 is also available as
`chromedriver23`

<span class='label label-info'>Help</span>
[Check out our browser debugging docs.]( {{ site.baseurl }}/1.0/troubleshooting-browsers/)

## Docker

We're using a build of Docker which is patched to work in the CircleCI build environment.

The current version is `{{ site.data.precise.versions.docker }}`.

We also pre-install Docker Compose `{{ site.data.precise.versions.docker_compose }}`.

## Languages

### Ruby

We use RVM to give you access to a wide variety of Ruby
versions. Below are the versions of Ruby that we pre-install; you can specify versions not listed here (supported by RVM) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

You can
[choose the exact version you need directly, from the following list:]( {{ site.baseurl }}/1.0/configuration/#ruby-version)

{% for version in site.data.precise.versions.ruby_versions %}
- `{{ version }}`
{% endfor %}

By default we use `Ruby {{ site.data.precise.versions.default_ruby }}`
unless we detect that you need Ruby 1.8.7, in which case we'll use
`{{ site.data.precise.versions.old_ruby }}`.
This is installed via RVM (stable).

We also have a number of Ruby commands pre-installed if you need to use them directly. They use Ruby
`{{ site.data.precise.versions.default_ruby }}`.

*   `gem {{ site.data.precise.versions.gem }}`
*   `bundler {{ site.data.precise.versions.bundler }}`
*   `cucumber {{ site.data.precise.versions.cucumber }}`
*   `rspec {{ site.data.precise.versions.rspec }}`
*   `rake {{ site.data.precise.versions.rake }}`

### Go

Version: `{{ site.data.precise.versions.golang }}`

### Node.js

We use NVM to provide access to a wide range of node versions.
We currently have a small set of Node versions installed, but any version of Node that you specify in your
`circle.yml`
will install instantly, so it's easy to use any Node version.

Below are the versions of Node.js that we pre-install; you can specify versions not listed here (supported by NVM) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

{% for version in site.data.precise.versions.node_versions %}
- `{{ version }}`
{% endfor %}

If you do not specify a version, we use `{{ site.data.precise.versions.default_node }}`.

### Python

We use `python {{ site.data.precise.versions.python }}` by default, although you can
[control the version in your circle.yml file]( {{ site.baseurl }}/1.0/configuration/#python-version).
Packages can be installed using `pip {{ site.data.precise.versions.pip }}` and
`virtualenv {{ site.data.precise.versions.virtualenv }}`.

Below are the versions of Python that we pre-install; you can specify versions not listed here (supported by pyenv) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

{% for version in site.data.precise.versions.python_versions %}
- `{{ version }}`
{% endfor %}


### PHP

We use `php {{ site.data.precise.versions.php }}`, by default, although you can
[control the version in your circle.yml file]( {{ site.baseurl }}/1.0/configuration/#php-version).
Packages can be installed using `composer`, `pear`, and `pecl`.

Supported versions are:

{% for version in site.data.precise.versions.php_versions %}
- `{{ version }}`
{% endfor %}

<h3 id="java">Java (and JVM based languages)</h3>

CircleCI has the following languages and tools installed:

{% for version in site.data.precise.versions.java_packages %}
- `{{ version.package }}`
{% endfor %}

*   `ant {{ site.data.precise.versions.ant }}`
*   `maven {{ site.data.precise.versions.maven }}`
*   `gradle {{ site.data.precise.versions.gradle }}`
*   `play {{ site.data.precise.versions.play }}`

You can specify the following JVM versions in your `circle.yml` file:

<!-- TODO: Make a custom filter for this or something -->

* `oraclejdk8`
* `oraclejdk7` (default)
* `oraclejdk6`
* `openjdk7`
* `openjdk6`


### Scala

The latest version of Scala available on 12.04 is:

{% for version in site.data.precise.versions.scala_versions %}
- `{{ version }}`
{% endfor %}

You can find the version available on our [14.04 buld image here](https://circleci.com/docs/1.0/build-image-trusty/).

### Clojure

We use `lein {{ site.data.precise.versions.lein }}`

You should specify your Clojure version in your `project.clj` file.

### Haskell

We have the following versions of GHC and tools installed:

{% for version in site.data.precise.versions.ghc_versions %}
- `{{ version }}`
{% endfor %}
*   `cabal-install-1.18`
*   `happy-1.19.3`
*   `alex-3.1.3`

You can [specify which GHC version]( {{ site.baseurl }}/1.0/configuration/#ghc-version)
you'd like in your `circle.yml`.

<h3 id="other">Other languages</h3>

We currently have a number of packages installed to help you test your backend applications, including:

*   `golang {{ site.data.precise.versions.golang }}`
*   `erlang {{ site.data.precise.versions.erlang }}`

<h2 id="databases">Databases and Services</h2>

We have the following services automatically set up and running for your tests:

*   `couchdb` ({{ site.data.precise.versions.couchdb }})
*   `memcached` ({{ site.data.precise.versions.memcached }})
*   `mongodb` ({{ site.data.precise.versions.mongodb }})
*   `mysql` ({{ site.data.precise.versions.mysql }})
*   `postgresql` ({{ site.data.precise.versions.postgresql }} with postgis 2.0 extensions)
*   `rabbitmq` ({{ site.data.precise.versions.rabbitmq }})
*   `redis` ({{ site.data.precise.versions.redis }})
*   `zookeeper` ({{ site.data.precise.versions.zookeeper }})

Both `postgresql` and `mysql` are set up to use the `ubuntu`
user, have a database called `circle_test` available, and don't require any password.
The other databases should not need any specific username or password, and should just work.

Several services are disabled by default because they're not
commonly used, or because of memory requirements. We try to
detect and enable them automatically, but in case
we fail (or don't have inference in your language), you can
enable them by adding to your circle.yml:

```
machine:
  services:
    - cassandra
```

The list of services that can be enabled this way is

*   `beanstalkd` ({{ site.data.precise.versions.beanstalkd }})
*   `cassandra` ({{ site.data.precise.versions.cassandra }})
*   `couchbase-server` ({{ site.data.precise.versions.couchbase }})
*   `elasticsearch` ({{ site.data.precise.versions.elasticsearch }})
*   `neo4j` ({{ site.data.precise.versions.neo4j }})
*   `riak` ({{ site.data.precise.versions.riak }})

In addition to all the databases and services listed above there are two
further services which require special handling. See the documentation for
each of them if you need them to support your tests.

*   `solr` ({{ site.data.precise.versions.solr }}) - [Test with Solr]( {{ site.baseurl }}/1.0/test-with-solr/)
*   `sphinx` ({{ site.data.precise.versions.sphinx }}) - [Test with Sphinx]( {{ site.baseurl }}/1.0/test-with-sphinx/)

## Integration Tools

Following integration tools are pre-installed.

*   `heroku/heroku-toolbelt` ({{ site.data.precise.versions.heroku }})
*   `awscli` ({{ site.data.precise.versions.awscli }})
*   `gcloud` ({{ site.data.precise.versions.gcloud }})

## Build Toolchain

We have the following versions of GCC and G++ as well as some other build tools installed:

{% for version in site.data.precise.versions.gcc_g_plusx2_versions %}
- `{{ version }}`
{% endfor %}
*   `build-essential`  ({{ site.data.precise.versions.build_essential }})

To switch GCC and GCC++ versions, you can add the following in circle.yml:

```
# To use GCC and G++ 4.9
machine:
  pre:
    - sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.6 10
    - sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.6 10
    - sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.9 20
    - sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.9 20
```

## Android

### SDK Tool

Version: `{{ site.data.precise.versions.android_sdk_tool }}`

### SDK Platform

{% for version in site.data.precise.versions.android_sdk_platforms %}
- `{{ version }}`
{% endfor %}

### Build Tools

{% for version in site.data.precise.versions.android_sdk_build_tools %}
- `{{ version }}`
{% endfor %}

### Emulator Images

{% for version in site.data.precise.versions.android_sdk_emulator_images %}
- `{{ version }}`
{% endfor %}

### Google APIs

{% for version in site.data.precise.versions.android_sdk_google_apis %}
- `{{ version }}`
{% endfor %}

## dpkg -l

The following is the output of `dpkg -l` from the latest build image.

{% for version in site.data.precise.versions.dpkg-l %}
- `{{ version }}`
{% endfor %}
