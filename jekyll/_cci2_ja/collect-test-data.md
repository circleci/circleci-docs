---
layout: classic-docs
title: "テストデータの収集"
description: "CircleCI プロジェクトでのテストデータ収集に関するガイド"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
sectionTags:
  javascript:
    - "#jest"
    - "#mocha-for-node"
    - "#mocha-with-nyc"
    - "#karma"
    - "#ava-for-node"
    - "#eslint"
  ruby:
    - "#rspec"
    - "#minitest"
  python:
    - "#pytest"
    - "#unittest"
  java:
    - "#maven-surefire-plugin-for-java-junit-results"
    - "#gradle-junit-test-results"
  php:
    - "#phpunit"
  dot-net:
    - "#trx2junit-for-visual-studio-net-core-tests"
  clojure:
    - "#kaocha"
    - "#test2junit-for-clojure-tests"
---

CircleCI でテストを実行する際に、テスト結果を保存する方法は 2 つあります。 [アーティファクト]({{site.baseurl}}/ja/artifacts)を使用する方法と [`store_test_results` ステップ]({{site.baseurl}}/ja/configuration-reference/#storetestresults)を使用する方法です。 それぞれの方法にメリットがあるので、プロジェクトごとに選ぶ必要があります。

`store_test_results` ステップを使ってデータを保存する場合、CircleCI は XML ファイルからデータを収集し、そのデータを使ってジョブのインサイトを提供します。 このページでは、一般的なテストランナー用にテストデータを XML として出力し、`store_test_results` ステップでレポートを保存するように CircleCI を設定する方法について説明します。

**`store_test_results` ステップ** を使うと以下が可能です。

* CircleCI Web アプリの **テスト**
* テストインサイトと結果が不安定なテストの検出
* テストの分割

または、テスト結果を**アーティファクト**として保存すると、生の XML を見ることができます。 これは、たとえば誤ってアップロードされたファイルを見つける場合など、プロジェクトのテスト結果処理の設定に関する問題をデバッグする際に便利です。

テスト結果をビルドアーティファクトとして表示するには、[`store_artifacts`]({{site.baseurl}}/ja/configuration-reference/#storeartifacts) ステップを使ってテスト結果をアップロードします。 アーティファクトはストレージを使うので、アーティファクトを保存すると料金が発生します。 アーティファクトなどのオブジェクトをストレージに保存する期間をカスタマイズする方法については、[データの永続化のページ]({{site.baseurl}}/ja/persist-data/#custom-storage-usage)を参照してください。

`store_test_results` と `store_artifacts` の両方を使ってテスト結果をアップロードすることも可能です。
{: class="alert alert-note"}

* 目次
{:toc}

## 概要
{: #overview }

[`store_test_results `ステップ]({{site.baseurl}}/ja/configuration-reference/#storetestresults)を使用すると、テスト結果をアップロードして保存することができ、また CircleCI のWeb アプリで成功したテストや失敗したテストを表示することができます。

このテスト結果には、ジョブを表示する際に **Tests** タブからアクセスできます。以下の例をご覧ください。

![store-test-results-view]({{site.baseurl}}/assets/img/docs/test-summary.png)

`.circleci/config.yml` では、[`store_test_results`]({{site.baseurl}}/ja/configuration-reference/#storetestresults) キーは以下のように使用します。

```yml
steps:
  - run:
  #...
  # run tests and store XML files to a subdirectory, for example, test-results
  #...
  - store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML テストのメタデータファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パス、またはすべてのテスト結果が含まれる一つのファイルのパスです。

`path` の値が隠しフォルダではないことを確認してください。 たとえば、`.my_hidden_directory` は無効な形式です。
{: class="alert alert-warning"}

## ストレージ使用量の表示
{: #viewing-storage-usage }

ストレージの使用状況の表示、および毎月のストレージの超過料金の計算については、[データの永続化]({{site.baseurl}}/ja/persist-data/#managing-network-and-storage-usage)ガイドを参照してください。

## テストインサイト
{: #test-insights }
インサイト機能を使ったテストに関する情報は、[テストインサイトのガイド]({{site.baseurl}}/ja/insights-tests/)をご確認下さい。 このページでは、結果の不安定なテストの検知、失敗の多いテスト、実行速度の遅いテスト、およびパフォーマンスの概要について説明しています。

また、テストの失敗についての情報は、[API v2 のインサイトのエンドポイント](https://circleci.com/docs/api/v2/index.html#tag/Insights)をご覧ください。

## Server v2.x のテストインサイト
{: #test-insights-for-server-v2x }
**CircleCI Server v2.x をご使用の場合**、テストメタデータを収集するように設定すると、頻繁に失敗するテストが **Insights** ページのリストに表示されます。それにより、不安定なテストを特定し、繰り返し発生する問題を隔離することができます。

![失敗したテストに関するインサイト]({{site.baseurl}}/assets/img/docs/insights.png)

上記のスクリーンショットは、CircleCI Server v2.x をご使用の場合のみ適用されます。
{: class="alert alert-info"}


## フォーマッタの有効化
{: #enabling-formatters }

JUnit フォーマッタを有効化するまで、テストメタデータは CircleCI  で自動的に収集されません。 RSpec、Minitest、および Django に、以下の設定を追加してフォーマッタを有効化します。

- RSpec では、gemfile に以下を追加する必要があります。

```ruby
gem 'rspec_junit_formatter'
```

- Minitest では、gemfile に以下を追加する必要があります。

```ruby
gem 'minitest-ci'
```

- Django は、[django-nose](https://github.com/django-nose/django-nose) テストランナーを使用して設定する必要があります。

**注:** iOS アプリケーションをテストする方法は、[macOS での iOS アプリケーションのテスト]({{site.baseurl}}/ja/testing-ios/)をご覧ください。

## 各言語のテストランナーの例
{: #test-runner-examples-by-language }

ここでは、以下のテストランナーの例を示します。

| 言語         | テストランナー      | フォーマッタ                                                                                        | 例                                                                                                                           |
| ---------- | ------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| JavaScript | Jest         | [jest-junit](https://www.npmjs.com/package/jest-junit)                                        | [例]({{site.baseurl}}/ja/collect-test-data/#jest)                                                                            |
| JavaScript | Mocha        | [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)                    | [例]({{site.baseurl}}/ja/collect-test-data/#mocha-for-node)、[NYC での例]({{site.baseurl}}/ja/collect-test-data/#mocha-with-nyc) |
| JavaScript | Karma        | [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter)                    | [例]({{site.baseurl}}/ja/collect-test-data/#karma)                                                                           |
| JavaScript | AVA          | [tap-xunit](https://github.com/aghassemi/tap-xunit)                                           | [例]({{site.baseurl}}/ja/collect-test-data/#ava-for-node)                                                                    |
| JavaScript | ESLint       | [JUnit formatter](http://eslint.org/docs/user-guide/formatters/#junit)                        | [例]({{site.baseurl}}/ja/collect-test-data/#eslint)                                                                          |
| Ruby       | RSpec        | [rspec_junit_formatter](https://rubygems.org/gems/rspec_junit_formatter/versions/0.2.3)     | [例]({{site.baseurl}}/ja/collect-test-data/#rspec)                                                                           |
| Ruby       | Minitest     | [minitest-ci](https://rubygems.org/gems/minitest-ci)                                          | [例]({{site.baseurl}}/ja/collect-test-data/#minitest)                                                                        |
| ---        | Cucumber     | ビルトイン                                                                                         | [例]({{site.baseurl}}/ja/collect-test-data/#cucumber)                                                                        |
| Python     | pytest       | ビルトイン                                                                                         | [例]({{site.baseurl}}/ja/collect-test-data/#pytest)                                                                          |
| Python     | unittest     | テストの実行には [pytest](https://docs.pytest.org/en/6.2.x/unittest.html) を使用                         | [例]({{site.baseurl}}/collect-test-data/#unittest)                                                                           |
| Java       | Neocortix    | [Maven Surefire プラグイン](https://maven.apache.org/surefire/maven-surefire-plugin/)              | [例]({{site.baseurl}}/ja/collect-test-data/#maven-surefire-plugin-for-java-junit-results)                                    |
| Java       | Happo        | ビルトイン                                                                                         | [例]({{site.baseurl}}/ja/collect-test-data/#gradle-junit-test-results)                                                       |
| PHP        | PHPUnit      | ビルトイン                                                                                         | [例]({{site.baseurl}}/ja/collect-test-data/#phpunit)                                                                         |
| .NET       | ---          | [trx2junit](https://github.com/gfoidl/trx2junit)                                              | [例]({{site.baseurl}}/ja/collect-test-data/#dot-net)                                                                         |
| Clojure    | Kaocha       | [kaocha-junit-xml](https://clojars.org/lambdaisland/kaocha-junit-xml)                         | [例]({{site.baseurl}}/ja/collect-test-data/#kaocha)                                                                          |
| Clojure    | clojure.test | [test2junit](https://github.com/ruedigergad/test2junit)                                       | [例]({{site.baseurl}}/ja/collect-test-data/#test2junit-for-clojure-tests)                                                    |
| C, C++     | CTest        | [ctest](https://cmake.org/cmake/help/latest/manual/ctest.1.html#cmdoption-ctest-output-junit) | [例]({{site.baseurl}}/collect-test-data/#ctest-for-c-cxx-tests)                                                              |
{: class="table table-striped"}

### Jest
{: #jest }

Jest で JUnit の互換テストデータを出力するには、[jest-junit](https://www.npmjs.com/package/jest-junit) を使用します。

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
        JEST_JUNIT_OUTPUT_DIR: ./reports/
  - store_test_results:
      path: ./reports/
```

全手順については、Viget の記事 [Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint) を参照してください。 この記事では、使用されている jest cli 引数 `--testResultsProcessor` は `--reporters` 構文に置き換えられており、JEST_JUNIT_OUTPUT は、`JEST_JUNIT_OUTPUT_DIR` や `JEST_JUNIT_OUTPUT_NAME` に置き換えられているのでご注意ください (上図参照）。

**注:** Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest はジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

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

### Karma
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

[AVA](https://github.com/avajs/ava) テストランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。

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

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

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

### RSpec
{: #rspec }

カスタム `rspec` ビルドステップを使用するプロジェクトにテストメタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

```ruby
gem 'rspec_junit_formatter'
```

さらに、テストコマンドを以下のように変更します。

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

### Minitest
{: #minitest }

カスタム `minitest` ビルドステップを使用するプロジェクトにテストメタデータコレクションを追加するには、Gemfile に以下の gem を追加します。

```ruby
gem 'minitest-ci'
```

さらに、テストコマンドを以下のように変更します。

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

カスタム Cucumber ステップの場合は、JUnit フォーマッタを使用してファイルを生成し、それを `cucumber` ディレクトリに書き込む必要があります。  `.circleci/config.yml` ファイルに追加するコード例は以下のとおりです。

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

`path:` は、ファイルが格納されるディレクトリをプロジェクトのルートディレクトリからの相対ディレクトリで指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーションの **Job ページ**の Artifacts タブに表示します。

### pytest
{: #pytest }

`pytest` を使用するプロジェクトにテストメタデータを追加するには、JUnit XML を出力するように指定した上で、テストメタデータを保存します。

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

### unittest
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

### Java JUnit の結果に使用する Maven Surefire プラグイン
{: #maven-surefire-plugin-for-java-junit-results }

[Maven](http://maven.apache.org/) ベースのプロジェクトをビルドする場合は、[Maven Surefire プラグイン](http://maven.apache.org/surefire/maven-surefire-plugin/)を使用して XML 形式のテストレポートを生成することがほとんどです。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

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
          name: Save test results
          command: |
            mkdir -p ~/test-results/junit/
            find . -type f -regex ".*/build/test-results/.*xml" -exec cp {} ~/test-results/junit/ \;
          when: always
      - store_test_results:
          path: ~/test-results
```

### PHPUnit
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

### Visual Studio/.NET Core テスト用の trx2junit
{: #trx2junit-for-visual-studio-net-core-tests }

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

### Kaocha
{: #kaocha }

kaocha をテストランナーとして既にご利用の場合、以下を実行してテスト結果を生成および保存してください。

依存関係に `kaocha-junit-xml` を追加します。

`project.clj` を編集して lambdaisland/kaocha-junit-xml プラグインを追加する、または deps.edn を使用している場合は同様なプラグインを追加します。
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: bin/kaocha
      - store_test_results:
          path: junit.xml
```

### Clojure テスト用の test2junit
{: #test2junit-for-clojure-tests }

Clojure のテスト出力を XML 形式に変換するには、\[test2junit\](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプルプロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

### C/C++ テスト用の CTest
{: #ctest-for-c-cxx-tests }

CTest ではテスト結果を XML 形式で追加保存する [`--output-jun`](https://cmake.org/cmake/help/latest/manual/ctest.1.html#cmdoption-ctest-output-junit)フラグを提供しています。 この機能を使用するには、CMake >=3.21にする必要があります。 XML ファイルは、ビルドディレクトリに基づいて保存されます。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

```yml
    steps:
      - checkout
      - run: mkdir build
      - run: cmake -S . -B build
      - run: ctest --test-dir build --output-junit out.xml
      - store_test_results:
          path: build/out.xml
```

### Bash での Bats
{: #bats-for-bash }

[Bats](https://bats-core.readthedocs.io/) により `--report-formatter junit` オプションが提供され、`--output` で指定した場所で JUnit フォーマットのレポートを作成できます。 その後の `store_test_results` も同じ場所に渡すことができます。

[circleci/bats](https://circleci.com/developer/orbs/orb/circleci/bats) Orb の [run ジョブ](https://circleci.com/developer/orbs/orb/circleci/bats?version=1.1.0#jobs-run) がこの機能を処理します。

たとえば、`src/tests` フォルダー内のすべての `*.bats` テストを実行する `.circleci/config.yml` セクションは以下のようになります。

```yml
orbs:
  bats: circleci/bats@1.1.0
workflows:
  test:
    jobs:
      - bats/run:
          path: ./src/tests
```

## API
{: #api }

ジョブのテストメタデータに API からアクセスするには、[テストメタデータ API に関するドキュメント](https://circleci.com/docs/api/v2/#operation/getTests)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- [インサイトの利用]({{site.baseurl}}/ja/insights/)
- [テストインサイト]({{site.baseurl}}/ja/insights-tests/)

## ビデオ: テストランナーのトラブルシューティング
{: #video-troubleshooting-test-runners }
{:.no_toc}

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
