---

title: Configuring CircleCI
layout: doc
popularity: 10
tags:
  - getting-started
  - reference
excerpt_separator: <!--more-->

---
{% assign versions = site.data.versions %}

CircleCI automatically infers your settings from your code, so CircleCI's normal processing works just fine in most circumstances.
When it doesn't, the `circle.yml` file makes it easy to tell CircleCI what you need.
This is a simple YAML file where you spell out any tweaks required for your web app.
You place the file in your git repo's root directory and CircleCI reads the file each time it runs a build.

<!--more-->

If you want a quick look at how to set up your `circle.yml`
file, check out our [sample file](/docs/config-sample).

Should you have a test failure, our [troubleshooting section](/docs/troubleshooting)
can likely tell you the best way to solve the problem.
If you find yourself repeatedly consulting this guide, please
[contact us](mailto:sayhi@circleci.com) and let us know what you're working on.
We'll try to make it easier for you.


<h2 id="phases">File Structure and Content</h2>

The `circle.yml` file is made up of six primary sections.
Each section represents a _phase_ of running your tests:

*   **machine**: adjusting the VM to your preferences and requirements
*   **checkout**: checking out and cloning your git repo
*   **dependencies**: setting up your project's language-specific dependencies
*   **database**: preparing the databases for your tests
*   **test**: running your tests
*   **deployment**: deploying your code to your web servers

The `circle.yml`
file contains another **general** section for general build-related configurations
that are not related to a specific phase, and an **experimental** section for early access
previews of configuration changes under consideration.

**Remember**: most projects won't need to specify anything for many of the phases.

The sections contain lists of bash commands.  If you don't specify
commands, CircleCI infers them from your code.  Commands are run in
the order they appear in the file; all test commands are run to
completion, but a non-zero exit code during setup will cause the
build to fail early.  You can modify which&mdash;and
when&mdash;commands are run by adding `override`,
`pre` and/or `post` to adjust CircleCI's
inferred commands.  Here's how it works:

*   **pre**: commands run before CircleCI's inferred commands
*   **override**: commands run instead of CircleCI's inferred commands
*   **post**:  commands run after CircleCI's inferred commands

