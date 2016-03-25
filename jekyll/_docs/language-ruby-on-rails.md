---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Ruby/Rails
short-title: Ruby/Rails
categories: [languages]
description: Continuous Integration and Continuous Deployment with Ruby/Rails
last_updated: March 12, 2014
---

CircleCI makes Rails testing simple. During each build, Circle looks at your code,
infers your build environment, and runs your tests.
The majority of the time, this just works&mdash;and works well.
Of course, it helps if your project adheres to standard practices
(i.e., "convention over configuration") for standard Ruby testing frameworks.

You can [add any custom configuration](/docs/configuration)
or set up deployment from a [circle.yml file](/docs/config-sample)
checked into your repo's root directory.

### Version

We use [RVM](https://rvm.io/) to provide access to a wide variety of
[Ruby versions](/docs/environment/#languages).
The default version of Ruby is either
{{ versions.default_ruby }} or {{ versions.old_ruby }},
whichever we think is best for your project.

You can manually set your Ruby version from your `circle.yml`:

```
machine:
  ruby:
    version: rbx-2.2.6
```

Our [test environment doc](/docs/environment)
covers more details about language versions and tools; it also explains how Circle
works with testing tools that require a browser.

### Dependencies

If Circle detects a Gemfile, we automatically run `bundle install`. Your
gems are automatically cached between builds to save time downloading dependencies.
You can add additional project dependencies from the
[dependencies section of your circle.yml](/docs/configuration/#dependencies):

```
dependencies:
  post:
    - bundle exec rake assets:precompile
```

### Databases

Circle manages all your database requirements,
such as running your `rake` commands for creating, loading,
and migrating your database.
We have pre-installed more than a dozen
[databases and queues](/docs/environment/#databases),
including PostgreSQL, MySQL, and MongoDB.
You can add custom database commands from the
[database section of your circle.yml](/docs/configuration/#database).

### Testing

Circle will automatically infer your test commands if you're
using Test::Unit, RSpec, Cucumber, Spinach, Jasmine, or Konacha.
You can also add additional commands from the
[test section of your circle.yml](/docs/configuration/#test):

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
For other testing libraries, we have instructions for [manually setting up parallelism](/docs/parallel-manual-setup).

### Deployment

Circle offers first-class support for deployment to your staging and production environments.
When your build is green, Circle will run the commands from the
[deployment section of your circle.yml](/docs/configuration/#deployment).

You can find more detailed instructions in the
[Continuous Deployment doc](/docs/introduction-to-continuous-deployment).

### Troubleshooting for Ruby on Rails

Our [Ruby troubleshooting](/docs/troubleshooting-ruby)
documentation has information about the following issues and problems:

*   [Do you need the latest version of Bundler?](/docs/bundler-latest)
*   [RSpec is failing but CircleCI reports my tests have passed](/docs/rspec-exit-codes)
*   [The Ruby debugger gem won't build](/docs/ruby-debugger-problems)
*   ["unable to obtain stable firefox connection in 60 seconds"](/docs/capybara-timeout)
*   [Git errors during a bundle install](/docs/git-bundle-install)
*   [rake db:schema:load fails](/docs/ruby-exception-during-schema-load)
*   [CircleCI is running the Ruby commands not specified in the config](/docs/not-specified-ruby-commands)
*   [CircleCI uses the wrong Ruby
    version](/docs/unrecognized-ruby-version)

If you are still having trouble, please [contact us](mailto:sayhi@circleci.com)
and we will be happy to help.
