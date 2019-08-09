---
layout: classic-docs
title: Generating Code Coverage Metrics
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

* TOC
{:toc}


# Viewing Coverage on CircleCI 

You can upload your code coverage reports directly to CircleCI. First, add a
coverage library to your project and configure your build to write the coverage
report to CircleCI's [artifacts directory]({{ site.baseurl }}/2.0/artifacts/). Code coverage reports will then be stored as build artifacts, from where they can be viewed or downloaded. See our [build artifacts]({{ site.baseurl }}/2.0/artifacts/) guide for more on accessing coverage reports.

![artifacts tab screeshot]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

Here are a few examples to demonstrate configuring coverage libraries for
different languages.

## Ruby

[Simplecov](https://github.com/colszowka/simplecov) is a popular Ruby code
coverage library. To get started, add the `simplecov` gem to your `Gemfile`

```
gem 'simplecov', require: false, group: :test
```

Start `simplecov` when your test suite starts. The example below demonstrates
configuring simplecov for usage with Rails.

```ruby
require 'simplecov'        # << Require simplecov
SimpleCov.start 'rails'    # << Start simplecov, using the "Rails" preset.

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
  # Add more helper methods to be used by all tests here...
end
```

Now configure your `.circleci/config.yaml` for uploading your coverage report.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.5.3-node-browsers
        environment:
          RAILS_ENV: test
      - image: circleci/postgres:9.5-alpine
        environment:
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - run:
          name: Bundle Install
          command: bundle check || bundle install
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run:
          name: Database setup
          command: bin/rails db:schema:load --trace
      - run:
          name: Run Tests
          command: bin/rails test
      - store_artifacts:
          path: coverage
```

The [simplecov README](https://github.com/colszowka/simplecov/#getting-started) has more details.

## Python

[Coverage.py](https://coverage.readthedocs.io/en/v4.5.x/) is a popular library
for generating Code Coverage Reports in python. To get started, install
Coverage.py:

```sh
pip install coverage
```

```sh
# previously you might have run your python project like:
python my_program.py arg1 arg2

# now prefix "coverage" to your command.
coverage run my_program.py arg1 arg2
```

In this
[example](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial), you
can generate a coverage report with the following commands:

```sh
coverage run -m pytest
coverage report
coverage html  # open htmlcov/index.html in a browser
```

The generated files will be found under `htmlcov/`, which can be uploaded in a
`store_artifacts` step in your config:

```yaml
version: 2
jobs:
  build:
    docker:
    - image: circleci/python:3.7-node-browsers-legacy
    steps:
    - checkout
    - run:
        name: Setup testing environment
        command: |
          pip install '.[test]' --user
          echo $HOME
    - run:
        name: Run Tests
        command: |
          $HOME/.local/bin/coverage run -m pytest
          $HOME/.local/bin/coverage report
          $HOME/.local/bin/coverage html  # open htmlcov/index.html in a browser
    - store_artifacts:
        path: htmlcov
workflows:
  version: 2
  workflow:
    jobs:
    - build
```

## Java

[JaCoCo](https://github.com/jacoco/jacoco) is a popular library for Java code
coverage. Below is an example pom.xml that includes JUnit and JaCoCo as part of
the build system:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.foo</groupId>
	<artifactId>DemoProject</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>DemoProject</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<maven.compiler.source>1.6</maven.compiler.source>
    	<maven.compiler.target>1.6</maven.compiler.target>
	</properties>

	<dependencies>
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.11</version>
			<scope>test</scope>
		</dependency>
	</dependencies>
	<build>
		<plugins>
			<plugin>
				<groupId>org.jacoco</groupId>
				<artifactId>jacoco-maven-plugin</artifactId>
				<version>0.8.3</version>
				<executions>
					<execution>
						<id>prepare-agent</id>
						<goals>
							<goal>prepare-agent</goal>
						</goals>
					</execution>
					<execution>
						<id>report</id>
						<phase>prepare-package</phase>
						<goals>
							<goal>report</goal>
						</goals>
					</execution>
					<execution>
						<id>post-unit-test</id>
						<phase>test</phase>
						<goals>
							<goal>report</goal>
						</goals>
						<configuration>
							<!-- Sets the path to the file which contains the execution data. -->

							<dataFile>target/jacoco.exec</dataFile>
							<!-- Sets the output directory for the code coverage report. -->
							<outputDirectory>target/my-reports</outputDirectory>
						</configuration>
					</execution>
				</executions>
				<configuration>
					<systemPropertyVariables>
						<jacoco-agent.destfile>target/jacoco.exec</jacoco-agent.destfile>
					</systemPropertyVariables>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>

```

Running `mvn test` will include a code coverage report (an `exec`) file that is
also converted to an `html` page, like many other coverage tools. The Pom file
above writes to the `target` directory, which you can then store as an artifact
in your CircleCI `config.yml` file.

Here is a  minimal CI configuration to correspond with the above example:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/openjdk:11.0-stretch-node-browsers-legacy
    steps:
      - checkout
      - run : mvn test
      - store_artifacts:
          path:  target
```

## JavaScript

[Istanbul](https://github.com/gotwarlost/istanbul) is a popular library for generating code coverage reports for
JavaScript projects. Another popular testing tool, Jest, uses Istanbul to
generage reports. Consider this example:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:10.0-browsers
    steps:
      - checkout
      - run: npm install
      - run:
          name: "Run Jest and Collect Coverage Reports"
          command: jest --collectCoverage=true
      - store_artifacts:
          path: coverage
```

## PHP

PHPUnit is a popular testing framework for PHP. To generate code-coverage
reports you may need to install [PHP Xdebug](https://xdebug.org/) if you are
using an earlier version than PHP 5.6. Versions of PHP after 5.6 have access to
a tool called phpdbg; you can generate a report using the command `phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report`

In the following basic `.circleci/config.yml` we upload the coverage reports in
the `store_artifacts` step at the end of the config.


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7-fpm-browsers-legacy
    steps:
      - checkout
      - run:
          name: "Run tests"
          command: phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report
      - store_artifacts:
          path:  build/coverage-report
```

## Golang

Go has built-in functionality for generating code coverage reports. To generate
reports, add the flag `-coverprofile=c.out`. This will generate a coverage
report which can be converted to html via `go tool`.

```sh
go test -cover -coverprofile=c.out
go tool cover -html=c.out -o coverage.html
```

An example `.circleci/config.yml`:
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/golang:1.11
    steps:
      - checkout
      - run: go build
      - run:
          name: "Create a temp directory for artifacts"
          command: |
            mkdir -p /tmp/artifacts
      - run:
          command: |
            go test -coverprofile=c.out
            go tool cover -html=c.out -o coverage.html
            mv coverage.html /tmp/artifacts
      - store_artifacts:
          path: /tmp/artifacts
```


# Using a Code Coverage Service

## Codecov

Codecov has an [orb](https://circleci.com/orbs) to help make uploading your coverage report easy.

```yaml
version: 2.1
orbs:
  codecov: codecov/codecov@1.0.2
jobs:
  build:
    steps:
      - codecov/upload:
          file: {{ coverage_report_filepath }}
```

Read more about Codecov's orb in their [guest blog post](https://circleci.com/blog/making-code-coverage-easy-to-see-with-the-codecov-orb/).

## Coveralls

If you're a Coveralls customer, follow
[their guide to set up your coverage stats.](https://coveralls.io/docs)
You'll need to add `COVERALLS_REPO_TOKEN` to your CircleCI
[environment variables]( {{ site.baseurl }}/1.0/environment-variables/).

Coveralls will automatically handle the merging of coverage stats in
parallel builds.
