---
layout: classic-docs
title: Generate code coverage metrics
short-title: Generate code coverage metrics
categories: [configuration-tasks]
description: Generate code coverage metrics for different languages.
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Introduction
{: #introduction }

CircleCI provides different options for code coverage reporting using built-in CircleCI features combined with open source libraries, or using partners. Below are a few examples that demonstrate configuring coverage libraries for different languages, as well as how to [view your code coverage](#view-coverage-on-circleci) on the CircleCI web app.

## View coverage on CircleCI
{: #view-coverage-on-circleci }

You can upload your code coverage reports directly to CircleCI. First, add a coverage library to your project and configure your build to write the coverage report to CircleCI's artifacts directory. Code coverage reports will then be stored as build artifacts where they can be viewed or downloaded. See our [build artifacts](/docs/artifacts/) guide for more information on downloading coverage reports stored in your artifacts.

![Artifacts tab in the web app]({{site.baseurl}}/assets/img/docs/artifacts.png)

## Language-specific code coverage options
{: #language-specific-code-coverage-options}

{% include snippets/docker-auth.md %}

### Ruby
{: #ruby }

[SimpleCov](https://github.com/colszowka/simplecov) is a popular Ruby code coverage library. To get started, add the `simplecov` gem to your `Gemfile`.

```ruby
gem 'simplecov', require: false, group: :test
```

Start `simplecov` when your test suite starts. The example below demonstrates configuring SimpleCov for usage with Rails.

```ruby
require 'simplecov'        # << Require SimpleCov
SimpleCov.start 'rails'    # << Start SimpleCov, using the "Rails" preset.

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
  # Add more helper methods to be used by all tests here...
end
```

Now configure your `.circleci/config.yml` file for uploading your coverage report.

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/ruby:3.0-browsers
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:14.0
        environment:
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
    steps:
      - checkout
      - browser-tools/install-browser-tools
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

See the [SimpleCov README](https://github.com/colszowka/simplecov/#getting-started) for more detail.

### Python
{: #python }

[Coverage.py](https://coverage.readthedocs.io/en/6.6.0b1/) is a popular library for generating code coverage reports in Python. To get started, install Coverage.py:

```shell
pip install coverage
```

```shell
# previously you might have run your python project like:
python my_program.py arg1 arg2

# now prefix "coverage" to your command.
coverage run my_program.py arg1 arg2
```

In this [example](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial), you can generate a coverage report with the following commands:

```shell
coverage run -m pytest
coverage report
coverage html  # open htmlcov/index.html in a browser
```

The generated files will be found under `htmlcov/`, which can be uploaded in a `store_artifacts` step in your configuration:

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
    - image: cimg/python:3.10-browsers
    steps:
    - checkout
    - browser-tools/install-browser-tools
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
  test-workflow:
    jobs:
    - build
```

### Java
{: #java }

[JaCoCo](https://github.com/jacoco/jacoco) is a popular library for Java code coverage. Below is an example `pom.xml` file that includes JUnit and JaCoCo as part of the build system:

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

Running `mvn test` will include a code coverage report (an `exec`) file that is also converted to an `html` page, like many other coverage tools. The Pom file above writes to the `target` directory, which you can then store as an artifact in your `.circleci/config.yml` file.

Below is a minimal CI configuration to correspond with the above example:

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0-browsers
    steps:
      - checkout
      - browser-tools/install-browser-tools
      - run : mvn test
      - store_artifacts:
          path:  target
```

### JavaScript
{: #javascript }

[Istanbul](https://github.com/gotwarlost/istanbul) is a popular library for generating code coverage reports for JavaScript projects. Another popular testing tool, Jest, uses Istanbul to generate reports. See the example below:

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/node:17.2-browsers
    steps:
      - checkout
      - browser-tools/install-browser-tools
      - run: npm install
      - run:
          name: "Run Jest and Collect Coverage Reports"
          command: jest --collectCoverage=true
      - store_artifacts:
          path: coverage
```

### PHP
{: #php }

PHPUnit is a popular testing framework for PHP. With PHP, you should have access to a tool called [phpdbg](https://www.php.net/manual/en/book.phpdbg.php). You can generate a report using the command `phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report`.

In the following basic `.circleci/config.yml`, we upload the coverage reports in the `store_artifacts` step at the end of the configuration.

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/php:8.1-browsers
    steps:
      - checkout
      - browser-tools/install-browser-tools
      - run:
          name: "Run tests"
          command: phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report
          environment:
            XDEBUG_MODE: coverage
      - store_artifacts:
          path:  build/coverage-report
```

### Golang
{: #golang }

Go has built-in functionality for generating code coverage reports. To generate reports, add the flag `-coverprofile=c.out`. This will generate a coverage report which can be converted to html via `go tool`.

```shell
go test -cover -coverprofile=c.out
go tool cover -html=c.out -o coverage.html
```

An example `.circleci/config.yml` file:
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/go:1.16
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


## Use a code coverage service
{: #use-a-code-coverage-service }

### CodeCov
{: #codecov }

Codecov has an [orb](https://circleci.com/developer/orbs/orb/codecov/codecov) to help simplify the process of uploading your coverage reports.

The Codecov orb is a partner orb. You or your organization admin will need to opt in to using uncertified orbs in order to use it. This setting is available at **Organization Settings > Security** in the CircleCI web app.

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

### Coveralls
{: #coveralls }

If you are a Coveralls customer, follow their [guide to set up your coverage stats](https://docs.coveralls.io/). You will need to add `COVERALLS_REPO_TOKEN` to your CircleCI [environment variables](/docs/env-vars/).

Coveralls will automatically handle the merging of coverage stats in concurrent jobs.
