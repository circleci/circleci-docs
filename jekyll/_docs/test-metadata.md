---
layout: classic-docs
title: Collecting test metadata
categories: [how-to]
description: Collecting test metadata
---

CircleCI can collect test metadata from JUnit XML files and Cucumber JSON files.
We'll use the test metadata to give you better insight into your build. For our
inferred steps that use parallelism, we'll always use the timing information to get you
better test splits and finish your builds faster. You can also take advantage
of this runtime-based test splitting in custom steps if you follow [these steps]({{site.baseurl}}/test-metadata/#using-the-files-modifier).

## Automatic test metadata collection

If you're using our inferred test steps for Ruby or Python then we'll
automatically collect test metadata, though for RSpec, Minitest, and Django
you'll need to do some configuration to to enable the formatters:

For RSpec:

Add this to your gemfile:

```
gem 'rspec_junit_formatter'
```

For Minitest:

Add this to your gemfile:

```
gem 'minitest-ci', :git => 'git@github.com:circleci/minitest-ci.git'
```

For Django:

Configure your tests to run using the
[django-nose](https://github.com/django-nose/django-nose) test runner.  We'll
do the rest automatically.

Or if you'd rather use another django test runner, and it's capable of
producing XUnit XML files, configure it to output them to the
`$CIRCLE_TEST_REPORTS/django` directory (you'll have to create the django
directory if your runner doesn't create the destination directory
automatically.)  We'll still auto-parallelize your tests, and incorporate the
timing information.

## Metadata collection in custom test steps

If you have a custom test step that produces JUnit XML output - most test runners support this in some form - you can write the XML
files to the `$CIRCLE_TEST_REPORTS` directory.  We'll automatically store the files in your
[build artifacts]({{ site.baseurl }}/build-artifacts/) and parse the XML.

You can tell us the type of test by putting the files in a subdirectory of `$CIRCLE_TEST_REPORTS`.
For example, if you have RSpec tests, you would write your XML files to `$CIRCLE_TEST_REPORTS/rspec`.

### Custom runner examples
* [Cucumber]({{ site.baseurl }}/test-metadata/#cucumber)
* [Maven Surefire]({{ site.baseurl }}/test-metadata/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]({{ site.baseurl }}/test-metadata/#gradle-junit-results)
* [Mocha]({{site.baseurl}}/test-metadata/#mochajs)
* [PHPUnit]({{ site.baseurl }}/test-metadata/#phpunit)
* [RSpec]({{ site.baseurl }}/test-metadata/#rspec)
* [test2junit]({{ site.baseurl }}/test-metadata/#test2junit-for-clojure-tests)


#### <a name="cucumber"></a>Cucumber

For custom Cucumber steps, you should generate a file using the JSON formatter that ends with `.cucumber` and write it to the `$CIRCLE_TEST_REPORTS/cucumber` directory.  Your [circle.yml]({{ site.baseurl }}/configuration/) might be:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/cucumber
    - bundle exec cucumber --format junit --out $CIRCLE_TEST_REPORTS/cucumber/junit.xml
```

Note that `cucumber` allows for mulitple `--format` items to be present so you can do:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/cucumber
    - bundle exec cucumber --format pretty --format json --out $CIRCLE_TEST_REPORTS/cucumber/tests.cucumber
```

#### <a name="maven-surefire-plugin-for-java-junit-results"></a>Maven Surefire Plugin for Java JUnit results

If you are building a [Maven](http://maven.apache.org/) based project,
you are more than likely using the
[Maven Surefire plugin](http://maven.apache.org/surefire/maven-surefire-plugin/)
to generate test reports in XML format. CircleCI makes it easy to collect these
reports. You just need to add the following to the [circle.yml]({{ site.baseurl }}/configuration/) file in your
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
reports. You just need to add the following to the [circle.yml]({{ site.baseurl }}/configuration/) file in your
project.

```
test:
  post:
    - mkdir -p $CIRCLE_TEST_REPORTS/junit/
    - find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} $CIRCLE_TEST_REPORTS/junit/ \;
```

#### <a name="mochajs"></a>Mocha for Node.js

To output junit tests with the Mocha test runner you can use [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)

A working [circle.yml]({{ site.baseurl }}/configuration/) section for testing might look like this:

```
test:
  override:
    - mocha test --reporter mocha-junit-reporter:
        environment:
          MOCHA_FILE: $CIRCLE_TEST_REPORTS/junit/test-results.xml
```



#### <a name="phpunit"></a>PHPUnit

For PHPUnit tests, you should generate a file using the `--log-junit` comment line option and write it to the `$CIRCLE_TEST_REPORTS/phpunit` directory.  Your [circle.yml]({{ site.baseurl }}/configuration/) might be:

```
test:
  override:
    - mkdir -p $CIRCLE_TEST_REPORTS/phpunit
    - phpunit --log-junit $CIRCLE_TEST_REPORTS/phpunit/junit.xml tests
```

#### <a name="rspec"></a>RSpec

To add test metadata collection to a project that uses a custom `rspec` build step, add the following gem to your Gemfile:

```
gem 'rspec_junit_formatter', '0.2.2'
```

And modify your test command to this:

````
test:
  override:
    - RAILS_ENV=test bundle exec rspec -r rspec_junit_formatter --format RspecJunitFormatter -o $CIRCLE_TEST_REPORTS/rspec/junit.xml
````

#### <a name="test2junit-for-clojure-tests"></a>test2junit for Clojure tests
You can use [test2junit](https://github.com/ruedigergad/test2junit) to convert Clojure test output to XML format. For more details, please checkout our [sample project](https://github.com/kimh/circleci-build-recipies).

## Using the `files` modifier

If you are collecting test metadata for a custom build step as documented above, you can
still use runtime-based test splitting with the `files` [modifier]({{site.baseurl}}/configuration/#modifiers).
This modifier lets will pass a list of filename arguments to the end of your custom command
which can be used by your test runner to run a subset of test files on each build node.
If the "file" attribute is populated in the junit-formatted XML metadata for these
tests, then their runtime data will be used with the `files` modifier to pass a time-weighted
list of filename args on each build node, ensuring an optimal split of test files across containers.

## API

You can access test metadata for a build from the [API]({{ site.baseurl }}/api/#test-metadata).
