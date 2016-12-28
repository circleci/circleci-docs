---
layout: classic-docs
title: "Continuous Integration and Continuous Deployment with Ruby/Rails"
short-title: "Ruby/Rails"
categories: [languages]
description: "Continuous Integration and Continuous Deployment with Ruby/Rails"
---

CircleCI makes Rails testing simple. During each build, Circle looks at your code,
infers your build environment, and runs your tests.
The majority of the time, this just works&mdash;and works well.
Of course, it helps if your project adheres to standard practices
(i.e., "convention over configuration") for standard Ruby testing frameworks.

You can [add any custom configuration]({{site.baseurl}}/configuration/)
or set up deployment from a [circle.yml file]({{site.baseurl}}/config-sample/)
checked into your repo's root directory.

### Version

We have many versions of Ruby pre-installed on [Ubuntu 12.04]({{ site.baseurl }}/build-image-precise/#ruby) and [Ubuntu 14.04]({{ site.baseurl }}/build-image-trusty/#ruby) build images.

If you don't want to use the default, you can specify your version in `circle.yml`:

```
machine:
  ruby:
    version: 2.4.0
```

In the current version of CircleCI, we use `rvm` to manage and install different versions of Ruby. This has a couple of side-effects that users should be aware of.

First, if the version specified in `circle.yml` isn't available then rvm will try to install it for you. If RVM cannot find a pre-compiled binary from the available mirrors, then it will download and compiled from source. Since, fetching the binary each time from a number of possible mirrors can often fail due to network instability; we highly recommend to cache this file. Please see the following guide on discuss in order to [cache a pre-compiled Ruby binary](https://discuss.circleci.com/t/caching-compiled-rubies-with-rvm/3636) and improve build performance and reliability.

Second, whenever the build changes into your project directory, RVM will try to read either `.rvmrc` or `.ruby-version` via the `cd` auto hook. In order to avoid this, and the aforementioned behavior, we recommend to remove these files by doing:

```
rm $CIRCLE_PROJECT_REPONAME/.ruby-version
```

Last, you can configure RVM to not install versions of Ruby that don't exist on the system by doing:

```
echo 'export rvm_install_on_use_flag=0' >> /home/ubuntu/.rvmrc
```

### Dependencies

If Circle detects a Gemfile, we automatically run `bundle install`. Your
gems are automatically cached between builds to save time downloading dependencies.
You can add additional project dependencies from the
[dependencies section of your circle.yml]({{site.baseurl}}/configuration/#dependencies):

```
dependencies:
  post:
    - bundle exec rake assets:precompile
```

The default inferred step for Bundler is `bundle check || bundle install`. For reasons, we use `check` prior to `install` in order to skip unnecessary steps inherited from the `bundle install` command when all depedencies are cached or otherwise already installed and available on the system.

### Databases

Circle manages all your database requirements,
such as running your `rake` commands for creating, loading,
and migrating your database.
We have pre-installed more than a dozen databases and queues,
including PostgreSQL, MySQL, and MongoDB.
You can add custom database commands from the
[database section of your circle.yml]({{site.baseurl}}/configuration/#database).

### Testing

Circle will automatically infer your test commands if you're
using Test::Unit, RSpec, Cucumber, Spinach, Jasmine, or Konacha.
You can also add additional commands from the
[test section of your circle.yml]({{site.baseurl}}/configuration/#test):

```
test:
  post:
    - bundle exec rake test:custom
```

### Testing in Parallel

Should you need faster testing, Circle can automatically split your
tests and run them in parallel across multiple machines.
You can enable parallelism on your project's **Project Settings > Parallelism**
page in the Circle UI.

Circle can automatically split tests for RSpec, Cucumber, and Test::Unit.
For other testing libraries, we have instructions for [manually setting up parallelism]({{site.baseurl}}/parallel-manual-setup/).

### Deployment

Circle offers first-class support for deployment to your staging and production environments.
When your build is green, Circle will run the commands from the
[deployment section of your circle.yml]({{site.baseurl}}/configuration/#deployment).

You can find more detailed instructions in the
[Continuous Deployment doc]({{site.baseurl}}/introduction-to-continuous-deployment/).

### Troubleshooting for Ruby on Rails

Our [Ruby troubleshooting]({{site.baseurl}}/troubleshooting-ruby/)
documentation has information about the following issues and problems:

*   [Do you need the latest version of Bundler?]({{site.baseurl}}/bundler-latest/)
*   [RSpec is failing but CircleCI reports my tests have passed]({{site.baseurl}}/rspec-exit-codes/)
*   [The Ruby debugger gem won't build]({{site.baseurl}}/ruby-debugger-problems/)
*   ["unable to obtain stable firefox connection in 60 seconds"]({{site.baseurl}}/capybara-timeout/)
*   [Git errors during a bundle install]({{site.baseurl}}/git-bundle-install/)
*   [rake db:schema:load fails]({{site.baseurl}}/ruby-exception-during-schema-load/)
*   [CircleCI is running the Ruby commands not specified in the config]({{site.baseurl}}/not-specified-ruby-commands/)
*   [CircleCI uses the wrong Ruby
    version]({{site.baseurl}}/unrecognized-ruby-version/)
