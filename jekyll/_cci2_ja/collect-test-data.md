---
layout: classic-docs
title: "テスト メタデータの収集"
short-title: "テスト メタデータの収集"
description: "テスト メタデータの収集"
order: 34
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI では、XML ファイルからテスト メタデータを収集し、それを使用してジョブに関するインサイトを提供しています。 ここでは、よく使用されるテストランナー用にテストメタデータを XML として出力し、`store_test_results` ステップでレポートを保存するように CircleCI を設定する方法について説明します。

* 目次
{:toc}

[`store_test_results `]({{ site.baseurl}}/2.0/configuration-reference/#store_test_results)ステップを使用すると、テスト結果をアップロードして保存することができ、成功したテストおよび失敗したテストの読みやすい UI が提供されます。

下記のように、特定の [ジョブ]({{ site.baseurl}}/2.0/concepts/#jobs) を表示して、*テスト* タブからテスト結果のインターフェースにアクセスできます。

![store-test-results-view]( {{ site.baseurl }}/assets/img/docs/test-summary.png)

テスト結果をビルドアーティファクトとして表示するには、[`store_artifacts`]({{ site.baseurl}}/2.0/configuration-reference/#store_artifacts) ステップを使ってテスト結果をアップロードします。

設定ファイルでは、以下のように [`store_test_results`]({{ site.baseurl}}/2.0/configuration-reference/#store_test_results) キーが使用されます。

```yml
- store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML または Cucumber JSON テスト メタデータ ファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パス、またはすべてのテスト結果が含まれる一つのファイルのパスです。 この `path` の値が非表示のフォルダーではないことを確認してください (たとえば `.my_hidden_directory` は無効な形式です)。

**If you are using CircleCI server v2.x**, after configuring CircleCI to collect your test metadata, tests that fail most often appear in a list on the **Insights** page in the CircleCI application where you can identify flaky tests and isolate recurring issues.

![失敗したテストに関するインサイト]( {{ site.baseurl }}/assets/img/docs/insights.png)

_The above screenshot applies to CircleCI server v2.x only._

**If you are using CircleCI cloud or server 3.x**, see the [API v2 Insights endpoints](https://circleci.com/docs/api/v2/#circleci-api-insights) to find test failure information.

## フォーマッタの有効化
{: #enabling-formatters }

Test metadata is not automatically collected in CircleCI until you enable the JUnit formatters. RSpec、Minitest、および Django に対して、以下の設定を追加してフォーマッタを有効化します。

- RSpec では、gemfile に以下を追加する必要があります。

```ruby
gem 'rspec_junit_formatter'
```

- Minitest では、gemfile に以下を追加する必要があります。

```ruby
gem 'minitest-ci'
```

- Django は、[django-nose](https://github.com/django-nose/django-nose) テストランナーを使用して設定する必要があります。

**注意:** iOS アプリケーションをテストする方法は、[macOS での iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)をご覧ください。

## カスタム テストステップでのメタデータの収集
{: #metadata-collection-in-custom-test-steps }

ほとんどのテストランナーで何らかの形式でサポートされている JUnit XML 出力を生成するカスタム テストステップがある場合は、 XML ファイルを以下のようにサブディレクトリに書き込みます。
```yml
- store_test_results:
    path: /tmp/test-results
```

### カスタム テストランナーの例
{: #custom-test-runner-examples }

このセクションでは、以下のテスト ランナーの例を示します。

| 言語         | Test Runner  | Formatter                                                                                 | Example(s)                                                                                                                                    |  |  |
|:---------- |:------------ |:----------------------------------------------------------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------------- |  |  |
| JavaScript | Jest         | [jest-junit](https://www.npmjs.com/package/jest-junit)                                    | [例]({{ site.baseurl }}/2.0/collect-test-data/#jest)                                                                                           |  |  |
| JavaScript | Mocha        | [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)                | [example]({{site.baseurl}}/2.0/collect-test-data/#mocha-for-node), [example with NYC]({{site.baseurl}}/2.0/collect-test-data/#mocha-with-nyc) |  |  |
| JavaScript | Karma        | [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter)                | [例]({{site.baseurl}}/2.0/collect-test-data/#karma)                                                                                            |  |  |
| JavaScript | AVA          | [tap-xunit](https://github.com/aghassemi/tap-xunit)                                       | [例]({{site.baseurl}}/2.0/collect-test-data/#ava-for-node)                                                                                     |  |  |
| JavaScript | ESLint       | [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit)                    | [例]({{site.baseurl}}/2.0/collect-test-data/#eslint)                                                                                           |  |  |
| Ruby       | RSpec        | [rspec_junit_formatter](https://rubygems.org/gems/rspec_junit_formatter/versions/0.2.3) | [例]({{site.baseurl}}/2.0/collect-test-data/#rspec)                                                                                            |  |  |
| Ruby       | Minitest     | [minitest-ci](https://rubygems.org/gems/minitest-ci)                                      | [例]({{site.baseurl}}/2.0/collect-test-data/#minitest)                                                                                         |  |  |
|            | Cucumber     | built in                                                                                  | [例]({{site.baseurl}}/2.0/collect-test-data/#cucumber)                                                                                         |  |  |
| Python     | pytest       | built in                                                                                  | [例]({{site.baseurl}}/2.0/collect-test-data/#pytest)                                                                                           |  |  |
| Python     | unittest     | Use [pytest](https://docs.pytest.org/en/6.2.x/unittest.html) to run these tests           | [例]({{site.baseurl}}/2.0/collect-test-data/#unittest)                                                                                         |  |  |
| Java       | Maven        | [Maven Surefire plugin](https://maven.apache.org/surefire/maven-surefire-plugin/)         | [例]({{site.baseurl}}/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)                                                     |  |  |
| Java       | Gradle       | built in                                                                                  | [例]({{site.baseurl}}/2.0/collect-test-data/#gradle-junit-test-results)                                                                        |  |  |
| PHP        | PHPUnit      | built in                                                                                  | [例]({{site.baseurl}}/2.0/collect-test-data/#phpunit)                                                                                          |  |  |
| .NET       |              | [trx2junit](https://github.com/gfoidl/trx2junit)                                          | [例]({{site.baseurl}}/2.0/collect-test-data/#dot-net)                                                                                          |  |  |
| Clojure    | Kaocha       | [kaocha-junit-xml](https://clojars.org/lambdaisland/kaocha-junit-xml)                     | [例]({{site.baseurl}}/2.0/collect-test-data/#kaocha)                                                                                           |  |  |
| Clojure    | clojure.test | [test2junit](https://github.com/ruedigergad/test2junit)                                   | [例]({{site.baseurl}}/2.0/collect-test-data/#test2junit-for-clojure-tests)                                                                     |  |  |
{: class="table table-striped"}

#### JavaScript
`.circleci/config.yml` の例は以下のとおりです。

##### Jest
{: #jest }
{:.no_toc}

Jest で JUnit の互換テストデータを出力するには、[jest-junit](https://www.npmjs.com/package/jest-junit)を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yml
steps:
  - run:
      name: カバレッジ レポーターのインストール
      command: yarn add --dev jest-junit
  - run:
      name: JUnit でレポーターとしてテストを実行
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT_DIR: ./reports/junit/
  - store_test_results:
      path: ./reports/junit/
  - store_artifacts:
      path: ./reports/junit
```

全体の手順については、Viget の記事「[Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint)」を参照してください。 記事の中の jest cli 引数 `--testResultsProcessor` の使用は、 `--reporters`の構文に置き換えられているのでご注意ください。また、JEST_JUNIT_OUTPUT は `JEST_JUNIT_OUTPUT_DIR` および `JEST_JUNIT_OUTPUT_NAME` に置き換えられています（上図参照）。

**注意:** Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest は、ジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は、仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

`--runInBand` の詳細については、[Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) ドキュメントを参照してください。 この問題の詳細については、公式 Jest リポジトリの [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) と [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) を参照してください。

#### Node.js 用の Mocha
{: #mocha-for-node }
{:.no_toc}

Mocha テスト ランナーで JUnit テストを出力するには、[JUnit Reporter for Mocha](https://www.npmjs.com/package/mocha-junit-reporter) を使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下のようになります。

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
      - store_artifacts:
          path: ~/junit
```

#### Mocha と nyc の組み合わせ
{: #mocha-with-nyc }
{:.no_toc}

以下は、[marcospgp](https://github.com/marcospgp) から提供された、Mocha と nyc の組み合わせに使用できるサンプルの全文です。

{% raw %}
```yml
version: 2
jobs:
    build:
        environment:
            CC_TEST_REPORTER_ID: code_climate_id_here
            NODE_ENV: development
        docker:
            - image: circleci/node:14
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
              environment:
                MONGODB_URI: mongodb://admin:password@localhost:27017/db?authSource=admin
            - image: mongo:4.0
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
              environment:
                MONGO_INITDB_ROOT_USERNAME: admin
                MONGO_INITDB_ROOT_PASSWORD: password
        working_directory: ~/repo
        steps:
            - checkout

            # npm を更新します。
            - run:
                name: update-npm
                command: 'sudo npm install -g npm@latest'

            # 依存関係をダウンロードしてキャッシュします。
            - restore_cache:
                keys:
                    - v1-dependencies-{{ checksum "package-lock.json" }}
                    # 完全一致がない場合、最新のキャッシュを使うようにフォールバックします。
                    - v1-dependencies-

            - run: npm install

            - run: npm install mocha-junit-reporter # just for CircleCI

            - save_cache:
                paths:
                    - node_modules
                key: v1-dependencies-{{ checksum "package-lock.json" }}

            - run: mkdir reports

            # Mocha を実行します。
            - run:
                name: npm テスト
                command: ./node_modules/.bin/nyc ./node_modules/.bin/mocha --recursive --timeout=10000 --exit --reporter mocha-junit-reporter --reporter-options mochaFile=reports/mocha/test-results.xml
                when: always

            # ESLint を実行します。
            - run:
                name: ESLint
                command: |
                    ./node_modules/.bin/eslint ./ --format junit --output-file ./reports/eslint/eslint.xml
                when: always

            # Code Climate のカバレッジ レポートを実行します。

            - run:
                name: Code Climate のテストレポーターのセットアップ
                command: |
                    # 静的バイナリとしてテストレポーターをダウンロードします。
                    curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
                    chmod +x ./cc-test-reporter
                    ./cc-test-reporter before-build
                when: always

            - run:
                name: code-coverage
                command: |
                    mkdir coverage
                    # nyc レポートが nyc が既に実行されていることを要求します。
                    # それにより必要なデータを含む .nyc_output フォルダが作成されます。
                    ./node_modules/.bin/nyc report --reporter=text-lcov > coverage/lcov.info
                    ./cc-test-reporter after-build -t lcov
                when: always

            # 結果をアップロードします。

            - store_test_results:
                path: reports

            - store_artifacts:
                path: ./reports/mocha/test-results.xml

            - store_artifacts:
                path: ./reports/eslint/eslint.xml

            - store_artifacts: # upload test coverage as artifact
                path: ./coverage/lcov.info
                prefix: tests

```
{% endraw %}

##### Karma
{: #karma }
{:.no_toc}

Karma テストランナーで JUnit テストを出力するには、[karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter) を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

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
      - store_artifacts:
          path: ./junit
```

```javascript
// karma.conf.js

// 追加コンフィグ...
{
  reporters: ['junit'],
  junitReporter: {
    outputDir: process.env.JUNIT_REPORT_PATH,
    outputFile: process.env.JUNIT_REPORT_NAME,
    useBrowserName: false
  },
}
// 追加コンフィグ...
```

#### Node.js 用の AVA
{: #ava-for-node }
{:.no_toc}

[AVA](https://github.com/avajs/ava) テスト ランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

```yml
    steps:
      - run:
          command: |
            yarn add ava tap-xunit --dev # または npm も使用できます。
            mkdir -p ~/reports
            ava --tap | tap-xunit > ~/reports/ava.xml
          when: always
      - store_test_results:
          path: ~/reports
      - store_artifacts:
          path: ~/reports
```


#### ESLint
{: #eslint }
{:.no_toc}

[ESLint](http://eslint.org/) から JUnit 結果を出力するには、[JUnit フォーマッタ](http://eslint.org/docs/user-guide/formatters/#junit)を使用します。

`.circleci/config.yml` の作業テスト セクションは、以下のようになります。

```yml
    steps:

      - run:
          command: |
            yarn add ava tap-xunit --dev # または npm を使用できます
            mkdir -p ~/reports
            ava --tap | tap-xunit > ~/reports/ava.xml
          when: always

      - store_test_results:
          path: ~/reports

      - store_artifacts:
          path: ~/reports
```

#### Ruby
{: #ruby }

###### RSpec
{: #rspec }
{:.no_toc}

カスタム `rspec` ビルド ステップを使用するプロジェクトにテスト メタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

```ruby
gem 'rspec_junit_formatter'
```

さらに、テスト コマンドを以下のように変更します。

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

##### Minitest
{: #minitest }
{:.no_toc}

カスタム `minitest` ビルド ステップを使用するプロジェクトにテスト メタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

```ruby
gem 'minitest-ci'
```

さらに、テスト コマンドを以下のように変更します。

```yml
    steps:
      - checkout
      - run: bundle check || bundle install
      - run:
          command: bundle exec rake test
          when: always
      - store_test_results:


See the [minitest-ci README](https://github.com/circleci/minitest-ci#readme) for more info.
```

詳細については、[minitest-ci README](https://github.com/circleci/minitest-ci#readme) を参照してください。

#### Cucumber
{: #cucumber }

カスタム Cucumber ステップの場合は、JUnit フォーマッタを使用してファイルを生成し、それを `cucumber` ディレクトリに書き込む必要があります。  `.circleci/config.yml` ファイルに追加するコードの例は以下のとおりです。

```yml
    steps:
      - run:
          name: テスト結果の保存
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format junit --out ~/cucumber/junit.xml
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber
```

`path:` は、ファイルが格納されるディレクトリをプロジェクトのルート ディレクトリからの相対ディレクトリで指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーション内の**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示します。

または、Cucumber の JSON フォーマッタを使用する場合は、出力ファイルに `.cucumber` で終わる名前を付け、それを `/cucumber` ディレクトリに書き出します。 例えば下記のようにします。

```yml
    steps:
      - run:
          name: テスト結果の保存
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format pretty --format json --out ~/cucumber/tests.cucumber
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber
```

#### Python
{: #python }

##### pytest
{: #pytest }
{:.no_toc}

`pytest` を使用するプロジェクトにテスト メタデータを追加するには、JUnit XML を出力するように指定したうえで、テスト メタデータを保存します。

```yml
      - run:
          name: テストの実行
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml

      - store_test_results:
          path: test-results

      - store_artifacts:
          path: test-results
```

##### unittest
{: #unittest }
{:.no_toc}

unittest does not support JUnit XML, but in almost all cases you can [run unittest tests with pytest](https://docs.pytest.org/en/6.2.x/unittest.html).

After adding pytest to your project, you can produce and upload the test results like this:
```yml
      - run:
          name: テストの実行
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml tests

      - store_test_results:
          path: test-results

      - store_artifacts:
          path: test-results
```

#### Java
{: #java }

#### Java JUnit の結果に使用する Maven Surefire プラグイン
{: #maven-surefire-plugin-for-java-junit-results }
{:.no_toc}

[Maven](http://maven.apache.org/) ベースのプロジェクトをビルドする場合は、[Maven Surefire プラグイン](http://maven.apache.org/surefire/maven-surefire-plugin/)を使用して XML 形式のテスト レポートを生成することがほとんどです。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yml
    steps:
      - run:
          name: テスト結果の保存
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
      - store_artifacts:
          path: ~/test-results/junit
```

#### Gradle JUnit のテスト結果
{: #gradle-junit-test-results }
{:.no_toc}

[Gradle](https://gradle.org/) で Java または Groovy ベースのプロジェクトをビルドする場合は、テスト レポートが XML 形式で自動的に生成されます。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yml
    steps:
      - run:
          name: テスト結果の保存
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
      - store_artifacts:
          path: ~/test-results/junit
```

#### PHP
{: #php }

##### PHPUnit
{: #phpunit }
{:.no_toc}

PHPUnit テストの場合は、`--log-junit` コマンド ライン オプションを使用してファイルを生成し、それを `/phpunit` ディレクトリに書き込む必要があります。 `.circleci/config.yml` は以下のようになります。

```
    {{ site.baseurl }}/ja/2.0/collect-test-data/#phpunit
```

#### .NET
{: #dot-net }

##### Visual Studio/.NET Core テスト用の trx2junit
{: #trx2junit-for-visual-studio-net-core-tests }
{:.no_toc}
Visual Studio または .NET Core で出力される trx ファイルを XML 形式に変換するには、[trx2junit](https://github.com/gfoidl/trx2junit) を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

A working `.circleci/config.yml` section might look like this:

```yml
    steps:
      - checkout
      - run: dotnet build
      - run: dotnet test --no-build --logger "trx"
      - run:
          name: テスト結果
          when: always
          command: |
              dotnet tool install -g trx2junit
              export PATH="$PATH:/root/.dotnet/tools"
              trx2junit tests/**/TestResults/*.trx
      - store_test_results:
          path: tests/TestResults
      - store_artifacts:
          path: tests/TestResults
          destination: TestResults
```

#### Clojure
{: #clojure }

##### Kaocha
{: #kaocha }
{:.no_toc}

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
version: 2
jobs:
  build:
    docker:
      - image: circleci/clojure:tools-deps-1.9.0.394
    steps:
      - checkout
      - run: bin/kaocha
      - store_test_results:
          path: junit.xml
```

##### Clojure テスト用の test2junit
{: #test2junit-for-clojure-tests }
{:.no_toc}

Clojure のテスト出力を XML 形式に変換するには、[test2junit](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプルプロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

## API
{: #api }

実行時のテスト メタデータに API からアクセスするには、[テスト メタデータ API ドキュメント](https://circleci.com/docs/api/#get-build-test-metadata)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

[インサイトの利用]({{ site.baseurl }}/2.0/insights/)

## ビデオ: テスト ランナーのトラブルシューティング
{: #video-troubleshooting-test-runners }
{:.no_toc}

<iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
