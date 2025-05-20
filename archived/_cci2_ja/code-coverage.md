---
layout: classic-docs
title: コードカバレッジメトリクスの生成
description: コードカバレッジメトリクスの生成
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

## 概要
{: #introduction }

CircleCI では、CircleCI に組み込まれている機能をオープンソースライブラリと組み合わせて、またはパートナーのサービスを使用して、コードカバレッジ レポートのさまざまなオプションを提供しています。 以下のコード例では、各言語のカバレッジライブラリの設定方法や CircleCI Web アプリで[コードカバレッジを閲覧する](#view-coverage-on-circleci)方法を紹介します。

## Ruby
{: #ruby }

[SimpleCov](https://github.com/colszowka/simplecov) は、よく使用される Ruby コードカバレッジライブラリです。 まず、`simplecov` gem を `Gemfile` に追加します。

```ruby
gem 'simplecov', require: false, group: :test
```

テストスイートの開始時に `simplecov` を実行します。 以下は SimpleCov を Rails で使用する場合の設定例です。

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

次に、カバレッジレポートをアップロードするために `.circleci/config.yaml` ファイルを設定します。

{:.tab.ruby_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/ruby:3.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.ruby_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/ruby:3.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.ruby_example.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with
# browser testing require the use of the CircleCI browser-tools orb, available
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.5.3-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

詳細については、 [SimpleCov README](https://github.com/colszowka/simplecov/#getting-started) を参照してください。

## Python
{: #python }

[Coverage.py](https://coverage.readthedocs.io/en/6.6.0b1/) は、Python でコードカバレッジレポートを生成する際によく使用されるライブラリです。 まず、以下のように Coverage.py をインストールします。

```shell
pip install coverage
```

```shell
# previously you might have run your python project like:
python my_program.py arg1 arg2

# now prefix "coverage" to your command.
coverage run my_program.py arg1 arg2
```

この[例](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial)では、以下のコマンドを使用してカバレッジ レポートを生成できます。

```shell
coverage run -m pytest
coverage report
coverage html  # open htmlcov/index.html in a browser
```

生成されたファイルは `htmlcov/` 下にあり、設定ファイルの `store_artifacts` ステップでアップロードできます。

{:.tab.python_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
    - image: cimg/python:3.10-browsers
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.python_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
    - image: cimg/python:3.10-browsers
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.python_example.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with
# browser testing require the use of the CircleCI browser-tools orb, available
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
    - image: circleci/python:3.7-node-browsers-legacy
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
{: #java }

[JaCoCo](https://github.com/jacoco/jacoco) は、Java コードカバレッジによく使用されるライブラリです。 以下は、ビルドシステムの一部に JUnit と JaCoCo を含む `pom.xml `のコード例です。

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

`mvn test` を実行するとコードカバレッジレポート (`exec`) ファイルが生成され、他の多くのカバレッジツールと同様に、このファイルが `html` ページにも変換されます。 上記の Pom ファイルは `target` ディレクトリに書き込みを行い、これを CircleCI `.circleci/config.yml` ファイルでアーティファクトとして保存できます。

上記の例に対応する最小限の CI 設定は以下のとおりです。

{:.tab.java_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - browser-tools/install-browser-tools
      - run : mvn test
      - store_artifacts:
          path:  target
```

{:.tab.java_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - browser-tools/install-browser-tools
      - run : mvn test
      - store_artifacts:
          path:  target
```

{:.tab.java_example.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with
# browser testing require the use of the CircleCI browser-tools orb, available
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
      - image: circleci/openjdk:11.0-stretch-node-browsers-legacy
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run : mvn test
      - store_artifacts:
          path:  target
```

## JavaScript
{: #javascript }

[Istanbul](https://github.com/gotwarlost/istanbul) は、JavaScript プロジェクトでコードカバレッジレポートの生成によく使用されるライブラリです。 人気のテストツールである Jest でも、Istanbul を使用してレポートを生成します。 以下のコード例を参照してください。

{:.tab.js_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/node:17.2-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.js_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/node:17.2-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.js_example.Server_2}

```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with
# browser testing require the use of the CircleCI browser-tools orb, available
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:14.17-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
{: #php }

PHPUnit は、よく使用される PHP のテストフレームワークです。 PHP では、[phpdbg](https://www.php.net/manual/en/book.phpdbg.php) というツールへのアクセスが必要です。 レポートは、`phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report` コマンドを使って生成します。

以下の基本的な `.circleci/config.yml` では、設定ファイルの最後にある `store_artifacts` ステップでカバレッジレポートをアップロードしています。

{:.tab.php_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/php:8.1-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.php_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/php:8.1-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

{:.tab.php_example.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with
# browser testing require the use of the CircleCI browser-tools orb, available
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7-fpm-browsers-legacy
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "Run tests"
          command: phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report
          environment:
            XDEBUG_MODE: coverage
      - store_artifacts:
          path:  build/coverage-report

```

## Golang
{: #golang }

Go には、コードカバレッジレポートを生成する機能が組み込まれています。 レポートを生成するには、`-coverprofile=c.out` フラグを追加します。 これでカバレッジレポートが生成され、`go tool` を使用して html に変換できます。

```shell
go test -cover -coverprofile=c.out
go tool cover -html=c.out -o coverage.html
```

以下は `.circleci/config.yml` ファイルの例です。
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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


## コードカバレッジ サービスの使用
{: #use-a-code-coverage-service }

### Codecov
{: #codecov }

Codecov には、カバレッジレポートのアップロードを簡単に行うための [Orb](https://circleci.com/developer/orbs/orb/codecov/codecov) があります。

Codecov Orb はパートナー製の Orb です。 使用するには、お客様ご自身または組織の管理者が、未承認 Orb の使用をオプトインする必要があります。 この設定は、CircleCI Web アプリの **Organization Settings > Security** で行えます。

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

Codecov の Orb の詳細については、[ゲストによるブログ記事](https://circleci.com/blog/making-code-coverage-easy-to-see-with-the-codecov-orb/)を参照してください。

### Coveralls
{: #coveralls }

Coveralls をご使用の場合は、Coveralls の [guide to set up your coverage stats](https://docs.coveralls.io/) に従ってください。 CircleCI [環境変数]({{site.baseurl}}/env-vars/) に `COVERALLS_REPO_TOKEN` を追加する必要があります。

Coveralls は、同時実行ジョブのカバレッジ統計を自動的にマージします。

## CircleCI でのカバレッジの表示
{: #view-coverage-on-circleci }

コードカバレッジレポートを直接 CircleCI にアップロードできます。 まず、プロジェクトにカバレッジライブラリを追加し、CircleCI のアーティファクトディレクトリにカバレッジレポートを書き込むようにビルドを設定します。 コードカバレッジレポートはビルドアーティファクトとして、参照またはダウンロード可能な場所に保存されます。 アーティファクトに保存されたカバレッジレポートのダウンロードの詳細については、[ビルドアーティファクト]({{site.baseurl}}/artifacts/)に関するガイドを参照してください。

![Artifacts タブのスクリーンショット]({{site.baseurl}}/assets/img/docs/artifacts.png)
