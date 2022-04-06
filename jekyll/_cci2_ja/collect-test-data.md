---
layout: classic-docs
title: "テストデータの収集"
description: "CircleCI プロジェクトにおけるテストデータ収集に関するガイド"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI でテストを実行する場合、テスト結果を保存する方法が 2 つあります。 [アーティファクト]({{site.baseurl}}/ja/2.0/artifacts)を使用する方法と [`store_test_results` ステップ]({{site.baseurl}}/ja/2.0/configuration-reference/#storetestresults)を使用する方法です。 それぞれの方法にメリットがあるので、プロジェクト毎に決定する必要があります。

`store_test_results` ステップを使ってデータを保存する場合、CircleCI はデータを XML ファイルから収集し、そのデータを使ってジョブのインサイトを提供します。 ここでは、よく使用されるテストランナー用にテストデータを XML として出力し、`store_test_results` ステップでレポートを保存するように CircleCI を設定する方法について説明します。

**`store_test_results` ステップ** を使うと以下が可能です。

* CircleCI Web アプリの **テスト**
* テストインサイトと結果が不安定なテストの検出
* テストの分割

一方で、テスト結果を**アーティファクト**として保存すると、生の XML を見ることができます。 これは、プロジェクトにおけるテスト結果の処理の設定に関する問題をデバッグする際に便利です。たとえば、誤ってアップロードしたファイルを探す場合に効果的です。

テスト結果をビルドアーティファクトとして表示するには、[`store_artifacts`]({{site.baseurl}}/ja/2.0/configuration-reference/#storeartifacts) ステップを使ってテスト結果をアップロードします。 アーティファクトはストレージを使用します。そのため、アーティファクトの保存によって料金が発生します。 アーティファクトなどのオブジェクトをストレージに保存する期間をカスタマイズする方法については、[データの永続化のページ]({{site.baseurl}}/ja/2.0/persist-data/#custom-storage-usage)を参照してください。

**注: ** `store_test_results` と `store_artifacts` の両方を使ってテスト結果をアップロードすることも可能です。

* 目次
{:toc}

## 概要
{: #overview }

[`store_test_results `ステップ]({{site.baseurl}}/ja/2.0/configuration-reference/#storetestresults)を使用すると、テスト結果をアップロードして保存することができ、また CircleCI のWeb アプリで成功したテストおよび失敗したテストを表示することができます。

このテスト結果の表示は、ジョブを表示する際に以下に示すように **Tests** タブから利用できます。

![store-test-results-view]({{site.baseurl}}/assets/img/docs/test-summary.png)

`.circleci/config.yml` では、[`store_test_results`]({{site.baseurl}}/ja/2.0/configuration-reference/#storetestresults) キーは以下のように使用します。

```yml
steps:
  - run:
  #...
  # run tests and store XML files to a subdirectory, for example, test-results
  #...
  - store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML または Cucumber JSON テストのメタデータファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パス、またはすべてのテスト結果が含まれる一つのファイルのパスです。

**注: **`path`の値が非表示のフォルダーではないことを確認してください。 たとえば、`.my_hidden_directory` は無効な形式です。

## ストレージ使用量の表示
{: #viewing-storage-usage }

ストレージの使用状況の表示、および毎月のストレージの超過料金の計算については、[データの永続化]({{site.baseurl}}/2.0/persist-data/#managing-network-and-storage-use)ガイドを参照してください。

## テストインサイト
{: #test-insights }
インサイト機能を使ったテストに関する情報の収集についての情報は、[テストインサイトに関するガイド]({{site.baseurl}}/2.0/insights-tests/)をご覧ください。

また、テストの失敗に関する情報については、[API v2 のインサイトのエンドポイント](https://circleci.com/docs/api/v2/#circleci-api-insights)をご覧ください。

## Server v2.x 用のテストインサイト
{: #test-insights-for-server-v2x }
**CircleCI Server v2.x をご使用の場合**、テストメタデータを収集するように設定すると、頻繁に失敗するテストが**インサイト**のページのリストに表示されます。それにより、不安定なテストを特定し、繰り返し発生する問題を隔離することができます。

![失敗したテストに関するインサイト]({{site.baseurl}}/assets/img/docs/insights.png)

_上記のスクリーンショットは CircleCI Server v2.x をご使用の場合のみ適用されます。_


## フォーマッタの有効化
{: #enabling-formatters }

JUnit フォーマッタを有効化するまで、テストメタデータは CircleCI  で自動的には収集されません。 RSpec、Minitest、および Django に、以下の設定を追加してフォーマッタを有効化します。

- RSpec では、gemfile に以下を追加する必要があります。

```ruby
gem 'rspec_junit_formatter'
```

- Minitest では、gemfile に以下を追加する必要があります。

```ruby
gem 'minitest-ci'
```

- Django は、[django-nose](https://github.com/django-nose/django-nose) テストランナーを使用して設定する必要があります。

**注:** iOS アプリケーションをテストする方法は、[macOS での iOS アプリケーションのテスト]({{site.baseurl}}/ja/2.0/testing-ios/)をご覧ください。

## カスタムテストランナーの例
{: #custom-test-runner-examples }

このセクションでは、以下のテスト ランナーの例を示します。

| 言語         | テストランナー      | フォーマッタ                                                                                    | 例                                                                                                                             |  |  |
|:---------- |:------------ |:----------------------------------------------------------------------------------------- |:----------------------------------------------------------------------------------------------------------------------------- |  |  |
| JavaScript | Jest         | [jest-junit](https://www.npmjs.com/package/jest-junit)                                    | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#jest)                                                                          |  |  |
| JavaScript | Mocha        | [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)                | [例]({{site.baseurl}}/2.0/collect-test-data/#mocha-for-node)、[NYC での例]({{site.baseurl}}/2.0/collect-test-data/#mocha-with-nyc) |  |  |
| JavaScript | Karma        | [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter)                | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#karma)                                                                         |  |  |
| JavaScript | AVA          | [tap-xunit](https://github.com/aghassemi/tap-xunit)                                       | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#ava-for-node)                                                                  |  |  |
| JavaScript | ESLint       | [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit)                    | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#eslint)                                                                        |  |  |
| Ruby       | RSpec        | [rspec_junit_formatter](https://rubygems.org/gems/rspec_junit_formatter/versions/0.2.3) | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#rspec)                                                                         |  |  |
| Ruby       | Minitest     | [minitest-ci](https://rubygems.org/gems/minitest-ci)                                      | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#minitest)                                                                      |  |  |
|            | Cucumber     | ビルトイン                                                                                     | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#cucumber)                                                                      |  |  |
| Python     | pytest       | ビルトイン                                                                                     | [例]({{site.baseurl}}/2.0/collect-test-data/#pytest)                                                                           |  |  |
| Python     | unittest     | テストの実行には [pytest](https://docs.pytest.org/en/6.2.x/unittest.html) を使用                     | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#unittest)                                                                      |  |  |
| Java       | Maven        | [Maven Surefire プラグイン](https://maven.apache.org/surefire/maven-surefire-plugin/)          | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)                                  |  |  |
| Java       | Gradle       | ビルトイン                                                                                     | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#gradle-junit-test-results)                                                     |  |  |
| PHP        | PHPUnit      | ビルトイン                                                                                     | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#phpunit)                                                                       |  |  |
| .NET       |              | [trx2junit](https://github.com/gfoidl/trx2junit)                                          | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#dot-net)                                                                       |  |  |
| Clojure    | Kaocha       | [kaocha-junit-xml](https://clojars.org/lambdaisland/kaocha-junit-xml)                     | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#kaocha)                                                                        |  |  |
| Clojure    | clojure.test | [test2junit](https://github.com/ruedigergad/test2junit)                                   | [例]({{site.baseurl}}/ja/2.0/collect-test-data/#test2junit-for-clojure-tests)                                                  |  |  |
{: class="table table-striped"}

### JavaScript
{: #javascript }

#### Jest
{: #jest }

Jest で JUnit の互換テストデータを出力するには、[jest-junit](https://www.npmjs.com/package/jest-junit)を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yml
steps:
  - run:
      name: Install JUnit coverage reporter
      command: yarn add --dev jest-junit
  - run:
      name: Run tests with JUnit as reporter
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT_DIR: ./reports/junit/
  - store_test_results:
      path: ./reports/junit/
```

全体の手順については、Viget の記事「[Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint)」を参照してください。 記事の中の jest cli 引数 `--testResultsProcessor` の使用は、 `--reporters`の構文に置き換えられているのでご注意ください。また、JEST_JUNIT_OUTPUT は `JEST_JUNIT_OUTPUT_DIR` および `JEST_JUNIT_OUTPUT_NAME` に置き換えられています（上図参照）。

**注:** Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest は、ジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は、仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

`--runInBand` の詳細については、[Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) ドキュメントを参照してください。 この問題の詳細については、公式 Jest リポジトリの [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) と [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) を参照してください。

### Node.js 用の Mocha
{: #mocha-for-node }

Mocha のテストランナーで JUnit テストを出力するには、[mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter) を使用します。

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
```

### Mocha と nyc の組み合わせ
{: #mocha-with-nyc }

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
            - image: cimg/node:16.10
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
              environment:
                MONGODB_URI: mongodb://admin:password@localhost:27017/db?authSource=admin
            - image: mongo:4.0
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
              environment:
                MONGO_INITDB_ROOT_USERNAME: admin
                MONGO_INITDB_ROOT_PASSWORD: password
        working_directory: ~/repo
        steps:
            - checkout

            # Update npm
            - run:
                name: update-npm
                command: 'sudo npm install -g npm@latest'

            # Download and cache dependencies
            - restore_cache:
                keys:
                    - v1-dependencies-{{ checksum "package-lock.json" }}
                    # fallback to using the latest cache if no exact match is found
                    - v1-dependencies-

            - run: npm install

            - run: npm install mocha-junit-reporter # just for CircleCI

            - save_cache:
                paths:
                    - node_modules
                key: v1-dependencies-{{ checksum "package-lock.json" }}

            - run: mkdir reports

            # Run mocha
            - run:
                name: npm test
                command: ./node_modules/.bin/nyc ./node_modules/.bin/mocha --recursive --timeout=10000 --exit --reporter mocha-junit-reporter --reporter-options mochaFile=reports/mocha/test-results.xml
                when: always

            # Run eslint
            - run:
                name: eslint
                command: |
                    ./node_modules/.bin/eslint ./ --format junit --output-file ./reports/eslint/eslint.xml
                when: always

            # Run coverage report for Code Climate

            - run:
                name: Setup Code Climate test-reporter
                command: |
                    # download test reporter as a static binary
                    curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
                    chmod +x ./cc-test-reporter
                    ./cc-test-reporter before-build
                when: always

            - run:
                name: code-coverage
                command: |
                    mkdir coverage
                    # nyc report requires that nyc has already been run,
                    # which creates the .nyc_output folder containing necessary data
                    ./node_modules/.bin/nyc report --reporter=text-lcov > coverage/lcov.info
                    ./cc-test-reporter after-build -t lcov
                when: always

            # Upload results

            - store_test_results:
                path: reports

            - store_artifacts: # upload test coverage as artifact
                path: ./coverage/lcov.info
                prefix: tests
```
{% endraw %}

#### Karma
{: #karma }

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
```

```javascript
// karma.conf.js

// additional config...
{
  reporters: ['junit'],
  junitReporter: {
    outputDir: process.env.JUNIT_REPORT_PATH,
    outputFile: process.env.JUNIT_REPORT_NAME,
    useBrowserName: false
  },
}
// additional config...
```

### Node.js 用の AVA
{: #ava-for-node }

[AVA](https://github.com/avajs/ava) テスト ランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

```yml
    steps:
      - run:
          command: |
            yarn add ava tap-xunit --dev # or you could use npm
            mkdir -p ~/reports
            ava --tap | tap-xunit > ~/reports/ava.xml
          when: always
      - store_test_results:
          path: ~/reports
```


### ESLint
{: #eslint }

[ESLint](http://eslint.org/) から JUnit 結果を出力するには、[JUnit フォーマッタ](http://eslint.org/docs/user-guide/formatters/#junit)を使用します。

`.circleci/config.yml` の作業テスト セクションは、以下のようになります。

```yml
    steps:
      - run:
          command: |
            mkdir -p ~/reports
            eslint ./src/ --format junit --output-file ~/reports/eslint.xml
          when: always
      - store_test_results:
          path: ~/reports
```

### Ruby
{: #ruby }

##### RSpec
{: #rspec }

カスタム `rspec` ビルドステップを使用するプロジェクトにテストメタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

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

#### Minitest
{: #minitest }

カスタム `minitest` ビルドステップを使用するプロジェクトにテストメタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

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

### Cucumber
{: #cucumber }

カスタム Cucumber ステップの場合は、JUnit フォーマッタを使用してファイルを生成し、それを `cucumber` ディレクトリに書き込む必要があります。  `.circleci/config.yml` ファイルに追加するコードの例は以下のとおりです。

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format junit --out ~/cucumber/junit.xml
          when: always
      - store_test_results:
          path: ~/cucumber
```

`path:` は、ファイルが格納されるディレクトリをプロジェクトのルート ディレクトリからの相対ディレクトリで指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーション内の**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示します。

または、Cucumber の JSON フォーマッタを使用する場合は、出力ファイルに `.cucumber` で終わる名前を付け、それを `/cucumber` ディレクトリに書き出します。 例えば下記のようにします。

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format pretty --format json --out ~/cucumber/tests.cucumber
          when: always
      - store_test_results:
          path: ~/cucumber
```

### Python
{: #python }

#### pytest
{: #pytest }

`pytest` を使用するプロジェクトにテストメタデータを追加するには、JUnit XML を出力するように指定したうえで、テストメタデータを保存します。

```yml
      - run:
          name: run tests
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml

      - store_test_results:
          path: test-results
```

#### unittest
{: #unittest }

unittest は JUnit XML をサポートしていませんが、ほぼすべてのケースで [pytest を使って unittest テストを実行することができます。](https://docs.pytest.org/en/6.2.x/unittest.html)

プロジェクトに pytest を追加すると、以下のようにテスト結果を生成したり、アップロードできるようになります。
```yml
      - run:
          name: run tests
          command: |
            . venv/bin/activate
            mkdir test-results
            pytest --junitxml=test-results/junit.xml tests

      - store_test_results:
          path: test-results
```

### Java
{: #java }

### Java JUnit の結果に使用する Maven Surefire プラグイン
{: #maven-surefire-plugin-for-java-junit-results }

[Maven](http://maven.apache.org/) ベースのプロジェクトをビルドする場合は、[Maven Surefire プラグイン](http://maven.apache.org/surefire/maven-surefire-plugin/)を使用して XML 形式のテスト レポートを生成することがほとんどです。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yml
    steps:
      - run:
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/target/surefire-reports/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
```

### Gradle JUnit のテスト結果
{: #gradle-junit-test-results }

[Gradle](https://gradle.org/) で Java または Groovy ベースのプロジェクトをビルドする場合は、テストレポートが XML 形式で自動的に生成されます。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

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
```

### PHP
{: #php }

#### PHPUnit
{: #phpunit }

PHPUnit テストの場合は、`--log-junit` コマンドラインオプションを使用してファイルを生成し、それを `/phpunit` ディレクトリに書き込む必要があります。 `.circleci/config.yml` は以下のようになります。

```yml
    steps:
      - run:
          command: |
            mkdir -p ~/phpunit
            phpunit --log-junit ~/phpunit/junit.xml tests
          when: always
      - store_test_results:
          path: ~/phpunit
```

### .NET
{: #dot-net }

#### Visual Studio/.NET Core テスト用の trx2junit
{: #trx2junit-for-visual-studio-net-core-tests }
{:.no_toc}
Visual Studio または .NET Core で出力される trx ファイルを XML 形式に変換するには、[trx2junit](https://github.com/gfoidl/trx2junit) を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yml
    steps:
      - checkout
      - run: dotnet build
      - run: dotnet test --no-build --logger "trx"
      - run:
          name: test results
          when: always
          command: |
              dotnet tool install -g trx2junit
              export PATH="$PATH:/root/.dotnet/tools"
              trx2junit tests/**/TestResults/*.trx
      - store_test_results:
          path: tests/TestResults
```

### Clojure
{: #clojure }

#### Kaocha
{: #kaocha }

kaocha をテストランナーとして既にご利用の場合、以下を実行してテスト結果を生成および保存してください。

依存関係に `kaocha-junit-xml` を追加します。

`project.clj` を編集して lambdaisland/kaocha-junit-xml  プラグインを追加する、または deps.edn を使用している場合は同様なプラグインを追加します。
```clojure
(defproject ,,,
  :profiles {,,,
             :dev {:dependencies [,,,
                                  [lambdaisland/kaocha-junit-xml "0.0.76"]]}})
```

kaocha の設定ファイルの `test.edn`  をこのテストレポーターを使用するように編集します。
```edn
#kaocha/v1
{:plugins [:kaocha.plugin/junit-xml]
 :kaocha.plugin.junit-xml/target-file "junit.xml"}
```

`.circleci/config.yml` に store_test_results ステップを追加します。
```yml
version: 2.1
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

#### Clojure テスト用の test2junit
{: #test2junit-for-clojure-tests }

Clojure のテスト出力を XML 形式に変換するには、[test2junit](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプルプロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

## API
{: #api }

ジョブのテストメタデータに API からアクセスするには、[テストメタデータ API ドキュメント](https://circleci.com/docs/api/v2/#operation/getTests)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- [インサイトの利用]({{site.baseurl}}/ja/2.0/insights/)
- [テストインサイト]({{site.baseurl}}/ja/2.0/insights-tests/)

## ビデオ: テストランナーのトラブルシューティング
{: #video-troubleshooting-test-runners }
{:.no_toc}

<iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
