---

title: Test environment
layout: doc
popularity: 8
tags:
  - reference

---
{% assign versions = site.data.versions %}

Occasionally, bugs in tests arise because CircleCI's environment differs slightly from your local environment.
In the future, we plan to allow as much of this to be configurable as possible.
Please [contact us](mailto:sayhi@circleci.com) if some part of our environment is not suitable for you, and we will try to come up with a workaround.

If any version is not listed here, SSH into our build boxes to check it manually (and [contact us](mailto:sayhi@circleci.com)
so we can update this doc.

## Base

Our base image uses Ubuntu 12.04, with the addition of many packages
commonly used in web development.
Some specifics:

*   `Architecture: x86_64`
*   `Username: ubuntu`
*   `Ubuntu 12.04 (precise)`
*   `Kernel version: 3.2`
*   `git {{ versions.git }}`
*   `gcc {{ versions.default_gcc }}`
*   `g++ {{ versions.default_g_plusx2 }}`
*   `GNU make 3.81`

<h2 id="env-vars">Environmental Variables</h2>

See [this doc](/docs/environment-variables) for a thorough list of all available environment variables. Here are some of the most
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
We have `phantomjs {{ versions.phantomjs }}`, `casperjs {{ versions.casperjs }}`
and `libwebkit (2.2.1-1ubuntu4)` pre-installed, for Capybara and other headless browser interfaces.

Xvfb runs on port 99, and the appropriate `DISPLAY` environment variable has already been set.

Selenium-based tests are able to use Chrome stable channel (Chrome
{{ versions.Chrome }} with chromedriver {{ versions.chromedriver }}), and
Firefox {{ versions.Firefox }}. Chromedriver 23.0 is also available as
`chromedriver23`

<span class='label label-info'>Help</span>
[Check out our browser debugging docs.](/docs/troubleshooting-browsers)

## Docker

We're using a build of Docker which is patched to work in the CircleCI build environment.

The current version is `{{ versions.docker }}`.

We also pre-install Docker Compose `{{ versions.docker_compose }}`.

## Languages

### Ruby

We use RVM to give you access to a wide variety of Ruby
versions. Below are the versions of Ruby that we pre-install; you can specify versions not listed here (supported by RVM) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

You can
[choose the exact version you need directly, from the following list:](/docs/configuration#ruby-version)

{{ versions.ruby_versions | code-list }}

By default we use `Ruby {{ versions.default_ruby }}`
unless we detect that you need Ruby 1.8.7, in which case we'll use
`{{ versions.old_ruby }}`.
This is installed via RVM (stable).

We also have a number of Ruby commands pre-installed if you need to use them directly. They use Ruby
`{{ versions.default_ruby }}`.

*   `bundler {{ versions.bundler }}`
*   `cucumber {{ versions.cucumber }}`
*   `rspec {{ versions.rspec }}`
*   `rake {{ versions.rake }}`

### node.js

We use NVM to provide access to a wide range of node versions.
We currently have a small set of Node versions installed, but any version of Node that you specify in your
`circle.yml`
will install instantly, so it's easy to use any Node version.

Below are the versions of Node.js that we pre-install; you can specify versions not listed here (supported by NVM) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

{{ versions.node_versions | code-list }}

If you do not specify a version, we use `{{ versions.default_node }}`.

### Python

We use `python {{ versions.python }}` by default, although you can
[control the version in your circle.yml file](/docs/configuration#python-version).
Packages can be installed using `pip {{ versions.pip }}` and
`virtualenv {{ versions.virtualenv }}`.

Below are the versions of Python that we pre-install; you can specify versions not listed here (supported by pyenv) in your circle.yml file and we will install them as part of the build - this will add to your build time, however, if you let us know the version you are using we will update the VM accordingly.

{{ versions.python_versions | code-list }}

Please [contact us](mailto:sayhi@circleci.com) if other versions of Python would be useful to you.

### PHP

We use `php {{ versions.php }}`, by default, although you can
[control the version in your circle.yml file](/docs/configuration#php-version).
Packages can be installed using `composer`, `pear`, and `pecl`.

Supported versions are:

{{ versions.php_versions | code-list }}

Are you using a version of PHP that isn't included in this list?
If so, please [contact us](mailto:sayhi@circleci.com).

<h3 id="java">Java (and JVM based languages)</h3>

CircleCI has the following languages and tools installed:

{{ versions.java_packages | code-list }}

*   `ant {{ versions.ant }}`
*   `maven {{ versions.maven }}`
*   `gradle {{ versions.gradle }}`
*   `play {{ versions.play }}`

You can specify the following JVM versions in your `circle.yml` file:

--- TODO: Make a custom filter for this or something ---

* `oraclejdk8`
* `oraclejdk7` (default)
* `oraclejdk6`
* `openjdk7`
* `openjdk6`


### Scala

We track <a>http://repo.typesafe.com/typesafe/ivy-releases/org.scala-sbt/sbt-launch/</a> for recent Scala releases:

{{ versions.scala_versions | code-list }}

We also install some release candidate and beta versions (see the above URL for the complete list).

### Clojure

We use `lein {{ versions.lein }}`

You should specify your Clojure version in your `project.clj` file.

Other JVM-based languages should also work. please [contact us](mailto:sayhi@circleci.com)
let us know if you need anything else installed to run your JVM language of choice.

### Haskell

We have the following versions of GHC and tools installed:

{{ versions.ghc_versions | code-list }}
*   `cabal-install-1.18`
*   `happy-1.19.3`
*   `alex-3.1.3`

You can [specify which GHC version](/docs/configuration#ghc-version)
you'd like in your `circle.yml`.

<h3 id="other">Other languages</h3>

We currently have a number of packages installed to help you test your backend applications, including:

*   `golang {{ versions.golang }}`
*   `erlang {{ versions.erlang }}`

<h2 id="databases">Databases and Services</h2>

We have the following services automatically set up and running for your tests:

*   `couchdb` ({{ versions.couchdb }})
*   `memcached` ({{ versions.memcached }})
*   `mongodb` ({{ versions.mongodb }})
*   `mysql` ({{ versions.mysql }})
*   `postgresql` ({{ versions.postgresql }} with postgis 2.0 extensions)
*   `rabbitmq` ({{ versions.rabbitmq }})
*   `redis` ({{ versions.redis }})
*   `zookeeper` ({{ versions.zookeeper }})

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

*   `beanstalkd` ({{ versions.beanstalkd }})
*   `cassandra` ({{ versions.cassandra }})
*   `couchbase-server` ({{ versions.couchbase }})
*   `elasticsearch` ({{ versions.elasticsearch }})
*   `neo4j` ({{ versions.neo4j }})
*   `riak` ({{ versions.riak }})

In addition to all the databases and services listed above there are two
further services which require special handling. See the documentation for
each of them if you need them to support your tests.

*   `solr` ({{ versions.solr }}) - [Test with Solr](/docs/test-with-solr)
*   `sphinx` ({{ versions.sphinx }}) - [Test with Sphinx](/docs/test-with-sphinx)

## Integration Tools

Following integration tools are pre-installed.

*   `heroku/heroku-toolbelt` ({{ versions.heroku }})
*   `awscli` ({{ versions.awscli }})
*   `gcloud` ({{ versions.gcloud }})

## Build Toolchain

We have the following versions of GCC and G++ as well as some other build tools installed:

{{versions.gcc_g_plusx2_versions | code-list}}
*   `build-essential`  ({{ versions.build_essential }})

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
