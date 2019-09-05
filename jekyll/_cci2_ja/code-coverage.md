---
layout: classic-docs
title: コードカバレッジメトリクスの生成
short-title: コードカバレッジメトリクスの生成
categories: [configuration-tasks]
description: コードカバレッジメトリクスの生成
order: 50
sitemap: false
---

コードカバレッジは、アプリケーションがどの程度テストされたかを示します。

CircleCI は、組み込みの CircleCI 機能をオープンソースライブラリと組み合わせて、またはパートナーのサービスを使用して、コードカバレッジレポートのさまざまなオプションを提供しています。

* 目次
{:toc}


# CircleCI でのカバレッジの表示

コードカバレッジレポートを直接 CircleCI にアップロードできます。 最初に、プロジェクトにカバレッジライブラリを追加し、CircleCI の[アーティファクトディレクトリ]({{ site.baseurl }}/ja/2.0/artifacts/)にカバレッジレポートを書き込むようにビルドを設定します。 CircleCI は、カバレッジの結果をアップロードし、ビルドの一部として表示できるようにします。

カバレッジライブラリを設定する例を言語ごとにいくつか示します。

## Ruby

[SimpleCov](https://github.com/colszowka/simplecov) は、よく使用される Ruby コードカバレッジライブラリです。 最初に、`simplecov` gem を `Gemfile` に追加します。

    gem 'simplecov', require: false, group: :test


テストスイートの開始時に `simplecov` を実行します。 simplecov を Rails と共に使用する場合の設定例を以下に示します。

```ruby
require 'simplecov'        # << simplecov が必要です
SimpleCov.start 'rails'    # << "Rails" プリセットを使用して simplecov を起動します

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # すべてのテストの test/fixtures/*.yml にあるすべてのフィクスチャをアルファベット順にセットアップします
  fixtures :all
  # すべてのテストで使用されるヘルパーメソッドをここに追加します...
end
```

次に、カバレッジレポートをアップロードするために `.circleci/config.yaml` を設定します。

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
          name: バンドルインストール
          command: bundle check || bundle install
      - run:
          name: DB を待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run:
          name: データベースのセットアップ
          command: bin/rails db:schema:load --trace
      - run:
          name: テストを実行
          command: bin/rails test
      - store_artifacts:
          path: coverage
```

[simplecov README](https://github.com/colszowka/simplecov/#getting-started) に、さらに詳細な説明があります。

## Python

[Coverage.py](https://coverage.readthedocs.io/en/v4.5.x/) は、Python でコードカバレッジレポートを生成する際によく使用されるライブラリです。 最初に、以下のように Coverage.py をインストールします。

```sh
pip install coverage
```

```sh
# これまでは、たとえば以下のように python プロジェクトを実行していました
python my_program.py arg1 arg2

# ここでは、コマンドにプレフィックス "coverage" を付けます
coverage run my_program.py arg1 arg2
```

この[例](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial)では、以下のコマンドを使用してカバレッジレポートを生成できます。

```sh
coverage run -m pytest
coverage report
coverage html  # ブラウザーで htmlcov/index.html を開きます
```

生成されたファイルは `htmlcov/` 下にあり、コンフィグの `store_artifacts` ステップでアップロードできます。

```yaml
version: 2
jobs:
  build:
    docker:
    - image: circleci/python:3.7-node-browsers-legacy
    steps:
    - checkout
    - run:
        name: テスト環境をセットアップ
        command: |
          pip install '.[test]' --user
          echo $HOME
    - run:
        name: テストを実行
        command: |
          $HOME/.local/bin/coverage run -m pytest
          $HOME/.local/bin/coverage report
          $HOME/.local/bin/coverage html  # ブラウザーで htmlcov/index.html を開きます
    - store_artifacts:
        path: htmlcov
workflows:
  version: 2
  workflow:
    jobs:
    - build
```

## Java

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
                            <!-- 実行データを含むファイルのパスを設定します -->

                            <dataFile>target/jacoco.exec</dataFile>
                            <!-- コードカバレッジレポートの出力ディレクトリを設定します -->
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

[Istanbul](https://github.com/gotwarlost/istanbul) は、JavaScript プロジェクトでコードカバレッジレポートの生成によく使用されるライブラリです。 人気のテストツールである Jest でも、Istanbul を使用してレポートを生成します。 以下のコード例を参照してください。

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
          name: "Jest を実行し、カバレッジレポートを収集"
          command: jest --collectCoverage=true
      - store_artifacts:
          path: coverage
```

## PHP

PHPUnit は、よく使用される PHP のテストフレームワークです。 PHP 5.6 よりも前のバージョンを使用している場合、コードカバレッジレポートを生成するには、[PHP Xdebug](https://xdebug.org) のインストールが必要になります。PHP 5.6 以降では、phpdbg ツールにアクセスでき、`phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report` コマンドを使用してレポートを生成できます。

以下に示した基本の `.circleci/config.yml` では、コンフィグの最後にある `store_artifacts` ステップでカバレッジレポートをアップロードしています。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7-fpm-browsers-legacy
    steps:
      - checkout
      - run:
          name: "テストを実行"
          command: phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report
      - store_artifacts:
          path:  build/coverage-report
```

## Golang

Go には、コードカバレッジレポートを生成する機能が組み込まれています。 レポートを生成するには、`-coverprofile=c.out` フラグを追加します。 これでカバレッジレポートが生成され、`go tool` を使用して html に変換できます。

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
      - image: circleci/golang:1.11
    steps:
      - checkout
      - run: go build
      - run:
          name: "アーティファクト用の一時ディレクトリを作成"
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

# コードカバレッジサービスの使用

## Codecov

Codecov には、カバレッジレポートのアップロードを簡単に行うための [Orb](https://circleci.com/orbs) があります。

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

Coveralls のユーザーは、[カバレッジ統計の設定ガイド](https://coveralls.io/docs)を参照してください。CircleCI の[環境変数]({{ site.baseurl }}/1.0/environment-variables/)に `COVERALLS_REPO_TOKEN` を追加する必要があります。

Coveralls は、並列ビルドのカバレッジ統計を自動的にマージします。
