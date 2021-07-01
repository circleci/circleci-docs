---
layout: classic-docs
title: コード カバレッジ メトリクスの生成
short-title: コード カバレッジ メトリクスの生成
categories:
  - configuration-tasks
description: コード カバレッジ メトリクスの生成
order: 50
sitemap: false
version:
  - Cloud
  - Server v2.x
---

コード カバレッジは、アプリケーションがどの程度テストされたかを示します。

CircleCI は、組み込みの CircleCI 機能をオープンソース ライブラリと組み合わせて、またはパートナーのサービスを使用して、コード カバレッジ レポートのさまざまなオプションを提供しています。

* 目次
{:toc}


# CircleCI でのカバレッジの表示
{: #viewing-coverage-on-circleci }

コード カバレッジ レポートを直接 CircleCI にアップロードできます。 最初に、プロジェクトにカバレッジ ライブラリを追加し、CircleCI の[アーティファクト ディレクトリ]({{ site.baseurl }}/ja/2.0/artifacts/)にカバレッジ レポートを書き込むようにビルドを構成します。 コード カバレッジ レポートはビルド アーティファクトとして、参照またはダウンロード可能な場所に保存されます。 カバレッジ レポートへのアクセス方法の詳細については、[ビルド アーティファクトに関するドキュメント]({{ site.baseurl }}/ja/2.0/artifacts/)を参照してください。

![[Artifacts (アーティファクト)] タブのスクリーンショット]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

言語別にカバレッジ ライブラリを構成する例をいくつか示します。

## Ruby
{: #ruby }

[SimpleCov](https://github.com/colszowka/simplecov) は、よく使用される Ruby コード カバレッジ ライブラリです。 最初に、`simplecov` gem を `Gemfile` に追加します。

```
gem 'simplecov', require: false, group: :test
```

テスト スイートの開始時に `simplecov` を実行します。 SimpleCov を Rails と共に使用する場合の構成例を以下に示します。

```ruby
require 'simplecov'        # << simplecov が必要です
SimpleCov.start 'rails'    # << "Rails" プリセットを使用して SimpleCov を起動します

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # すべてのテストの test/fixtures/*.yml にあるすべてのフィクスチャをアルファベット順にセットアップします
  fixtures :all
  # すべてのテストで使用されるヘルパー メソッドをここに追加します...

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  # すべてのテストの test/fixtures/*.yml にあるすべてのフィクスチャをアルファベット順にセットアップします
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
          name: バンドル インストール
          command: bundle check || bundle install
      - run:
          name: DB の待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run:
          name: データベースのセットアップ
          command: bin/rails db:schema:load --trace
      - run:
          name: テストの実行
          command: bin/rails test
      - store_artifacts:
          path: coverage
```

この[例](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial)では、以下のコマンドを使用してカバレッジ レポートを生成できます。

## Python
生成されたファイルは `htmlcov/` 下にあり、設定ファイルの `store_artifacts` ステップでアップロードできます。

[Coverage.py](https://coverage.readthedocs.io/en/v4.5.x/) は、Python でコード カバレッジ レポートを生成する際によく使用されるライブラリです。 最初に、以下のように Coverage.py をインストールします。

```sh
pip install coverage
```

```sh
# これまでは、たとえば以下のように Python プロジェクトを実行していました
python my_program.py arg1 arg2

# ここでは、コマンドにプレフィックス "coverage" を付けます
coverage run my_program.py arg1 arg2
coverage run my_program.py arg1 arg2
```

In this [example](https://github.com/pallets/flask/tree/1.0.2/examples/tutorial), you can generate a coverage report with the following commands:

```sh
coverage run -m pytest
coverage report
coverage html  # ブラウザーで htmlcov/index.html を開きます
```

上記の例に対応する最小の CI 構成は以下のとおりです。

```yaml
version: 2
jobs:
  build:
    docker:
    - image: circleci/python:3.7-node-browsers-legacy
    steps:
    - checkout
    - run:
        name: テスト環境のセットアップ
        command: |
          pip install '.[test]' --user
          echo $HOME
    - run:
        name: テストの実行
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
{: #java }

[JaCoCo](https://github.com/jacoco/jacoco) は、Java コード カバレッジによく使用されるライブラリです。 ビルド システムの一部に JUnit と JaCoCo を含む pom.xml の例を以下に示します。

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
                            <!-- コード カバレッジ レポートの出力ディレクトリを設定します -->
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
</project> -->

                            <dataFile>target/jacoco.exec</dataFile>
                            <!-- コード カバレッジ レポートの出力ディレクトリを設定します -->
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

`mvn test` を実行するとコード カバレッジ レポート (`exec`) ファイルが生成され、他の多くのカバレッジ ツールと同様に、このファイルが `html` ページにも変換されます。 上記の Pom ファイルは `target` ディレクトリに書き込みを行い、これを CircleCI `config.yml` ファイルでアーティファクトとして保存できます。

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
`.circleci/config.yml` の例は以下のとおりです。

[Istanbul](https://github.com/gotwarlost/istanbul) は、JavaScript プロジェクトでコード カバレッジ レポートの生成によく使用されるライブラリです。 人気のテスト ツールである Jest でも、Istanbul を使用してレポートを生成します。 以下のコード例を参照してください。

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
          name: "Jest の実行とカバレッジ レポートの収集"
          command: jest --collectCoverage=true
      - store_artifacts:
          path: coverage
```

## PHP
Codecov の Orb の詳細については、[CircleCI ブログへの寄稿記事](https://circleci.com/blog/making-code-coverage-easy-to-see-with-the-codecov-orb/)を参照してください。

PHPUnit は、よく使用される PHP のテスト フレームワークです。 PHP 5.6 以前のバージョンを使用している場合、コード カバレッジ レポートの生成には、[PHP Xdebug](https://xdebug.org/) のインストールが必要になります。 PHP 5.6 以降では、phpdbg ツールにアクセスでき、`phpdbg -qrr vendor/bin/phpunit --coverage-html build/coverage-report` コマンドを使用してレポートを生成できます。

Coveralls は、並列ビルドのカバレッジ統計を自動的にマージします。


```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7-fpm-browsers-legacy
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

Go には、コード カバレッジ レポートを生成する機能が組み込まれています。 レポートを生成するには、`-coverprofile=c.out` フラグを追加します。 これでカバレッジ レポートが生成され、`go tool` を使用して html に変換できます。

```sh
go test -cover -coverprofile=c.out
go tool cover -html=c.out -o coverage.html
```

以下に示した基本の `.circleci/config.yml` では、設定ファイルの末尾にある `store_artifacts` ステップでカバレッジ レポートをアップロードしています。
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


# コード カバレッジ サービスの使用
{: #using-a-code-coverage-service }

## Codecov
{: #codecov }

Codecov には、カバレッジ レポートのアップロードを簡単に行うための [Orb](https://circleci.com/ja/orbs) があります。

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
{: #coveralls }

Coveralls のユーザーは、[カバレッジ統計のセットアップ ガイド](https://coveralls.io/docs)を参照してください。 CircleCI の[環境変数]({{ site.baseurl }}/1.0/environment-variables/)に `COVERALLS_REPO_TOKEN` を追加する必要があります。

Coveralls will automatically handle the merging of coverage stats in concurrent jobs.

