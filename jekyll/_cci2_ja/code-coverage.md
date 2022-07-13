---
layout: classic-docs
title: コードカバレッジ メトリクスの生成
short-title: コードカバレッジ メトリクスの生成
categories:
  - configuration-tasks
description: コードカバレッジ メトリクスの生成
order: 50
sitemap: false
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

コードカバレッジは、アプリケーションがどの程度テストされたかを示します。

CircleCI は、組み込まれている CircleCI 機能をオープンソース ライブラリと組み合わせて、またはパートナーのサービスを使用して、コードカバレッジ レポートのさまざまなオプションを提供しています。

* 目次
{:toc}


## CircleCI でのカバレッジの表示
{: #viewing-coverage-on-circleci }

コードカバレッジ レポートを直接 CircleCI にアップロードできます。 First, add a coverage library to your project and configure your build to write the coverage report to CircleCI's [artifacts directory]({{ site.baseurl }}/artifacts/). コードカバレッジ レポートはビルドアーティファクトとして、参照またはダウンロード可能な場所に保存されます。 See our [build artifacts]({{ site.baseurl }}/artifacts/) guide for more on accessing coverage reports.

![[Artifacts (アーティファクト)] タブのスクリーンショット]( {{ site.baseurl }}/assets/img/docs/artifacts.png
)

言語別にカバレッジ ライブラリを構成する例をいくつか示します。

## Ruby
{: #ruby }

[SimpleCov](https://github.com/colszowka/simplecov) は、よく使用される Ruby コードカバレッジ ライブラリです。 まず、`simplecov` gem を `Gemfile` に追加します。

```ruby
gem 'simplecov', require: false, group: :test
```

テスト スイートの開始時に `simplecov` を実行します。 SimpleCov を Rails と共に使用する場合の設定例を以下に示します。

```ruby
require 'simplecov'        # << SimpleCov が必要です。
SimpleCov.start 'rails'    # << "Rails" プリセットを使用して SimpleCov を起動します。

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # すべてのテストの test/fixtures/*.yml にあるすべてのフィクスチャをアルファベット順にセットアップします。
  fixtures :all
  # すべてのテストで使用されるヘルパー メソッドをここに追加します...
end
```

次に、カバレッジ レポートをアップロードするために `.circleci/config.yaml` を設定します。

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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          RAILS_ENV: test
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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

詳細は、[simplecov README](https://github.com/colszowka/simplecov/#getting-started) を参照してください。

## Python
{: #python }

[Coverage.py](https://coverage.readthedocs.io/en/6.3.1/) は、Python でコードカバレッジレポートを生成する際によく使用されるライブラリです。 最初に、以下のように Coverage.py をインストールします。

```shell
pip install coverage
```

```shell
# これまでは、たとえば以下のように Python プロジェクトを実行していました。
python my_program.py arg1 arg2

# ここでは、コマンドにプレフィックス "coverage" を付けます。
coverage run my_program.py arg1 arg2

```

この[例](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial)では、以下のコマンドを使用してカバレッジレポートを生成できます。

```shell
coverage run -m pytest
coverage report
coverage html  # ブラウザーで htmlcov/index.html を開きます。
```

生成されたファイルは `htmlcov/` 下にあり、コンフィグの `store_artifacts` ステップでアップロードできます。

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
        password: $DOCKERHUB_PASSWORD  ## コンテキスト/プロジェクト UI 環境変数を参照します。
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
          $HOME/.local/bin/coverage html  # ブラウザで htmlcov/index.html を開きます。
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
        password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          $HOME/.local/bin/coverage html  # ブラウザで htmlcov/index.html を開きます。
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
        password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
    - checkout
    - run:
        name: テスト環境のセットアップ
        command: |
          pip install '.[test]' --user
          echo $HOME
    - run:
        name: Run Tests
        command: |
          $HOME/.local/bin/coverage run -m pytest
          $HOME/.local/bin/coverage report
          $HOME/.local/bin/coverage html  # ブラウザで htmlcov/index.html を開きます。
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

[JaCoCo](https://github.com/jacoco/jacoco) は、Java コードカバレッジによく使用されるライブラリです。 ビルドシステムの一部に JUnit と JaCoCo を含む pom.xml の例を以下に示します。

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

`mvn test` を実行するとコードカバレッジレポート (`exec`) ファイルが生成され、他の多くのカバレッジツールと同様に、このファイルが `html` ページにも変換されます。 上記の Pom ファイルは `target` ディレクトリに書き込みを行い、これを CircleCI `config.yml` ファイルでアーティファクトとして保存できます。

上記の例に対応する最小の CI 設定は以下のとおりです。

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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run : mvn test
      - store_artifacts:
          path:  target
```

## JavaScript
{: #javascript }

[Istanbul](https://github.com/gotwarlost/istanbul) は、JavaScript プロジェクトでコードカバレッジレポートの生成によく使用されるライブラリです。 人気のテスト ツールである Jest でも、Istanbul を使用してレポートを生成します。 以下のコード例を参照してください。

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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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

PHPUnit は、よく使用される PHP のテストフレームワークです。 PHP 5.6 より前のバージョンを使用している場合は、コードカバレッジ レポートを生成するには [PHP Xdebug](https://xdebug.org/) をインストールする必要があります。 PHP 5.6以降のバージョンでは、phpdbgというツールにアクセスできます。 `phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report` コマンドでレポートを生成できます。

以下に示した基本の `.circleci/config.yml` では、コンフィグの最後にある `store_artifacts` ステップでカバレッジレポートをアップロードしています。

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

`.circleci/config.yml` の例は以下のとおりです。
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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
{: #using-a-code-coverage-service }

### Codecov
{: #codecov }

Codecov には、カバレッジレポートのアップロードを簡単に行うための [Orb](https://circleci.com/developer/orbs/orb/codecov/codecov) があります。

**注: **Codecov Orb は、パートナーが作成した Orb です。 使用するには、お客様ご自身または組織の管理者が、未承認 Orb の使用をオプトインする必要があります。 この設定は、CircleCI Web アプリの **Organization Settings > Security** で行えます。

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

Codecov の Orb の詳細については、[CircleCI ブログへの寄稿記事](https://circleci.com/blog/making-code-coverage-easy-to-see-with-the-codecov-orb/)を参照してください。

### Coveralls
{: #coveralls }

If you're a Coveralls customer, follow [their guide to set up your coverage stats.](https://docs.coveralls.io/) You'll need to add `COVERALLS_REPO_TOKEN` to your CircleCI [environment variables]({{ site.baseurl }}/env-vars/).

Coveralls は、同時実行ジョブのカバレッジ統計を自動的にマージします。

