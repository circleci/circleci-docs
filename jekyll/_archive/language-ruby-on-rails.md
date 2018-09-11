---
layout: classic-docs
title: "Continuous Integration and Continuous Deployment with Ruby/Rails"
short-title: "Ruby/Rails"
categories: [languages]
description: "Continuous Integration and Continuous Deployment with Ruby/Rails"
sitemap: false
---

CircleCI makes Rails testing simple. During each build, CircleCI looks at your code,
infers your build environment, and runs your tests.
The majority of the time, this just works&mdash;and works well.
Of course, it helps if your project adheres to standard practices
(i.e., "convention over configuration") for standard Ruby testing frameworks.

You can [add any custom configuration]( {{ site.baseurl }}/1.0/configuration/)
or set up deployment from a [circle.yml file]( {{ site.baseurl }}/1.0/config-sample/)
checked into your repo's root directory.

### Version

We have many versions of Ruby pre-installed on [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/#ruby) and [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/#ruby) build images.

If you don't want to use the default, you can specify your version in `circle.yml`:

```
machine:
  ruby:
    version: 2.4.0
```

In the current version of CircleCI, we use RVM to manage and install different versions of Ruby. This has a couple of side-effects:

First, if the version specified in `circle.yml` isn't available then `rvm` will try to install it. If RVM cannot find a pre-compiled binary from available mirrors, it will download and compiled from source. Since fetching the binary from several possible mirrors is prone to failure caused by unstable networks, we highly recommend caching this file. To do this, please read our guide on how to [cache a pre-compiled Ruby binary]( {{ site.baseurl }}/1.0/rvm-cache-ruby-binaries/) to improve build performance/reliability.

Second, whenever the build changes into your project directory, RVM will try to read either `.rvmrc` or `.ruby-version` via the `cd` auto hook. To avoid this and the aforementioned behavior, we recommend removing these files by running:

```
rm $CIRCLE_PROJECT_REPONAME/.ruby-version
```

If RVM insists on installing certain versions, you can configure RVM to not install Ruby versions that don't exist on the system:

```
echo 'export rvm_install_on_use_flag=0' >> /home/ubuntu/.rvmrc
```

### Dependencies

If CircleCI detects a Gemfile, we automatically run `bundle install`. Your
gems are automatically cached between builds to save time downloading dependencies.
You can add additional project dependencies from the
[dependencies section of your circle.yml]( {{ site.baseurl }}/1.0/configuration/#dependencies):

```
dependencies:
  post:
    - bundle exec rake assets:precompile
```

The default inferred step for Bundler is `bundle check || bundle install`. For reasons, we use `check` prior to `install` in order to skip unnecessary steps inherited from the `bundle install` command when all dependencies are cached or otherwise already installed and available on the system.

If running `bundle install` manually within the dependencies override, caching will not work; it will be necessary to specify `bundle install --path=vendor/bundle --jobs=4 --retry=3` within your config.

### Databases

CircleCI manages all your database requirements,
such as running your `rake` commands for creating, loading,
and migrating your database.
We have pre-installed more than a dozen databases and queues,
including PostgreSQL, MySQL, and MongoDB.
You can add custom database commands from the
[database section of your circle.yml]( {{ site.baseurl }}/1.0/configuration/#database).

### Testing

CircleCI will automatically infer your test commands if you're
using Test::Unit, RSpec, Cucumber, Spinach, Jasmine, or Konacha.
You can also add additional commands from the
[test section of your circle.yml]( {{ site.baseurl }}/1.0/configuration/#test):

```
test:
  post:
    - bundle exec rake test:custom
```

### Testing in Parallel

Should you need faster testing, CircleCI can automatically split your
tests and run them in parallel across multiple machines.
You can enable parallelism on your project's **Project Settings > Parallelism**
page in the CircleCI UI.

CircleCI can automatically split tests for RSpec, Cucumber, and Test::Unit.
For other testing libraries, we have instructions for [manually setting up parallelism]( {{ site.baseurl }}/1.0/parallel-manual-setup/).

### Deployment

CircleCI offers first-class support for deployment to your staging and production environments.
When your build is green, CircleCI will run the commands from the
[deployment section of your circle.yml]( {{ site.baseurl }}/1.0/configuration/#deployment).

You can find more detailed instructions in the
[Continuous Deployment doc]( {{ site.baseurl }}/1.0/introduction-to-continuous-deployment/).

### Troubleshooting for Ruby on Rails

Our [Ruby troubleshooting]( {{ site.baseurl }}/1.0/troubleshooting-ruby/)
documentation has information about the following issues and problems:

*   [Do you need the latest version of Bundler?]( {{ site.baseurl }}/1.0/bundler-latest/)
*   [RSpec is failing but CircleCI reports my tests have passed]( {{ site.baseurl }}/1.0/rspec-exit-codes/)
*   ["unable to obtain stable firefox connection in 60 seconds"]( {{ site.baseurl }}/1.0/capybara-timeout/)
*   [Git errors during a bundle install]( {{ site.baseurl }}/1.0/git-bundle-install/)
*   [rake db:schema:load fails]( {{ site.baseurl }}/1.0/ruby-exception-during-schema-load/)
*   [CircleCI is running the Ruby commands not specified in the config]( {{ site.baseurl }}/1.0/not-specified-ruby-commands/)
*   [CircleCI uses the wrong Ruby
    version]( {{ site.baseurl }}/1.0/unrecognized-ruby-version/)
