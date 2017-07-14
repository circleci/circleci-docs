---
layout: classic-docs
title: "Collecting Test Metadata"
short-title: "Collecting Test Metadata"
categories: [configuring-jobs]
description: "Collecting test metadata"
order: 34
---

CircleCI collects test metadata from XML files and uses it to provide insights into your build. This document describes how to configure CircleCI to output test metadata as XML for some common test runners and store reports with the `store_test_results` step. **Note:** This step is not supported with Workflows. To see test result as artifacts, upload them using the `store_artifacts` step. 

After configuring CircleCI to collect your test metadata, tests that fail most often appear in a list on the details page of   [Insights](https://circleci.com/build-insights) in the application to identify flaky tests and isolate recurring issues.  

![Insights for Failed Tests]( {{ site.baseurl }}/assets/img/docs/insights.png)

## Enabling Formatters

Test metadata is not automatically collected in CircleCI 2.0 until you enable the JUnit formatters. For RSpec, Minitest, and Django, add the following configuration to to enable the formatters:

- RSpec requires the following be added to your gemfile:

```
gem 'rspec_junit_formatter'
```

- Minitest requires the following be added to your gemfile:

```
gem 'minitest-ci'
```

- Django should be configured using the [django-nose](https://github.com/django-nose/django-nose) test runner.  

To use another django test runner that is capable of
producing XUnit XML files, configure it to output them to the
`$CIRCLE_TEST_REPORTS/django` directory. **Note:** You must create the `django`
directory if your runner does not create the destination directory
automatically.  

## Metadata collection in custom test steps

Write the XML files to a subdirectory if you have a custom test step that produces JUnit XML output as is supported by most test runners in some form, for example:
```
- store_test_results:
    path: /tmp/test-results
```

### Custom runner examples

This section provides the following test runner examples: 

* [Cucumber]( {{ site.baseurl }}/2.0/collect-test-data/#cucumber)
* [Maven Surefire]( {{ site.baseurl }}/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]( {{ site.baseurl }}/2.0/collect-test-data/#gradle-junit-results)
* [Mocha]( {{ site.baseurl }}/2.0/collect-test-data/#mochajs)
* [Ava]( {{ site.baseurl }}/2.0/collect-test-data/#ava)
* [ESLint]( {{ site.baseurl }}/2.0/collect-test-data/#eslint)
* [PHPUnit]( {{ site.baseurl }}/2.0/collect-test-data/#phpunit)
* [RSpec]( {{ site.baseurl }}/2.0/collect-test-data/#rspec)
* [test2junit]( {{ site.baseurl }}/2.0/collect-test-data/#test2junit-for-clojure-tests)
* [Karma]( {{ site.baseurl }}/2.0/collect-test-data/#karma)


#### <a name="cucumber"></a>Cucumber

For custom Cucumber steps, you should generate a file using the JUnit formatter and write it to the `cucumber` directory.  Following is an example of the addition to your `.circleci/config.yml` file:

```yaml
    steps:
    - run: |
        mkdir -p /cucumber 
        bundle exec cucumber --format junit --out /cucumber/junit.xml
      - store_test_results:
          path: /cucumber
      - store_artifacts:
          path: /cucumber
```

The `path:` is a directory relative to the project’s root directory where the files are stored. CircleCI collects and uploads the artifacts to S3 and makes them available in the Artifacts tab of the Builds page in the application.

Alternatively, if you want to use Cucumber's JSON formatter, be sure to name the output file that ends with `.cucumber` and write it to the `/cucumber` directory. For example:

```yaml
    steps:
      - run: |
          mkdir -p /cucumber
          bundle exec cucumber pretty --format json --out /cucumber/tests.cucumber
      - store_test_results:
          path: /cucumber
      - store_artifacts:
          path: /cucumber          
```

#### <a name="maven-surefire-plugin-for-java-junit-results"></a>Maven Surefire Plugin for Java JUnit results

If you are building a [Maven](http://maven.apache.org/) based project, you are more than likely using the
[Maven Surefire plugin](http://maven.apache.org/surefire/maven-surefire-plugin/)
to generate test reports in XML format. CircleCI makes it easy to collect these
reports. Add the following to the `.circleci/config.yml` file in your
project.

```
    steps:
      - run: |
          mkdir -p /junit/
          find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} /junit/ \;
      - store_test_results:
          path: /junit
      - store_artifacts:
          path: /junit          
```

#### <a name="gradle-junit-results"></a>Gradle JUnit Test results

If you are building a Java or Groovy based project with [Gradle](https://gradle.org/),
test reports are automatically generated in XML format. CircleCI makes it easy to collect these
reports. Add the following to the `.circleci/config.yml` file in your
project.

```
    steps:
      - run: |
          mkdir -p /junit/
          find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} /junit/ \;
      - store_test_results:
          path: /junit
      - store_artifacts:
          path: /junit          
```

#### <a name="mochajs"></a>Mocha for Node.js

To output junit tests with the Mocha test runner you can use [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)

A working `.circleci/config.yml` section for testing might look like this:

```yaml
    steps:
      - checkout
      - run: npm install
      - run: mkdir junit
      - run: 
          command: mocha test --reporter mocha-junit-reporter
          environment:
            MOCHA_FILE: junit/test-results.xml
      - store_test_results:
          path: /junit
      - store_artifacts:
          path: /junit          
```

#### <a name="ava"></a>Ava for Node.js

To output JUnit tests with the [Ava](https://github.com/avajs/ava) test runner you can use the TAP reporter with [tap-xunit](https://github.com/aghassemi/tap-xunit).

A working `.circleci/config.yml` section for testing might look like the following example:

```
    steps: 
      - run: |
          yarn add ava tap-xunit --dev # or you could use npm
          mkdir -p /reports
          ava --tap | tap-xunit > /reports/ava.xml
      - store_test_results:
          path: /reports
      - store_artifacts:
          path: /reports          
```


#### <a name="eslint"></a>ESLint

To output JUnit results from [ESLint](http://eslint.org/), you can use the [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit).

A working `.circleci/config.yml` test section might look like this:

```
    steps:
      - run: |
          mkdir -p /reports
          eslint ./src/ --format junit --output-file /reports/eslint.xml
      - store_test_results:
          path: /reports
      - store_artifacts:
          path: /reports          
```


#### <a name="phpunit"></a>PHPUnit

For PHPUnit tests, you should generate a file using the `--log-junit` command line option and write it to the `/phpunit` directory.  Your `.circleci/config.yml` might be:

```
    steps:
      - run: |
          mkdir -p /phpunit
          phpunit --log-junit /phpunit/junit.xml tests
      - store_test_results:
          path: /phpunit
      - store_artifacts:
          path: /phpunit          
```

#### <a name="rspec"></a>RSpec

To add test metadata collection to a project that uses a custom `rspec` build step, add the following gem to your Gemfile:

```
gem 'rspec_junit_formatter'
```

And modify your test command to this:

````
    steps:
      - checkout
      - run: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3
      - run: mkdir rspec
      - run: bundle exec rspec --format progress --format RspecJunitFormatter -o rspec/rspec.xml
      - store_test_results:
          path: rspec
````

### <a name="minitest"></a> Minitest

To add test metadata collection to a project that uses a custom `minitest` build step, add the following gem to your Gemfile:

```
gem 'minitest-ci'
```

And modify your test command to this:

````
    steps:
      - checkout
      - run: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3
      - run: mkdir reports
      - run: bundle exec rake test TESTOPTS="--ci-dir=./reports":
      - store_test_results:
          path: reports
````

See the [minitest-ci README](https://github.com/circleci/minitest-ci#readme) for more info.

#### <a name="test2junit-for-clojure-tests"></a>test2junit for Clojure tests
Use [test2junit](https://github.com/ruedigergad/test2junit) to convert Clojure test output to XML format. For more details, refer to the [sample project](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit).

#### <a name="karma"></a>Karma

To output JUnit tests with the Karma test runner you can use [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter).

A working `.circleci/config.yml` section might look like this:

```yaml
    steps:
      - checkout
      - run: npm install
      - run: mkdir junit
      - run:
          command: karma start ./karma.conf.js:
          environment:
            JUNIT_REPORT_PATH: ./junit/
            JUNIT_REPORT_NAME: test-results.xml
      - store_test_results:
          path: /junit
      - store_artifacts:
          path: ./junit
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


## Merging test suites together

If you have multiple JUnit test reports from running more than one test suite or runner, you can merge them together using the third-party NodeJS CLI tool, [junit-merge](https://www.npmjs.com/package/junit-merge).

This tool can combine the reports into a single file that our test summary system can parse and give you correct test totals.

## API

To access test metadata for a run from the API, refer to the [test-metadata API documentation]( {{ site.baseurl }}/api/v1-reference/#test-metadata).
