---
layout: classic-docs
title: Collect test data
description: A guide to collecting test data in your CircleCI projects.
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
sectionTags:
  javascript:
    - "#jest"
    - "#mocha-for-node"
    - "#mocha-with-nyc"
    - "#karma"
    - "#ava-for-node"
    - "#eslint"
  ruby:
    - "#rspec"
    - "#minitest"
  python:
    - "#pytest"
    - "#unittest"
  java:
    - "#maven-surefire-plugin-for-java-junit-results"
    - "#gradle-junit-test-results"
  php:
    - "#phpunit"
  dot-net:
    - "#trx2junit-for-visual-studio-net-core-tests"
  clojure:
    - "#kaocha"
    - "#test2junit-for-clojure-tests"
---

## Introduction
{: #introduction }
When you run tests in CircleCI there are two ways to store your test results. You can either use [artifacts](/docs/artifacts) or the [`store_test_results` step](/docs/configuration-reference/#storetestresults). There are advantages to both methods, so the decision needs to be made for each project.

When you save test data using the `store_test_results` step, CircleCI collects data from XML files and uses it to provide insights into your job. This page describes how to configure CircleCI to output test data as XML for some common test runners and store reports with the `store_test_results` step.

Using the **`store_test_results` step** gives you access to:

* The **Tests tab** in the CircleCI web app.
* Test insights and flaky test detection.
* Test splitting.

Alternatively, storing test results as **artifacts** means you can look at the raw XML. This can be useful when debugging issues with setting up your project's test results handling, for example, finding incorrectly uploaded files.

To see test results as build artifacts, upload them using the [`store_artifacts` step](/docs/configuration-reference/#storeartifacts). Artifacts use storage, therefore, there is a cost associated with storing artifacts. See the [Persisting data](/docs/persist-data/#custom-storage-usage) page for information on how to customize storage retention periods for objects like artifacts.

You can choose to upload your test results using both `store_test_results` and `store_artifacts`.
{: class="alert alert-note" }


Using the [`store_test_results` step](/docs/configuration-reference/#storetestresults) allows you to not only upload and store test results, but also provides a view of your passing/failing tests in the CircleCI web app.

You can access the test results from the **Tests tab** when viewing a job, as shown below.

![store-test-results-view]({{site.baseurl}}/assets/img/docs/test-summary.png)

Below is an example of using the [`store_test_results` key](/docs/configuration-reference/#storetestresults) in your `.circleci/config.yml`.

```yml
steps:
  - run:
  #...
  # run tests and store XML files to a subdirectory, for example, test-results
  #...
  - store_test_results:
    path: test-results
```

The `path` key is an absolute or relative path to your `working_directory` containing subdirectories of JUnit XML test metadata files, or the path of a single file containing all test results.

Make sure that your `path` value is not a hidden folder. For example, `.my_hidden_directory` would be an invalid format.
{: class="alert alert-warning" }

## Viewing storage usage
{: #viewing-storage-usage }

For information on viewing your storage usage, and calculating your monthly storage overage costs, see the [Persisting data](/docs/persist-data/#managing-network-and-storage-usage) guide.

## Test Insights
{: #test-insights }
See the [Test Insights](/docs/insights-tests/) page for information on using the Insights feature to gather information about your tests.
This includes flaky test detection, viewing tests that failed most often, slowest tests, and an overall performance summary.

Also, see the [API v2 Insights endpoints](https://circleci.com/docs/api/v2/index.html#tag/Insights) to find test failure information.

## Enabling formatters
{: #enabling-formatters }

Test metadata is not automatically collected in CircleCI until you enable the JUnit formatters. For RSpec, Minitest, and Django, add the following configuration to enable the formatters:

- RSpec requires the following be added to your gemfile:

  ```ruby
  gem 'rspec_junit_formatter'
  ```

- Minitest requires the following be added to your gemfile:

  ```ruby
  gem 'minitest-ci'
  ```

- Django should be configured using the [django-nose](https://github.com/django-nose/django-nose) test runner.

For detailed information on how to test your iOS applications, refer to the [Testing iOS applications](/docs/testing-ios/) page.

## Test runner examples by language
{: #test-runner-examples-by-language }

This section provides the following test runner examples:

Language | Test Runner | Formatter | Examples
---|---|---|---
JavaScript | Jest | [jest-junit](https://www.npmjs.com/package/jest-junit) | [example](/docs/collect-test-data/#jest)
JavaScript | Mocha | [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter) | [example](/docs/collect-test-data/#mocha-for-node), [example with NYC](/docs/collect-test-data/#mocha-with-nyc)
JavaScript | Karma | [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter) | [example](/docs/collect-test-data/#karma)
JavaScript | Ava | [tap-xunit](https://github.com/aghassemi/tap-xunit) | [example](/docs/collect-test-data/#ava-for-node)
JavaScript | ESLint | [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit) | [example](/docs/collect-test-data/#eslint)
Ruby | RSpec | [rspec_junit_formatter](https://rubygems.org/gems/rspec_junit_formatter/versions/0.2.3) | [example](/docs/collect-test-data/#rspec)
Ruby | Minitest | [minitest-ci](https://rubygems.org/gems/minitest-ci) | [example](/docs/collect-test-data/#minitest)
--- | Cucumber | built-in | [example](/docs/collect-test-data/#cucumber)
Python | pytest | built in | [example](/docs/collect-test-data/#pytest)
Python | unittest | Use [pytest](https://docs.pytest.org/en/6.2.x/unittest.html) to run these tests | [example](/docs/collect-test-data/#unittest)
Java | Maven | [Maven Surefire plugin](https://maven.apache.org/surefire/maven-surefire-plugin/) | [example](/docs/collect-test-data/#maven-surefire-plugin-for-java-junit-results)
Java | Gradle | built-in | [example](/docs/collect-test-data/#gradle-junit-test-results)
PHP | PHPUnit | built in | [example](/docs/collect-test-data/#phpunit)
.NET | --- | [trx2junit](https://github.com/gfoidl/trx2junit) | [example](/docs/collect-test-data/#dot-net)
Clojure | Kaocha | [kaocha-junit-xml](https://clojars.org/lambdaisland/kaocha-junit-xml) | [example](/docs/collect-test-data/#kaocha)
Clojure | clojure.test | [test2junit](https://github.com/ruedigergad/test2junit) | [example](/docs/collect-test-data/#test2junit-for-clojure-tests)
C, C++ | CTest | [ctest](https://cmake.org/cmake/help/latest/manual/ctest.1.html#cmdoption-ctest-output-junit) | [example](/docs/collect-test-data/#ctest-for-c-cxx-tests)
{: class="table table-striped"}

### Jest
{: #jest }

To output JUnit compatible test data with Jest you can use [jest-junit](https://www.npmjs.com/package/jest-junit).

A working `.circleci/config.yml` section might look like this:

```yml
steps:
  - run:
      name: Install JUnit coverage reporter
      command: yarn add --dev jest-junit
  - run:
      name: Run tests with JUnit as reporter
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT_DIR: ./reports/
  - store_test_results:
      path: ./reports/
```

For a full walkthrough, refer to this article by Viget: [Using JUnit on CircleCI 2.0 with Jest and ESLint](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint). Note that usage of the jest cli argument `--testResultsProcessor` in the article has been superseded by the `--reporters` syntax, and JEST_JUNIT_OUTPUT has been replaced with `JEST_JUNIT_OUTPUT_DIR` and `JEST_JUNIT_OUTPUT_NAME`, as demonstrated above.

When running Jest tests, please use the `--runInBand` flag. Without this flag, Jest will try to allocate the CPU resources of the entire virtual machine in which your job is running. Using `--runInBand` will force Jest to use only the virtualized build environment within the virtual machine.

For more details on `--runInBand`, refer to the [Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) documentation. For more information on these issues, see [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) and [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) of the official Jest repository.

### Mocha for Node.js
{: #mocha-for-node }

To output junit tests with the Mocha test runner you can use [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter).

A working `.circleci/config.yml` section for testing might look like this:

```yml
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
```

### Mocha with nyc
{: #mocha-with-nyc }

Following is an example for Mocha with nyc, contributed by [marcospgp](https://github.com/marcospgp).

{% raw %}
```yml
jobs:
    build:
        environment:
            CC_TEST_REPORTER_ID: code_climate_id_here
            NODE_ENV: development
        docker:
            - image: cimg/node:16.10
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
              environment:
                MONGODB_URI: mongodb://admin:password@localhost:27017/db?authSource=admin
            - image: mongo:4.0
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

            - store_artifacts: # upload test coverage as artifact
                path: ./coverage/lcov.info
                prefix: tests
```
{% endraw %}

### Karma
{: #karma }

To output JUnit tests with the Karma test runner you can use [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter).

A working `.circleci/config.yml` section might look like this:

```yml
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

### Ava for Node.js
{: #ava-for-node }

To output JUnit tests with the [Ava](https://github.com/avajs/ava) test runner you can use the TAP reporter with [tap-xunit](https://github.com/aghassemi/tap-xunit).

A working `.circleci/config.yml` section for testing might look like the following example:

```yml
    steps:
      - run:
          command: |
            yarn add ava tap-xunit --dev # or you could use npm
            mkdir -p ~/reports
            ava --tap | tap-xunit > ~/reports/ava.xml
          when: always
      - store_test_results:
          path: ~/reports
```


### ESLint
{: #eslint }

To output JUnit results from [ESLint](http://eslint.org/), you can use the [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit).

A working `.circleci/config.yml` test section might look like this:

```yml
    steps:
      - run:
          command: |
            mkdir -p ~/reports
            eslint ./src/ --format junit --output-file ~/reports/eslint.xml
          when: always
      - store_test_results:
          path: ~/reports
```

### RSpec
{: #rspec }

To add test metadata collection to a project that uses a custom `rspec` build step, add the following gem to your Gemfile:

```ruby
gem 'rspec_junit_formatter'
```

And modify your test command to this:

```yml
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
{: #minitest }

To add test metadata collection to a project that uses a custom `minitest` build step, add the following gem to your Gemfile:

```ruby
gem 'minitest-ci'
```

And modify your test command to this:

```yml
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

### Cucumber
{: #cucumber }

For custom Cucumber steps, you should generate a file using the JUnit formatter and write it to the `cucumber` directory. Following is an example of the addition to your `.circleci/config.yml` file:

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format junit --out ~/cucumber/junit.xml
          when: always
      - store_test_results:
          path: ~/cucumber
```

The `path:` is a directory relative to the project’s root directory where the files are stored. CircleCI collects and uploads the artifacts to S3 and makes them available in the **Artifacts tab** of the **Job page** in the application.

### pytest
{: #pytest }

To add test metadata to a project that uses `pytest` you need to tell it to output JUnit XML, and then save the test metadata:

```yml
      - run:
          name: run tests
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml

      - store_test_results:
          path: test-results
```

### unittest
{: #unittest }

unittest does not support JUnit XML, but in almost all cases you can [run unittest tests with pytest](https://docs.pytest.org/en/6.2.x/unittest.html).

After adding pytest to your project, you can produce and upload the test results like this:
```yml
      - run:
          name: run tests
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml tests

      - store_test_results:
          path: test-results
```

### Maven Surefire Plugin for Java JUnit Results
{: #maven-surefire-plugin-for-java-junit-results }

If you are building a [Maven](http://maven.apache.org/) based project, you are more than likely using the [Maven Surefire plugin](http://maven.apache.org/surefire/maven-surefire-plugin/) to generate test reports in XML format. CircleCI makes it easy to collect these reports. Add the following to the `.circleci/config.yml` file in your project.

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
```

### Gradle JUnit Test Results
{: #gradle-junit-test-results }

If you are building a Java or Groovy based project with [Gradle](https://gradle.org/), test reports are automatically generated in XML format. CircleCI makes it easy to collect these reports. Add the following to the `.circleci/config.yml` file in your project.

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
```

### PHPUnit
{: #phpunit }

For PHPUnit tests, you should generate a file using the `--log-junit` command line option and write it to the `/phpunit` directory. Your `.circleci/config.yml` might be:

```yml
    steps:
      - run:
          command: |
            mkdir -p ~/phpunit
            phpunit --log-junit ~/phpunit/junit.xml tests
          when: always
      - store_test_results:
          path: ~/phpunit
```

### trx2junit for Visual Studio / .NET Core Tests
{: #trx2junit-for-visual-studio-net-core-tests }

Use [trx2junit](https://github.com/gfoidl/trx2junit) to convert Visual Studio / .NET Core trx output to XML format.

A working `.circleci/config.yml` section might look like this:

```yml
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
```

### Kaocha
{: #kaocha }

Assuming that your are already using kaocha as your test runner, do these things to produce and store test results:

Add the `kaocha-junit-xml` plugin to your dependencies

Edit your `project.clj` to add the lambdaisland/kaocha-junit-xml plugin, or do the equivalent if you are using deps.edn.
```clojure
(defproject ,,,
  :profiles {,,,
             :dev {:dependencies [,,,
                                  [lambdaisland/kaocha-junit-xml "0.0.76"]]}})
```

Edit the kaocha config file `test.edn` to use this test reporter
```edn
#kaocha/v1
{:plugins [:kaocha.plugin/junit-xml]
 :kaocha.plugin.junit-xml/target-file "junit.xml"}
```

Add the store_test_results step your `.circleci/config.yml`
```yml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/clojure:tools-deps-1.9.0.394
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: bin/kaocha
      - store_test_results:
          path: junit.xml
```

### test2junit for Clojure Tests
{: #test2junit-for-clojure-tests }

Use [test2junit](https://github.com/ruedigergad/test2junit) to convert Clojure test output to XML format. For more details, refer to the [sample project](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit).

### CTest for C/C++ Tests
{: #ctest-for-c-cxx-tests }

CTest provides a [`--output-junit`](https://cmake.org/cmake/help/latest/manual/ctest.1.html#cmdoption-ctest-output-junit) flag to additionally store test results to XML format. To use this feature, you will need CMake >=3.21. The XML file is stored relative to the build directory.

A working `.circleci/config.yml` section for testing might look like the following example:

```yml
    steps:
      - checkout
      - run: mkdir build
      - run: cmake -S . -B build
      - run: ctest --test-dir build --output-junit out.xml
      - store_test_results:
          path: build/out.xml
```

### Bats for Bash
{: #bats-for-bash }

[Bats](https://bats-core.readthedocs.io/) provides a `--report-formatter junit` option to create a JUnit-format report in a location specified by the `--output` option. A subsequent `store_test_results` step can be passed to that same location.

The [circleci/bats](https://circleci.com/developer/orbs/orb/circleci/bats) orb's [run job](https://circleci.com/developer/orbs/orb/circleci/bats?version=1.1.0#jobs-run) takes care of this functionality for you.

For example, a `.circleci/config.yml` section for running all `*.bats` tests within the `src/tests` folder might look like the following:

```yml
orbs:
  bats: circleci/bats@1.1.0
workflows:
  test:
    jobs:
      - bats/run:
          path: ./src/tests
```

### GoogleTest
{: #googletest }

[GoogleTest](https://github.com/google/googletest) provides an XML option for its output flag, which will generate a JUnit XML report that can be used to upload and view test results on CircleCI.

```yml
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Execute Tests
          command: |
            cd build
            ./tests --gtest_output=XML
      - store_test_results:
          path: build
```
You can see a full example on this [third party resource](https://levelup.gitconnected.com/how-to-combine-c-cmake-googletest-circleci-docker-and-why-e02d76c060a3).

### Xcode
{: #xcode }

Xcode generates test results in a plist (property list) file format. It is possible to convert a plist file format into an XML format that can be uploaded to CircleCI using the `xsltproc` command. Follow the steps in this [third party resource](https://medium.com/@warchimede/convert-xcode-plist-test-reports-to-junit-xml-6f0aa8c3fa58) to convert the file and then use `store_test_results` to upload the results to CircleCI.


## API
{: #api }

To access test metadata for a job from the API, refer to the [test-metadata API documentation](https://circleci.com/docs/api/v2/#operation/getTests).

## Video: Troubleshooting test runners
{: #video-troubleshooting-test-runners }

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>


## See Also
{: #see-also }

- [Using Insights](/docs/insights/)
- [Test Insights](/docs/insights-tests/)
