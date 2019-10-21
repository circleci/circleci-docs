---
layout: classic-docs
title: "Collecting Test Metadata"
short-title: "Collecting Test Metadata"
categories: [configuring-jobs]
description: "Collecting test metadata"
order: 34
---

CircleCI collects test metadata from XML files and uses it to provide insights into your job. This document describes how to configure CircleCI to output test metadata as XML for some common test runners and store reports with the `store_test_results` step. 

* TOC 
{:toc}

To see test results as artifacts, upload them using the `store_artifacts` step.

The usage of the [`store_test_results`]({{ site.baseurl}}/2.0/configuration-reference/#store_test_results) key in your config looks like the following:

```sh
- store_test_results:
    path: test-results
```

Where the `path` key is an absolute or relative path to your `working_directory` containing subdirectories of JUnit XML or Cucumber JSON test metadata files. Make sure that your `path` value is not a hidden folder (example: `.my_hidden_directory` would be an invalid format).

After configuring CircleCI to collect your test metadata, tests that fail most often appear in a list on the details page of [Insights](https://circleci.com/build-insights){:rel="nofollow"} in the application to identify flaky tests and isolate recurring issues.

![Insights for Failed Tests]( {{ site.baseurl }}/assets/img/docs/insights.png)

## Enabling Formatters

Test metadata is not automatically collected in CircleCI 2.0 until you enable the JUnit formatters. For RSpec, Minitest, and Django, add the following configuration to enable the formatters:

- RSpec requires the following be added to your gemfile:

```
gem 'rspec_junit_formatter'
```

- Minitest requires the following be added to your gemfile:

```
gem 'minitest-ci'
```

- Django should be configured using the [django-nose](https://github.com/django-nose/django-nose) test runner.  
 
## Metadata Collection in Custom Test Steps

Write the XML files to a subdirectory if you have a custom test step that produces JUnit XML output as is supported by most test runners in some form, for example:
```
- store_test_results:
    path: /tmp/test-results
```

### Custom Test Runner Examples
{:.no_toc}

This section provides the following test runner examples:

* [Cucumber]( {{ site.baseurl }}/2.0/collect-test-data/#cucumber)
* [Maven Surefire]( {{ site.baseurl }}/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]( {{ site.baseurl }}/2.0/collect-test-data/#gradle-junit-results)
* [Mocha]( {{ site.baseurl }}/2.0/collect-test-data/#mochajs)
* [Ava]( {{ site.baseurl }}/2.0/collect-test-data/#ava)
* [ESLint]( {{ site.baseurl }}/2.0/collect-test-data/#eslint)
* [PHPUnit]( {{ site.baseurl }}/2.0/collect-test-data/#phpunit)
* [pytest]( {{ site.baseurl }}/2.0/collect-test-data/#pytest)
* [RSpec]( {{ site.baseurl }}/2.0/collect-test-data/#rspec)
* [test2junit]( {{ site.baseurl }}/2.0/collect-test-data/#test2junit-for-clojure-tests)
* [trx2junit]( {{ site.baseurl }}/2.0/collect-test-data/#trx2junit-for-visual-studio--net-core-tests)
* [Karma]( {{ site.baseurl }}/2.0/collect-test-data/#karma)
* [Jest]( {{ site.baseurl }}/2.0/collect-test-data/#jest)


#### Cucumber
{:.no_toc}

For custom Cucumber steps, you should generate a file using the JUnit formatter and write it to the `cucumber` directory.  Following is an example of the addition to your `.circleci/config.yml` file:

```yaml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format junit --out ~/cucumber/junit.xml
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber
```

The `path:` is a directory relative to the project’s root directory where the files are stored. CircleCI collects and uploads the artifacts to S3 and makes them available in the Artifacts tab of the **Job page** in the application.

Alternatively, if you want to use Cucumber's JSON formatter, be sure to name the output file that ends with `.cucumber` and write it to the `/cucumber` directory. For example:

```yaml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber pretty --format json --out ~/cucumber/tests.cucumber
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber      
```

#### Maven Surefire Plugin for Java JUnit Results
{:.no_toc}

If you are building a [Maven](http://maven.apache.org/) based project, you are more than likely using the [Maven Surefire plugin](http://maven.apache.org/surefire/maven-surefire-plugin/) to generate test reports in XML format. CircleCI makes it easy to collect these reports. Add the following to the `.circleci/config.yml` file in your project.

```yaml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
      - store_artifacts:
          path: ~/test-results/junit         
```

#### <a name="gradle-junit-results"></a>Gradle JUnit Test Results
{:.no_toc}

If you are building a Java or Groovy based project with [Gradle](https://gradle.org/), test reports are automatically generated in XML format. CircleCI makes it easy to collect these reports. Add the following to the `.circleci/config.yml` file in your project.

```yaml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
      - store_artifacts:
          path: ~/test-results/junit         
```

#### <a name="mochajs"></a>Mocha for Node.js
{:.no_toc}

To output junit tests with the Mocha test runner you can use [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter).

A working `.circleci/config.yml` section for testing might look like this:

```yaml
    steps:
      - checkout
      - run: npm install
      - run: mkdir ~/junit
      - run:
          command: mocha test --reporter mocha-junit-reporter
          environment:
            MOCHA_FILE: ~/junit/test-results.xml
          when: always
      - store_test_results:
          path: ~/junit
      - store_artifacts:
          path: ~/junit          
```

#### Mocha with nyc

Following is a complete example for Mocha with nyc, contributed by [marcospgp](https://github.com/marcospgp).

{% raw %}
```
version: 2
jobs:
    build:
        environment:
            CC_TEST_REPORTER_ID: code_climate_id_here
            NODE_ENV: development
        docker:
            - image: circleci/node:8
              environment:
                MONGODB_URI: mongodb://admin:password@localhost:27017/db?authSource=admin
            - image: mongo:4.0
              environment:
                MONGO_INITDB_ROOT_USERNAME: admin
                MONGO_INITDB_ROOT_PASSWORD: password
        working_directory: ~/repo
        steps:
            - checkout

            # Update npm
            - run:
                name: update-npm
                command: 'sudo npm install -g npm@latest'

            # Download and cache dependencies
            - restore_cache:
                keys:
                    - v1-dependencies-{{ checksum "package-lock.json" }}
                    # fallback to using the latest cache if no exact match is found
                    - v1-dependencies-

            - run: npm install

            - run: npm install mocha-junit-reporter # just for CircleCI

            - save_cache:
                paths:
                    - node_modules
                key: v1-dependencies-{{ checksum "package-lock.json" }}

            - run: mkdir reports

            # Run mocha
            - run:
                name: npm test
                command: ./node_modules/.bin/nyc ./node_modules/.bin/mocha --recursive --timeout=10000 --exit --reporter mocha-junit-reporter --reporter-options mochaFile=reports/mocha/test-results.xml
                when: always

            # Run eslint
            - run:
                name: eslint
                command: |
                    ./node_modules/.bin/eslint ./ --format junit --output-file ./reports/eslint/eslint.xml
                when: always

            # Run coverage report for Code Climate

            - run:
                name: Setup Code Climate test-reporter
                command: |
                    # download test reporter as a static binary
                    curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
                    chmod +x ./cc-test-reporter
                    ./cc-test-reporter before-build
                when: always

            - run:
                name: code-coverage
                command: |
                    mkdir coverage
                    # nyc report requires that nyc has already been run,
                    # which creates the .nyc_output folder containing necessary data
                    ./node_modules/.bin/nyc report --reporter=text-lcov > coverage/lcov.info
                    ./cc-test-reporter after-build -t lcov
                when: always

            # Upload results

            - store_test_results:
                path: reports

            - store_artifacts:
                path: ./reports/mocha/test-results.xml

            - store_artifacts:
                path: ./reports/eslint/eslint.xml

            - store_artifacts: # upload test coverage as artifact
                path: ./coverage/lcov.info
                prefix: tests
```
{% endraw %}

#### <a name="ava"></a>Ava for Node.js
{:.no_toc}

To output JUnit tests with the [Ava](https://github.com/avajs/ava) test runner you can use the TAP reporter with [tap-xunit](https://github.com/aghassemi/tap-xunit).

A working `.circleci/config.yml` section for testing might look like the following example:

```
    steps:
      - run:
          command: |
            yarn add ava tap-xunit --dev # or you could use npm
            mkdir -p ~/reports
            ava --tap | tap-xunit > ~/reports/ava.xml
          when: always
      - store_test_results:
          path: ~/reports
      - store_artifacts:
          path: ~/reports          
```


#### ESLint
{:.no_toc}

To output JUnit results from [ESLint](http://eslint.org/), you can use the [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit).

A working `.circleci/config.yml` test section might look like this:

```
    steps:
      - run:
          command: |
            mkdir -p ~/reports
            eslint ./src/ --format junit --output-file ~/reports/eslint.xml
          when: always
      - store_test_results:
          path: ~/reports
      - store_artifacts:
          path: ~/reports          
```


#### PHPUnit
{:.no_toc}

For PHPUnit tests, you should generate a file using the `--log-junit` command line option and write it to the `/phpunit` directory. Your `.circleci/config.yml` might be:

```
    steps:
      - run:
          command: |
            mkdir -p ~/phpunit
            phpunit --log-junit ~/phpunit/junit.xml tests
          when: always
      - store_test_results:
          path: ~/phpunit
      - store_artifacts:
          path: ~/phpunit          
```

#### pytest
{:.no_toc}

To add test metadata to a project that uses `pytest` you need to tell it to output JUnit XML, and then save the test metadata:

```
      - run:
          name: run tests
          command: |
            . venv/bin/activate
            mkdir test-reports
            pytest --junitxml=test-reports/junit.xml

      - store_test_results:
          path: test-reports

      - store_artifacts:
          path: test-reports    
```


#### RSpec
{:.no_toc}

To add test metadata collection to a project that uses a custom `rspec` build step, add the following gem to your Gemfile:

```
gem 'rspec_junit_formatter'
```

And modify your test command to this:

```
    steps:
      - checkout
      - run: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3
      - run: mkdir ~/rspec
      - run:
          command: bundle exec rspec --format progress --format RspecJunitFormatter -o ~/rspec/rspec.xml
          when: always
      - store_test_results:
          path: ~/rspec
```

### Minitest
{:.no_toc}

To add test metadata collection to a project that uses a custom `minitest` build step, add the following gem to your Gemfile:

```
gem 'minitest-ci'
```

And modify your test command to this:

```
    steps:
      - checkout
      - run: bundle check || bundle install
      - run:
          command: bundle exec rake test
          when: always
      - store_test_results:
          path: test/reports
```

See the [minitest-ci README](https://github.com/circleci/minitest-ci#readme) for more info.

#### test2junit for Clojure Tests
{:.no_toc}

Use [test2junit](https://github.com/ruedigergad/test2junit) to convert Clojure test output to XML format. For more details, refer to the [sample project](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit).

#### trx2junit for Visual Studio / .NET Core Tests
{:.no_toc}
Use [trx2junit](https://github.com/gfoidl/trx2junit) to convert Visual Studio / .NET Core trx output to XML format. 

A working `.circleci/config.yml` section might look like this:

```yaml
    steps:
      - checkout
      - run: dotnet build
      - run: dotnet test --no-build --logger "trx"
      - run:
          name: test results
          when: always
          command: |
              dotnet tool install -g trx2junit
              export PATH="$PATH:/root/.dotnet/tools"
              trx2junit tests/**/TestResults/*.trx
      - store_test_results:
          path: tests/TestResults
      - store_artifacts:
          path: tests/TestResults
          destination: TestResults
```

#### Karma
{:.no_toc}

To output JUnit tests with the Karma test runner you can use [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter).

A working `.circleci/config.yml` section might look like this:

```yaml
    steps:
      - checkout
      - run: npm install
      - run: mkdir ~/junit
      - run:
          command: karma start ./karma.conf.js
          environment:
            JUNIT_REPORT_PATH: ./junit/
            JUNIT_REPORT_NAME: test-results.xml
          when: always  
      - store_test_results:
          path: ./junit
      - store_artifacts:
          path: ./junit
```

```javascript
// karma.conf.js

// additional config...
{
  reporters: ['junit'],
  junitReporter: {
    outputDir: process.env.JUNIT_REPORT_PATH,
    outputFile: process.env.JUNIT_REPORT_NAME,
    useBrowserName: false
  },
}
// additional config...
```

#### Jest
{:.no_toc}

To collect Jest data, first create a Jest config file called `jest.config.js` with the following:

```javascript
// jest.config.js
{
  reporters: ["default", "jest-junit"],
}
```

In your `.circleci/config.yml`,
add the following `run` steps:

```yaml
steps:
  - run:
      name: Install JUnit coverage reporter
      command: yarn add --dev jest-junit
  - run:
      name: Run tests with JUnit as reporter
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT_DIR: "reports/junit/js-test-results.xml"
```

For a full walkthrough, refer to this article by Viget: [Using JUnit on CircleCI 2.0 with Jest and ESLint](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint).

**Note:** When running Jest tests, please use the `--runInBand` flag. Without this flag, Jest will try to allocate the CPU resources of the entire virtual machine in which your job is running. Using `--runInBand` will force Jest to use only the virtualized build environment within the virtual machine.

For more details on `--runInBand`, refer to the [Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) documentation. For more information on these issues, see [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) and [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) of the official Jest repository.

## API

To access test metadata for a run from the API, refer to the [test-metadata API documentation](https://circleci.com/docs/api/#get-build-test-metadata).

## See Also
{:.no_toc}

[Using Insights]( {{ site.baseurl }}/2.0/insights/)

## Video: Troubleshooting Test Runners
{:.no_toc}

<iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
