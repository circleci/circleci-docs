---
layout: classic-docs
title: Generating Code Coverage Metrics in CircleCI 1.0
short-title: Generating Code Coverage Metrics
categories: [configuration-tasks]
description: Generating code coverage metrics
order: 50
sitemap: false
---

Code Coverage tells you how much of your application is tested.

CircleCI provides a number of different options for code coverage reporting,
using built-in CircleCI features combined with open source libraries,
or using partners.

## See coverage in CircleCI

It's straightforward to see simple coverage results from your build.
Simply add a coverage library to your project, and configure it to write the results out to CircleCI's [artifacts directory]( {{ site.baseurl }}/1.0/build-artifacts/).
CircleCI will upload coverage results and make them visible as part of your build.

### Adding and configuring a coverage library

#### Ruby

In Ruby 1.9, you add the
[simplecov gem](https://github.com/colszowka/simplecov)
and configure your test suite to add code coverage.

In your Gemfile, add the `simplecov` gem:

```
gem 'simplecov', :require => false, :group => :test
```

In `test/test_helper.rb`, `spec/spec_helper.rb`,
Cucumber's `env.rb`,
or in your test suite's startup hooks, initialize `SimpleCov`.

```
require 'simplecov'

# save to CircleCI's artifacts directory if we're on CircleCI
if ENV['CIRCLE_ARTIFACTS']
  dir = File.join(ENV['CIRCLE_ARTIFACTS'], "coverage")
  SimpleCov.coverage_dir(dir)
end

SimpleCov.start
```

The [simplecov README](https://github.com/colszowka/simplecov/#getting-started) has more details.

#### Scala

In Scala 2 you can use the [sbt-scoverage](https://github.com/scoverage/sbt-scoverage) plugin.

Add the plugin to `project/plugins.sbt`.

```scala
addSbtPlugin("org.scoverage" % "sbt-scoverage" % "1.5.0")
```

For a simple project, enable coverage in `circle.yml` with `sbt coverage test:compile`.

```
dependencies:
  override:
    - sbt coverage test:compile
```

Run tests with `sbt coverage test` and produce a coverage report with `sbt coverageReport`.

```
test:
  override:
    - sbt coverage test
    - sbt coverageReport
  post:
    - mkdir -p $CIRCLE_ARTIFACTS/scala-2.10
    - mv target/scala-2.10/coverage-report  $CIRCLE_ARTIFACTS/scala-2.10/coverage-report
    - mv target/scala-2.10/scoverage-report $CIRCLE_ARTIFACTS/scala-2.10/scoverage-report
```

See [gslowikowski/sbt-simple-circleci-test](https://github.com/gslowikowski/sbt-simple-circleci-test) for a complete example.

For multimodule projects, run tests against multiple Scala versions with `sbt coverage +test` and aggregate reports with `sbt coverageAggregate`. See [gslowikowski/sbt-multimodule-circleci-test](https://github.com/gslowikowski/sbt-multimodule-circleci-test) for a complete example.

#### Python, Node, Java, PHP, etc

We're working on a guide for other languages.
In the meantime, add your coverage library of choice. Options include:

*   [coverage](https://pypi.python.org/pypi/coverage)
    for python
*   [node-coverage](https://github.com/piuccio/node-coverage),
    [blanket.js](https://github.com/alex-seville/blanket),
    [jscoverage](https://github.com/fishbar/jscoverage)
    or
    [istanbul](https://github.com/gotwarlost/istanbul)
    for Node
*   [php-code-coverage](https://github.com/sebastianbergmann/php-code-coverage)
    or
    [Atoum](https://github.com/atoum/atoum)
    for PHP
*   [gcc's `gcov`](http://gcc.gnu.org/onlinedocs/gcc/Gcov.html)
    for C or C++.

Configure your library to save results in the directory specified by the CIRCLE_ARTIFACTS environment variable.
Alternatively, add a [test.post command]( {{ site.baseurl }}/1.0/configuration/#test)
to copy your artifacts into the [artifacts directory]( {{ site.baseurl }}/1.0/build-artifacts/).

### Seeing the results in the CircleCI UI

We will upload your coverage files, which will allow you view them from the "Artifacts"
tab on the build page:

![](  {{ site.baseurl }}/assets/img/docs/artifacts_listing.png)

You can also get them via the
[CircleCI API]( {{ site.baseurl }}/api/v1-reference/#build-artifacts).

And then of course, by viewing the generated HTML,
you can see beautifully rendered HTML in the UI.

![](  {{ site.baseurl }}/assets/img/docs/coverage_example.png)

## Using a Code Coverage service

You can easily send coverage results from CircleCI to a number of external
code quality services:

### Codecov
If you're a [Codecov](https://codecov.io?src=circleci-docs) customer,
integration with CircleCI can be as easy as

```yaml
test:
  post:
    - bash <(curl -s https://codecov.io/bash)
```
> No upload token is required for open source repositories.

Codecov's Bash uploader detects all coverage reports from all
languages and details for the CircleCI build to create a single,
cohesive coverage report. Codecov will automatically handle the
merging of coverage stats in parallel builds.

For more information find an example of your language here:
<https://github.com/codecov?q=example>

### Coveralls

If you're a Coveralls customer, follow
[their guide to set up your coverage stats.](https://coveralls.io/docs)
You'll need to add `COVERALLS_REPO_TOKEN` to your CircleCI
[environment variables]( {{ site.baseurl }}/1.0/environment-variables/).

Coveralls will automatically handle the merging of coverage stats in
parallel builds.

### PullReview

Follow the [instructions from PullReview](https://github.com/8thcolor/pullreview-coverage/blob/master/README.md)
to configure the appropriate coverage
reporter. You'll need to add PULLREVIEW_REPO_TOKEN to your
[environment variables]( {{ site.baseurl }}/1.0/environment-variables/).

## Under construction

Code coverage is an area where our support is evolving.
We'd love to have your feedback about how we could support it better.
[Let us know](https://support.circleci.com/hc/en-us)
how you're using it, how you'd like to use it, and what we could do better!
