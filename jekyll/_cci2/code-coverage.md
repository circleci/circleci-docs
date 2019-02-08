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

## Viewing Coverage on CircleCI

You can upload your code coverage reports directly to CircleCI. First, add a
coverage library to your project and configure your build to write the coverage
report to CircleCI's [artifacts directory]({{ site.baseurl }}/2.0/artifacts/). CircleCI will upload coverage results and make them visible as part of your build.

Here are a few examples to demonstrate configuring coverage libraries for
different languages.

### Ruby 

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

### Python

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


### Java

### JavaScript

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

### Golang

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


## Using a Code Coverage Service
