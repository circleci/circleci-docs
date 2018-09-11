---
layout: classic-docs
title: CircleCI 1.0 Collecting Test Metadata
categories: [configuration-tasks]
description: "Collecting test metadata"
order: 45
sitemap: false
---

CircleCI can collect test metadata from JUnit XML files.

CircleCI uses the test metadata to give you better insight into your build. For the 
inferred steps that use parallelism, CircleCI always uses the timing information to get you
better test splits and finish your builds faster.

You can also take advantage of this runtime-based test splitting in custom steps if you follow [these steps]( {{ site.baseurl }}/1.0/test-metadata/#using-the-files-modifier).

## Automatic test metadata collection

If you're using inferred test steps for Ruby or Python then CircleCI
automatically collects test metadata, though for RSpec, Minitest, and Django
you'll need to do some configuration to to enable the formatters:

### For RSpec:

Add this to your gemfile:

```
gem 'rspec_junit_formatter'
```

### For Minitest:

Add this to your gemfile:

```
gem 'minitest-ci'
```

### For Django:

Configure your tests to run using the
[django-nose](https://github.com/django-nose/django-nose) test runner.  We'll
do the rest automatically.

Or if you'd rather use another django test runner that is capable of
producing XUnit XML files, configure it to output them to the
`$CIRCLE_TEST_REPORTS/django` directory (you'll have to create the django
directory if your runner doesn't create the destination directory
automatically.)  We'll still auto-parallelize your tests, and incorporate the
timing information.

## Metadata collection in custom test steps

If you have a custom test step that produces JUnit XML output - most test
runners support this in some form - you can write the XML files to a
subdirectory under `$CIRCLE_TEST_REPORTS` (for example `$CIRCLE_TEST_REPORTS/reports`).

We'll automatically store the files in your [build artifacts]( {{ site.baseurl }}/1.0/build-artifacts/) and parse the XML.

You can tell us the type of test by putting the files in a subdirectory of `$CIRCLE_TEST_REPORTS`.
For example, if you have RSpec tests, you would write your XML files to `$CIRCLE_TEST_REPORTS/rspec`.

**Note**: You must write to a **subdirectory** under `$CIRCLE_TEST_REPORTS` to enable CircleCI to find your reports. If you do not write your report to a **subdirectory** under `$CIRCLE_TEST_REPORTS`, you will see a report in your jobs such as `Your build ran 71 tests in unknown` instead of `Your build ran 71 tests in rspec`.

### Custom runner examples
* [Cucumber]( {{ site.baseurl }}/1.0/test-metadata/#cucumber)
* [Maven Surefire]( {{ site.baseurl }}/1.0/test-metadata/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]( {{ site.baseurl }}/1.0/test-metadata/#gradle-junit-results)
* [Mocha]( {{ site.baseurl }}/1.0/test-metadata/#mochajs)
* [Ava]( {{ site.baseurl }}/1.0/test-metadata/#ava)
* [ESLint]( {{ site.baseurl }}/1.0/test-metadata/#eslint)
* [PHPUnit]( {{ site.baseurl }}/1.0/test-metadata/#phpunit)
* [RSpec]( {{ site.baseurl }}/1.0/test-metadata/#rspec)
* [test2junit]( {{ site.baseurl }}/1.0/test-metadata/#test2junit-for-clojure-tests)
* [Karma]( {{ site.baseurl }}/1.0/test-metadata/#karma)


#### Cucumber

For custom Cucumber steps, you should generate a file using the JUnit formatter and write it to the `$CIRCLE_TEST_REPORTS/cucumber` directory.  Your [circle.yml]( {{ site.baseurl }}/1.0/configuration/) might be:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/cucumber
    - bundle exec cucumber --format junit --out $CIRCLE_TEST_REPORTS/cucumber/junit.xml
```

Alternatively, if you want to use Cucumber's JSON formatter, be sure to name the output file that ends with `.cucumber` and write it to the `$CIRCLE_TEST_REPORTS/cucumber` directory. For example:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/cucumber
    - bundle exec cucumber --format pretty --format json --out $CIRCLE_TEST_REPORTS/cucumber/tests.cucumber
```

#### Maven Surefire Plugin for Java JUnit results

If you are building a [Maven](http://maven.apache.org/) based project,
you are more than likely using the
[Maven Surefire plugin](http://maven.apache.org/surefire/maven-surefire-plugin/)
to generate test reports in XML format. CircleCI makes it easy to collect these
reports. You just need to add the following to the [circle.yml]( {{ site.baseurl }}/1.0/configuration/) file in your
project.

```
test:
  post:
    - mkdir -p $CIRCLE_TEST_REPORTS/junit/
    - find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} $CIRCLE_TEST_REPORTS/junit/ \;
```

#### <a name="gradle-junit-results"></a>Gradle JUnit Test results

If you are building a Java or Groovy based project with [Gradle](https://gradle.org/),
test reports are automatically generated in XML format. CircleCI makes it easy to collect these
reports. You just need to add the following to the [circle.yml]( {{ site.baseurl }}/1.0/configuration/) file in your
project.

```
test:
  post:
    - mkdir -p $CIRCLE_TEST_REPORTS/junit/
    - find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} $CIRCLE_TEST_REPORTS/junit/ \;
```

#### <a name="mochajs"></a>Mocha for Node.js

To output junit tests with the Mocha test runner you can use [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)

A working [circle.yml]( {{ site.baseurl }}/1.0/configuration/) section for testing might look like this:

```
test:
  override:
    - mocha test --reporter mocha-junit-reporter:
        environment:
          MOCHA_FILE: $CIRCLE_TEST_REPORTS/junit/test-results.xml
```



#### <a name="ava"></a>Ava for Node.js

To output JUnit tests with the [Ava](https://github.com/avajs/ava) test runner you can use the TAP reporter with [tap-xunit](https://github.com/aghassemi/tap-xunit).

A working [circle.yml]( {{ site.baseurl }}/1.0/configuration/) section for testing might look like this:

```
dependencies:
  override:
    - yarn add ava tap-xunit --dev # or you could use npm
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/reports
    - ava --tap | tap-xunit > $CIRCLE_TEST_REPORTS/reports/ava.xml
```


#### ESLint

To output JUnit results from [ESLint](http://eslint.org/), you can use the [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit).

A working [circle.yml]( {{ site.baseurl }}/1.0/configuration/) `test` section might look like this:

```
test:
  pre:
    - mkdir -p $CIRCLE_TEST_REPORTS/reports
    - eslint ./src/ --format junit --output-file $CIRCLE_TEST_REPORTS/reports/eslint.xml
```


#### PHPUnit

For PHPUnit tests, you should generate a file using the `--log-junit` command line option and write it to the `$CIRCLE_TEST_REPORTS/phpunit` directory.  Your [circle.yml]( {{ site.baseurl }}/1.0/configuration/) might be:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/phpunit
    - phpunit --log-junit $CIRCLE_TEST_REPORTS/phpunit/junit.xml tests
```

#### RSpec

To add test metadata collection to a project that uses a custom `rspec` build step, add the following gem to your Gemfile:

```
gem 'rspec_junit_formatter'
```

And modify your test command to this:

```
test:
  override:
    - bundle exec rspec --format progress --format RspecJunitFormatter -o $CIRCLE_TEST_REPORTS/rspec.xml
```

### <a name="minitest"></a> Minitest

To add test metadata collection to a project that uses a custom `minitest` build step, add the following gem to your Gemfile:

```
gem 'minitest-ci'
```

And modify your test command to this:

````
test:
  override:
    - bundle exec rake test TESTOPTS="--ci-dir=$CIRCLE_TEST_REPORTS/reports":
        parallel: true
        files:
          - test/**/*_test.rb
````

See the [minitest-ci README](https://github.com/circleci/minitest-ci#readme) for more info.

#### test2junit for Clojure tests
You can use [test2junit](https://github.com/ruedigergad/test2junit) to convert Clojure test output to XML format. For more details, please checkout our [sample project](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit).

#### Karma

To output JUnit tests with the Karma test runner you can use [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter).

A working [circle.yml]( {{site.baseurl }}/1.0/configuration/) `test` section might look like this:

```yaml
test:
  override:
    - karma start ./karma.conf.js:
        environment:
          JUNIT_REPORT_PATH: $CIRCLE_TEST_REPORTS/junit/
          JUNIT_REPORT_NAME: test-results.xml
```

```javascript
// karma.conf.js

// additional config...

reporters: ['junit'],

junitReporter: {
  outputDir: process.env.JUNIT_REPORT_PATH,
  outputFile: process.env.JUNIT_REPORT_NAME,
  useBrowserName: false
},
// additional config...
```

## Using the `files` modifier

If you are collecting test metadata for a custom build step as documented above, you can
still use runtime-based test splitting with the `files` [modifier]( {{ site.baseurl }}/1.0/configuration/#modifiers).
This modifier lets will pass a list of filename arguments to the end of your custom command
which can be used by your test runner to run a subset of test files on each build node.
If the "file" attribute is populated in the junit-formatted XML metadata for these
tests, then their runtime data will be used with the `files` modifier to pass a time-weighted
list of filename args on each build node, ensuring an optimal split of test files across containers.

## Merging test suites together

If you have multiple JUnit test reports from running more than one test suite or runner, you can merge them together using the third-party NodeJS CLI tool, [junit-merge](https://www.npmjs.com/package/junit-merge).

This tool can combine the reports into a single file that our test summary system can parse and give you correct test totals.

## API

You can access test metadata for a build from the [API]( {{ site.baseurl }}/api/v1-reference/#test-metadata).
