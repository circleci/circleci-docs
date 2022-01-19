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

コードカバレッジ レポートを直接 CircleCI にアップロードできます。 最初に、プロジェクトにカバレッジ ライブラリを追加し、CircleCI の[アーティファクト ディレクトリ]({{ site.baseurl }}/2.0/artifacts/)にカバレッジ レポートを書き込むようにビルドを設定します。 コードカバレッジ レポートはビルドアーティファクトとして、参照またはダウンロード可能な場所に保存されます。 カバレッジ レポートへのアクセス方法の詳細については、[ビルドアーティファクトに関するドキュメント]({{ site.baseurl }}/ja/2.0/artifacts/)を参照してください。

![[Artifacts (アーティファクト)] タブのスクリーンショット]( {{ site.baseurl }}/assets/img/docs/artifacts.png
)

言語別にカバレッジ ライブラリを構成する例をいくつか示します。

## Ruby
{: #ruby }

[SimpleCov](https://github.com/colszowka/simplecov) は、よく使用される Ruby コードカバレッジ ライブラリです。 まず、`simplecov` gem を `Gemfile` に追加します。

```
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

```yaml
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
      - image: circleci/postgres:9.5-alpine
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

さらに詳しい内容は、[SimpleCov README](https://github.com/colszowka/simplecov/#getting-started) を参照してください。

## Python
{: #python }

[Coverage.py](https://coverage.readthedocs.io/en/v4.5.x/) は、Python でコードカバレッジ レポートを生成する際によく使用されるライブラリです。 まず、以下のように Coverage.py をインストールします。

```sh
pip install coverage
```

```sh
# これまでは、たとえば以下のように Python プロジェクトを実行していました。
python my_program.py arg1 arg2

# ここでは、コマンドにプレフィックス "coverage" を付けます。
coverage run my_program.py arg1 arg2

```

この[例](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial)では、以下のコマンドを使用してカバレッジレポートを生成できます。

```sh
coverage run -m pytest
coverage report
coverage html  # ブラウザーで htmlcov/index.html を開きます。
```

生成されたファイルは `htmlcov/` 下にあり、設定の `store_artifacts` ステップでアップロードできます。

```yaml
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

`mvn test` を実行するとコードカバレッジ レポート (`exec`) ファイルが生成され、他の多くのカバレッジ ツールと同様に、このファイルが `html` ページにも変換されます。 上記の Pom ファイルは `target` ディレクトリに書き込みを行い、これを CircleCI `config.yml` ファイルでアーティファクトとして保存できます。

上記の例に対応する最小の CI 設定は以下のとおりです。

```yaml
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
`.circleci/config.yml` の例は以下のとおりです。

[Istanbul](https://github.com/gotwarlost/istanbul) は、JavaScript プロジェクトでコードカバレッジ レポートの生成によく使用されるライブラリです。 人気のテストツールである Jest でも、Istanbul を使用してレポートを生成します。 以下のコード例を参照してください。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:10.0-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run: npm install
      - run:
          name: "Jest の実行とカバレッジ レポートの収集"
          command: jest --collectCoverage=true
      - store_artifacts:
          path: coverage
```

## PHP
{: #php }

PHPUnit は、よく使用される PHP のテスト フレームワークです。 PHP 5.6 より前のバージョンを使用している場合は、コードカバレッジ レポートを生成するには [PHP Xdebug](https://xdebug.org/) をインストールする必要があります。 PHP 5.6以降のバージョンでは、phpdbgというツールにアクセスできます。 `phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report` コマンドでレポートを生成できます。

以下に示した基本の `.circleci/config.yml` では、設定の最後にある `store_artifacts` ステップでカバレッジレポートをアップロードしています。


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7-fpm-browsers-legacy
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run:
          name: "テストの実行"
          command: phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report
      - store_artifacts:
          path:  build/coverage-report
```

## Golang
{: #golang }

Go には、コードカバレッジ レポートを生成する機能が組み込まれています。 レポートを生成するには、`-coverprofile=c.out` フラグを追加します。 これでカバレッジレポートが生成され、`go tool` を使用して html に変換できます。

```sh
go test -cover -coverprofile=c.out
go tool cover -html=c.out -o coverage.html
```

`.circleci/config.yml` の例は以下のとおりです。
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/golang:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run: go build
      - run:
          name: "アーティファクト用の一時ディレクトリの作成"
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


# Using a code coverage service
{: #using-a-code-coverage-service }

## Codecov
{: #codecov }

Codecov には、カバレッジレポートのアップロードを簡単に行うための [Orb](https://circleci.com/ja/orbs) があります。

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

## Coveralls
{: #coveralls }

Coveralls のユーザーは、[カバレッジ統計の設定ガイド](https://docs.coveralls.io/)を参照してください。CircleCI の[環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)に `COVERALLS_REPO_TOKEN` を追加する必要があります。

Coveralls は、同時処理ジョブのカバレッジ統計を自動的にマージします。