Each command is run in a separate shell.
As such, they do not share an environment with their predecessors, so be aware that
`export foo=bar` in particular does not work.
If you'd like to set an environment variable globally, you can specify them in the
[Machine Configuration](#machine) section, described below.

### Modifiers

You can tweak individual commands by adding a modifier.
Allowed modifiers are:

*   **timeout**: if a command runs this many seconds without output, kill it (default:600s)
*   **pwd**: run commands using this value as the current working directory (default: the checkout directory named for your project, except in the `machine` and `checkout/pre` sections, where it defaults to `$HOME`.)
*   **environment**: a hash creating a list of environment variables set for this command
    (see [Machine configuration](#machine) for this modifier's properties when used in the `machine` section of the file)
*   **parallel**: (only used with commands in the `test` section)
    if you have [ manually set up parallelism](/docs/parallel-manual-setup), set this to true to run a command across all VMs
*   **files**:
    The files identified by the file list (or globs) will be appended to the
    command arguments. The files will be distributed across all containers
    running the build. Check
    [manual parallelism setup document](/docs/parallel-manual-setup#auto-splitting) for more details.
*   **background**: when "true", runs a command in the background.  It is similar to ending a shell command with '&amp;', but works correctly over ssh.  Useful for starting servers, which your tests will connect to.

Note that YAML is very strict about indentation each time you add a new property.
For that reason, modifiers must be indented one level from their command.
In the following example, we treat the `bundle install`
command as a key, with `timeout`, `environment`, and `pwd` as the command's hash values.

<pre>
dependencies:
  override:
    - bundle install:
        timeout: 240
        environment:
          foo: bar
          foo2: bar2
        pwd:
          test_dir
</pre>

<h2 id="machine">Machine configuration</h2>

The `machine` section enables you to configure the virtual machine that runs your tests.

Here's an illustration of the types of things you might typically set in the
`machine` section of the file.

<pre>
machine:
  timezone:
    America/Los_Angeles
  ruby:
    version: 1.9.3-p0-falcon

test:
  post:
    - bundle exec rake custom:test:suite
</pre>

This example sets the [time zone](#timezone),
chooses a [Ruby version](#ruby-version)
and patchset, and adds a custom test command
to run after the rest of your commands.

Although `pre` and `post` are supported in the `machine` section,
`override` is not. Note that custom environment variables are not
available during the `machine pre` section because they are setup in
the main `machine` section.

Here's how you might adjust the `circle.yml` file
using `pre` to install a different version of `phantomjs` than the
version CircleCI has installed.

<pre>
machine:
  pre:
    - curl -k -L -o phantomjs.tar.bz2 http://phantomjs.googlecode.com/files/phantomjs-1.8.2-linux-x86_64.tar.bz2
    - tar -jxf phantomjs.tar.bz2
</pre>

### Environment

You set environment variables for **all commands** in the build by adding
`environment` to the `machine` section.
Remember that CircleCI uses a new shell for every command; as previously mentioned
`export foo=bar` won't work. Instead, you must include something like this.

<pre>
machine:
  environment:
    foo: bar
    baz: 123
</pre>

If you don't want to use this method, there are
[a number of other options](/docs/environment-variables).

### Timezone

The machine's time zone is UTC by default.
You use `timezone`
to adjust to the same time zone as your _production_ server.
Changing the time to your _development_ machine's time zone is **asking for trouble**.

This modifier tells CircleCI to
overwrite `/etc/timezone`
and then restart all databases and services that rely on it.
This modifier supports any time zone listed in the IANA time zone database.
You can find this by looking in `/usr/share/zoneinfo/`
on your Unix machine or in the **TZ** column in
[Wikipedia's list of TZ database time zones](http://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

Be aware that some developers, especially those that collaborate across different time zones, do use UTC on their production servers.
This alternative can avoid horrific Daylight Saving Time (DST) bugs.

### Hosts

Sometimes you might need to add one or more entries to the `/etc/hosts` file to
assign various host names to an IP address. You can provide a mapping from
hostnames to IP addresses in the following manner:

<pre>
machine:
  hosts:
    dev.circleci.com: 127.0.0.1
    foobar: 1.2.3.4
</pre>

CircleCI will automatically update the `/etc/hosts` file with these values.
Hostnames [must be well formed](http://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names).
CircleCI will only accept hostnames that contain alpha-numeric characters,
hyphens (-) and dots (.).

### Ruby Version

CircleCI uses [RVM](https://rvm.io/) to manage Ruby versions.
We use the Ruby version you specify in your `.rvmrc`, your
`.ruby-version` file, or your Gemfile.
If you don't have one of these files, we'll use Ruby `{{ versions.default_ruby }}`
or `{{ versions.old_ruby }}`, whichever we think is better.
If you use a different Ruby version let CircleCI know by including that information in the
`machine` section. Here's an example of how you do that.

<pre>
machine:
  ruby:
    version: 1.9.3-p0-falcon
</pre>

The complete list of supported Ruby versions is found [here](/docs/environment#ruby).

<h3 id="node-version">Node.js version</h3>

CircleCI uses [NVM](https://github.com/creationix/nvm)
to manage Node versions. See
[supported Node versions](/docs/environment#nodejs)
for a complete list. If you do not specify a version, CircleCI uses
`{{ versions.default_node }}`.

Here's an example of how to set the version of Node.js to be used for
your tests.

<pre>
machine:
  node:
    version: 0.11.8
</pre>

### Java version

Here's an example of how to set the version of Java to be used for your tests.

<pre>
machine:
  java:
    version: openjdk7
</pre>

The default version of Java is `oraclejdk7`.
See [supported Java versions](/docs/environment#java)
for a complete list.

### PHP Version

CircleCI uses [php-build](https://github.com/CHH/php-build)
and [phpenv](https://github.com/CHH/phpenv)
to manage PHP versions.
Here's an example of how to set the version of PHP used for your tests.

<pre>
machine:
  php:
    version: 5.4.5
</pre>

See [supported PHP versions](/docs/environment#php) for a complete list.

### Python Version

CircleCI uses [pyenv](https://github.com/yyuu/pyenv)
to manage Python versions.
Here's an example of how to set the version of Python used for your tests.

<pre>
machine:
  python:
    version: 2.7.5
</pre>

See [supported Python versions](/docs/environment#python)
for a complete list.

### GHC version

You can choose from a
[number of available GHC versions](/docs/environment#haskell)
in your `circle.yml`:

<pre>
machine:
  ghc:
    version: 7.8.3
</pre>

### Other Languages

Our [test environment](/docs/environment) document has more configuration information about
[other languages](/docs/environment#other) including [Python](/docs/environment#python),
[Clojure](/docs/environment#clojure), [C/C++](/docs/environment#other),
[Golang](/docs/environment#other) and [Erlang](/docs/environment#other).

<h3 id="services">Databases and other services</h3>

CircleCI supports a large number of [databases and other services](/docs/environment#databases).
Most popular ones are running by default on our build machines (bound to localhost), including Postgres, MySQL, Redis and MongoDB.

You can enable other databases and services from the `services` section:

<pre>
machine:
  services:
    - cassandra
    - elasticsearch
    - rabbitmq-server
    - riak
    - beanstalkd
    - couchbase-server
    - neo4j
    - sphinxsearch

</pre>

<h2 id="checkout">Code checkout from GitHub</h2>

The `checkout` section is usually pretty vanilla, but we include examples of common things you might need to put in the section.
Because we don't read `circle.yml` until after the checkout phase, only `post` is supported in this section.

####  Example: Using Git Submodules

<pre>
checkout:
  post:
    - git submodule sync
    - git submodule update --init
</pre>

####  Example: overwriting configuration files on CircleCI

<pre>
checkout:
  post:
    - mv config/.app.yml config/app.yml
</pre>

<h2 id="dependencies">Project-specific dependencies</h2>

Most web programming languages and frameworks, including Ruby's bundler, npm for Node.js, and Python's pip, have some form of dependency specification;
CircleCI automatically runs commands to fetch such dependencies.

You can use `override`, `pre`, and/or `post` to modify `dependencies` commands.
Here are examples of common tweaks you might make in the `dependencies` section.

####  Example: Using NPM and Node.js

<pre>
dependencies:
  override:
    - npm install
</pre>

<h4 id="bundler">Example: using a specific version of bundler</h4>

<pre>
dependencies:
  pre:
    - gem uninstall bundler
    - gem install bundler --pre
</pre>

### Bundler Flags

If your project includes bundler (the dependency management program for Ruby), you can include
`without` to list dependency groups to be excluded from bundle install.
Here's an example of what that would look like.

<pre>
dependencies:
  bundler:
    without: [production, osx]
</pre>

<h3 id="cache-directories">Custom Cache Directories</h3>

CircleCI caches dependencies between builds.
To include any custom directories in our caching, you can use
`cache_directories` to list any additional directories you'd like cached between builds.
Here's an example of how you could cache two custom directories.

<pre>
dependencies:
  cache_directories:
    - "assets/cache"    # relative to the build directory
    - "~/assets/output" # relative to the user's home directory
</pre>

Caching happens after the dependency step, so the directories that are specified in `cache_directories` must be available before then.

Caches are private, and are not shared with other projects.

<h2 id="database">Database setup</h2>

Your web framework typically includes commands to create your database, install your schema, and run your migrations.
You can use `override`, `pre`, and/or `post` to modify `database` commands.
See [Setting up your test database](/docs/manually#databases) for more information.

If our inferred `database.yml` isn't working for you, you may need to `override` our setup commands (as shown in the following example).
If that is the case, please [contact us](mailto:sayhi@circleci.com)
and let Circle know so that we can improve our inference.

<pre>
database:
  override:
    - mv config/database.ci.yml config/database.yml
    - bundle exec rake db:create db:schema:load --trace
</pre>

FYI, you have the option of pointing to the location of your stored database config file using the `environment` modifier in the
`machine` section.
<pre>
machine:
  environment:
    DATABASE_URL: postgres://ubuntu:@127.0.0.1:5432/circle_test
</pre>

<h2 id="test">Running your tests</h2>

The most important part of testing is actually running the tests!

CircleCI supports the use of `override`, `pre`, and/or `post` in the `test` section.
However, this section has one minor difference: all test commands will run, even if one fails.
This allows our test output to tell you about all the tests that fail, not just the first error.

####  Example: running spinach after RSpec

<pre>
test:
  post:
    - bundle exec rake spinach:
        environment:
          RAILS_ENV: test
</pre>

####  Example: Running Phpunit on a Special Directory

<pre>
test:
  override:
    - phpunit my/special/subdirectory/tests
</pre>

CircleCI also supports the use of `minitest_globs`
(a list of file globs, using [Ruby's Dir.glob syntax](http://ruby-doc.org/core-2.0/Dir.html#glob-method))
that can list the file globs to be used during testing.

By default, when testing in parallel, CircleCI runs all tests in the test/unit, test/integration, and
test/functional directories. You can add `minitest_globs` to replace the
standard directories with your own.
This is needed only when you have additional or non-standard
test directories and you are testing in parallel with MiniTest.

####  Example: minitest_globs

<pre>
test:
  minitest_globs:
    - test/integration/**/*.rb
    - test/extra-dir/**/*.rb
</pre>

## Deployment

The `deployment`
section is optional. You can run commands to deploy to staging or production.
These commands are triggered only after a successful (green) build.

<pre>
deployment:
  production:
    branch: production
    commands:
      - ./deploy_prod.sh
  staging:
    branch: master
    commands:
      - ./deploy_staging.sh
</pre>

The `deployment`
section consists of multiple subsections. In the example shown above, there
are two&mdash;one named _production_ and one named _staging_.
Subsection names must be unique.
Each subsection can list multiple branches, but at least one of these fields must be
named _branch_. In instances of multiple branches, the first one that matches
the branch being built is the one that is run.
In the following example, if a developer pushes to any of the three branches listed, the script
`merge_to_master.sh` is run.

<pre>
deployment:
  automerge:
    branch: [dev_alice, dev_bob, dev_carol]
    commands:
      - ./merge_to_master.sh
</pre>

The _branch_ field can also specify regular expressions, surrounded with
`/` (e.g. `/feature_.*/`):

<pre>
deployment:
  feature:
    branch: /feature_.*/
    commands:
      - ./deploy_feature.sh
</pre>

You can also optionally specify a repository _owner_ in any deployment subsection.
This can be useful if you have multiple forks of the project, but only one should be
deployed. For example, a deployment subsection like this will only deploy if the project
belongs to "circleci", and other users can push to the master branch of their fork without
triggering a deployment:

<pre>
deployment:
  master:
    branch: master
    owner: circleci
    commands:
      - ./deploy_master.sh
</pre>

### Tags

In addition to deploying based on `branch`, you can deploy based on tags.

Normally, pushing a tag will not run a build.  If there is a
deployment configuration with a `tag` property that matches the name
of the tag you created, we will run the build and the deployment
section that matches.

[Cutting a release on
Github](https://help.github.com/articles/creating-releases/) creates a
tag and follows the same rules.

In the below example, pushing a tag named `release-v1.05` would
trigger a build & deployment.  Pushing a tag `qa-9502` would not
trigger a build.

<pre>
deployment:
  release:
    tag: /release-.*/
    owner: circleci
    commands:
      - ./deploy_master.sh
</pre>

Similar to the `branch` property, the `tag` property can be an exact
string or regex.  It can also be a list of exact matches or regexes.

A popular convention is to create tags like `v1.2.3` for the 1.2.3
version of your software.  The following regex will implement that
pattern:

<pre>
/v[0-9]+(\.[0-9]+)*/
</pre>

`v1`, `v1.2`, and `v1.2.3` (and so on) all match.


### SSH Keys

If deploying to your servers requires SSH access, you'll need to
upload the keys to CircleCI.
CircleCI's UI enables you to do this on your project's **Project Settings > SSH keys** page.
Add and then submit the one or more SSH keys needed
for deploying to your machines. If you leave the **Hostname** field blank,
the private key will be used for all hosts.

<h3 id="heroku-extra">Heroku</h3>

CircleCI also has first-class support for deploying to Heroku.
Specify the app you'd like to
`git push` to under `appname`.
Upon a successful build, we'll automatically deploy to the app in the section that matches the push, if there is one.

<pre>
deployment:
  staging:
    branch: master
    heroku:
      appname: foo-bar-123
</pre>

Setting up our deployment to Heroku requires one extra step.
Due to Heroku's architecture and security model, we need to deploy as a particular user.
A member of your project, possibly you, will need to register as that user.
CircleCI's UI enables you to do this on your project's **Project Settings > Heroku settings** page.

### Heroku With Pre or Post-Deployment Steps

If you want to deploy to Heroku and also run commands before or after the deploy, you must use the 'normal' deployment syntax.

<pre>
deployment:
    production:
      branch: production
      commands:
        - git push git@heroku.com:foo-bar-123.git $CIRCLE_SHA1:master
        - heroku run rake db:migrate --app foo-bar-123
</pre>

<h2 id="notify">Notifications</h2>

CircleCI sends personalized notifications by email.

In addition to these per-user emails, CircleCI sends notifications on a per-project basis.
CircleCI supports sending webhooks when your build completes.
CircleCI also supports HipChat, Campfire, Flowdock and IRC notifications; you configure these notifications from your project's
**Project Settings > Notifications ** page.

This example will POST a JSON packet to the specified URL.

<pre>
notify:
  webhooks:
    # A list of hook hashes, containing the URL field
    - url: https://example.com/hooks/circle
</pre>

The JSON packet is identical to the result of the
[Build API](/docs/api#build)
call for the same build, except that it is wrapped in a "payload" key:

<pre>
{
  "payload": {
    "vcs_url" : "https://github.com/circleci/mongofinil",
    "build_url" : "https://circleci.com/gh/circleci/mongofinil/22",
    "build_num" : 22,
    "branch" : "master",
    ...
  }
}
</pre>

There is also an experimental setting you can configure to specify black- or white-listing of branches
you want to get chat channel build notifications for in the
[per branch build notification](#per-branch-notifications) section.

<h2 id="branches">Specifying branches to build</h2>

CircleCI by default tests every push to _any_ branch in the repository.
Testing all branches maintains quality in all branches and adds
confidence when the branches are to be merged with default branch.

You may, however, blacklist branches from being built in CircleCI.  This example
excludes `gh-pages` from being built in circle:

<pre>
general:
  branches:
    ignore:
      - gh-pages # list of branches to ignore
      - /release\/.*/ # or ignore regexes
</pre>

You may also whitelist branches, so only whitelisted branches will trigger a build.
This example limit builds in circle to `master` and `feature-.*` branches:

<pre>
general:
  branches:
    only:
      - master # list of branches to build
      - /feature-.*/ # or regexes
</pre>

We discourage branch whitelisting, it means work-in-progress
code can go a long time without being integrated and tested and we've found
it leads to problems when that untested code gets merged.

`circle.yml` is per-branch configuration file, and the branch ignore list in one branch will
only affect that branch and no other one.

<h2 id="build-dir">Specifying Build Directory</h2>

Circle runs all commands on the repository root, by default.  However, if
you store your application code in a subdirectory instead of the root, you
can specify the build directory in circle.yml.  For example, to set the build
directory to `api` sub-directory, you can use the following configuration:

<pre>
general:
  build_dir: api
</pre>

Circle will run its inference as well as all build commands from that directory.

<h2 id="artifacts">Specifying Custom Artifacts Directories and Files</h2>

You can specify extra directories and files to be
[saved as artifacts](/docs/build-artifacts):

<pre>
general:
  artifacts:
    - "selenium/screenshots" # relative to the build directory
    - "~/simplecov" # relative to the user's home directory
    - "test.txt" # a single file, relative to the build directory
</pre>

<h2 id="experimental">Experimental Configuration</h2>

Our **experimental** section is a way of giving early previews of new configuration
options we are considering adding. These settings are liable to change without notice.

<h3 id="Per-Branch-Notifications">Per Branch Build Notification in Chat Channels</h3>

The only experimental setting available at this time is a black- and white-list mechanism
for chat channel build notifications based on the branch name.

The behavior of the "ignore" and "only" settings is the same as the black- and white-listing
of branches to build in the [Branches section](#branches).
Each setting takes a list of either strings or regexes; regexes are
specified with '/' around the value.

The following configuration will suppress any chat channel build notifications
for any build of a branch whose name starts with "dev" or "experiment", or which is
named "sandbox":

<pre>
experimental:
  notify:
    branches:
      ignore:
        - /dev.*/
        - /experiment.*/
        - sandbox
</pre>

Alternatively, you can only send notifications for branches which match a whitelist. The
following config will only send notices for the master branch and any branch starting
with "feature":

<pre>
experimental:
  notify:
    branches:
      only:
        - master
        - /feature-.*/
</pre>

You can combine them, in which case only branch names which do match
the whitelist *and* do not match the blacklist get notifications. So for:

<pre>
experimental:
  notify:
    branches:
      only:
        - /feature.*/
      ignore:
        - /feature\.experiment.*/
</pre>

a branch named "feature-1" will send a notification, but "feature.experiment-1" will not.

<h2 id="help">Need Anything Else?</h2>

We are adding support for configuring every part of your build.
If you need to tweak something that isn't currently supported, please
[contact us](mailto:sayhi@circleci.com)
and we'll figure out how to make it happen.
