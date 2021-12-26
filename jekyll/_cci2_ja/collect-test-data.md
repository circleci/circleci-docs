---
layout: classic-docs
title: "テスト メタデータの収集"
short-title: "テスト メタデータの収集"
description: "テスト メタデータの収集"
order: 34
version:
  - Cloud
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

```sh
- store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML または Cucumber JSON テスト メタデータ ファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パス、またはすべてのテスト結果が含まれる一つのファイルのパスです。 この `path` の値が非表示のフォルダーではないことを確認してください (たとえば `.my_hidden_directory` は無効な形式です)。

**CircleCI Server をご使用の場合**、テストメタデータを収集するように設定すると、頻繁に失敗するテストが**インサイト**のページのリストに表示されます。それにより、不安定なテストを特定し、繰り返し発生する問題を隔離することができます。

![失敗したテストに関するインサイト]( {{ site.baseurl }}/assets/img/docs/insights.png)

_上記のスクリーンショットは CircleCI Server をご使用の場合のみ適用されます。_

**クラウド版をご使用の場合は**、[API v2 のインサイトのエンドポイント](https://circleci.com/docs/api/v2/#circleci-api-insights)でテストの失敗に関する情報をご覧ください。

## フォーマッタの有効化
{: #enabling-formatters }

JUnit フォーマッタを有効化するまで、テスト メタデータは CircleCI 2.0 で自動的には収集されません。 RSpec、Minitest、および Django に対して、以下の設定を追加してフォーマッタを有効化します。

- RSpec では、gemfile に以下を追加する必要があります。

```
gem 'rspec_junit_formatter'
```

- Minitest では、gemfile に以下を追加する必要があります。

```
gem 'minitest-ci'
```

- Django は、[django-nose](https://github.com/django-nose/django-nose) テストランナーを使用して設定する必要があります。

**注意:** iOS アプリケーションをテストする方法は、[macOS での iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)をご覧ください。

## カスタム テストステップでのメタデータの収集
{: #metadata-collection-in-custom-test-steps }

ほとんどのテストランナーで何らかの形式でサポートされている JUnit XML 出力を生成するカスタム テストステップがある場合は、 XML ファイルを以下のようにサブディレクトリに書き込みます。
```
- store_test_results:
    path: /tmp/test-results
```

### カスタム テストランナーの例
{: #custom-test-runner-examples }
{:.no_toc}

ここでは、以下のテストランナーの例を示します。

* [Cucumber]({{ site.baseurl }}/ja/2.0/collect-test-data/#cucumber)
* [Maven Surefire]({{ site.baseurl }}/ja/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]({{ site.baseurl }}/ja/2.0/collect-test-data/#gradle-junit-results)
* [Mocha]({{ site.baseurl }}/ja/2.0/collect-test-data/#mochajs)
* [AVA]({{ site.baseurl }}/ja/2.0/collect-test-data/#ava)
* [ESLint]({{ site.baseurl }}/ja/2.0/collect-test-data/#eslint)
* [PHPUnit]({{ site.baseurl }}/ja/2.0/collect-test-data/#phpunit)
* [pytest]({{ site.baseurl }}/ja/2.0/collect-test-data/#pytest)
* [RSpec]({{ site.baseurl }}/ja/2.0/collect-test-data/#rspec)
* [test2junit]({{ site.baseurl }}/ja/2.0/collect-test-data/#test2junit-for-clojure-tests)
* [trx2junit]({{ site.baseurl }}/ja/2.0/collect-test-data/#trx2junit-for-visual-studio--net-core-tests)
* [Karma]({{ site.baseurl }}/ja/2.0/collect-test-data/#karma)
* [Jest]({{ site.baseurl }}/ja/2.0/collect-test-data/#jest)


#### Cucumber
{: #cucumber }
{:.no_toc}

カスタム Cucumber ステップの場合は、JUnit フォーマッタを使用してファイルを生成し、それを `cucumber` ディレクトリに書き込む必要があります。  `.circleci/config.yml` ファイルに追加するコードの例は以下のとおりです。

```yaml
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

`path:` には、ファイルが格納されるプロジェクトのルートディレクトリの相対ディレクトリまたはファイルを指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーション内の**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示します。

または、Cucumber の JSON フォーマッタを使用する場合は、出力ファイルに `.cucumber` で終わる名前を付け、それを `/cucumber` ディレクトリに書き出します。 たとえば、以下のようになります。

```yaml
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

#### Java JUnit の結果に使用する Maven Surefire プラグイン
{: #maven-surefire-plugin-for-java-junit-results }
{:.no_toc}

[Maven](http://maven.apache.org/) ベースのプロジェクトをビルドする場合は、[Maven Surefire プラグイン](http://maven.apache.org/surefire/maven-surefire-plugin/)を使用して XML 形式のテスト レポートを生成することがほとんどです。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yaml
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

#### <a name="gradle-junit-results"></a>Gradle JUnit のテスト結果
{: #lessa-namegradle-junit-resultsgreaterlessagreatergradle-junit-test-results }
{:.no_toc}

[Gradle](https://gradle.org/) で Java または Groovy ベースのプロジェクトをビルドする場合は、テスト レポートが XML 形式で自動的に生成されます。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yaml
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

#### <a name="mochajs"></a>Node.js 用の Mocha
{: #lessa-namemochajsgreaterlessagreatermocha-for-nodejs }
{:.no_toc}

Mocha のテストランナーで JUnit テストを出力するには、[mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter) を使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下のようになります。

```yaml
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

以下は、[marcospgp](https://github.com/marcospgp) から提供された、Mocha と nyc の組み合わせに使用できるサンプルの全文です。

{% raw %}
```
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

#### <a name="ava"></a>Node.js 用の AVA
{: #lessa-nameavagreaterlessagreaterava-for-nodejs }
{:.no_toc}

[AVA](https://github.com/avajs/ava) テストランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

```
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

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

```
    steps:
      - run:
          command: |
            mkdir -p ~/reports
            eslint ./src/ --format junit --output-file ~/reports/eslint.xml
          when: always
      - store_test_results:
          path: ~/reports
      - store_artifacts:
          path: ~/reports
```


#### PHPUnit
{: #phpunit }
{:.no_toc}

PHPUnit テストの場合は、`--log-junit` コマンド ライン オプションを使用してファイルを生成し、それを `/phpunit` ディレクトリに書き込む必要があります。 `.circleci/config.yml` は以下のようになります。

```
    steps:
      - run:
          command: |
            mkdir -p ~/phpunit
            phpunit --log-junit ~/phpunit/junit.xml tests
          when: always
      - store_test_results:
          path: ~/phpunit
      - store_artifacts:
          path: ~/phpunit
```

#### pytest
{: #pytest }
{:.no_toc}

`pytest` を使用するプロジェクトにテスト メタデータを追加するには、JUnit XML を出力するように指定したうえで、テスト メタデータを保存します。

```
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


#### RSpec
{: #rspec }
{:.no_toc}

カスタム `rspec` ビルド ステップを使用するプロジェクトにテスト メタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

```
gem 'rspec_junit_formatter'
```

さらに、テスト コマンドを以下のように変更します。

```
    steps:
      - checkout
      - run: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3
      - run: mkdir ~/rspec
      - run:
          command: bundle exec rspec --format progress --format RspecJunitFormatter -o ~/rspec/rspec.xml
          when: always
      - store_test_results:
          path: ~/rspec
```

### Minitest
{: #minitest }
{:.no_toc}

カスタム `minitest` ビルドステップを使用するプロジェクトにテストメタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

```
gem 'minitest-ci'
```

さらに、テスト コマンドを以下のように変更します。

```
    steps:
      - checkout
      - run: bundle check || bundle install
      - run:
          command: bundle exec rake test
          when: always
      - store_test_results:
          path: test/reports
```

詳細については、[minitest-ci README](https://github.com/circleci/minitest-ci#readme)を参照してください。

#### Clojure テスト用の test2junit
{: #test2junit-for-clojure-tests }
{:.no_toc}

Clojure のテスト出力を XML 形式に変換するには、[test2junit](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプル プロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

#### Visual Studio/.NET Core テスト用の trx2junit
{: #trx2junit-for-visual-studio-net-core-tests }
{:.no_toc}
Visual Studio または .NET Core で出力される trx ファイルを XML 形式に変換するには、[trx2junit](https://github.com/gfoidl/trx2junit) を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yaml
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

#### Karma
{: #karma }
{:.no_toc}

Karma テストランナーで JUnit テストを出力するには、 [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter) を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yaml
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

#### Jest
{: #jest }
{:.no_toc}

Jest で JUnit の互換テストデータを出力するには、[jest-junit](https://www.npmjs.com/package/jest-junit)を使用します。

`.circleci/config.yml` の作業セクションは、以下のようになります。

```yaml
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

全体の手順については、Viget の記事、[Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint)を参照してください。 記事の中の jest cli 引数 `--testResultsProcessor` の使用は、 `--reporters`の構文に置き換えられているのでご注意ください。また、JEST_JUNIT_OUTPUT は `JEST_JUNIT_OUTPUT_DIR` および `JEST_JUNIT_OUTPUT_NAME` に置き換えられています（上図参照）。

**注意:** Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest はジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

`--runInBand` の詳細については、[Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) ドキュメントを参照してください。 この問題の詳細については、公式 Jest リポジトリの [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) と [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) を参照してください。

## API
{: #api }

実行時のテスト メタデータに API からアクセスするには、[テスト メタデータ API ドキュメント](https://circleci.com/docs/api/#get-build-test-metadata)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

[インサイトの使用]({{ site.baseurl }}/ja/2.0/insights/)

## ビデオ: テスト ランナーのトラブルシューティング
{: #video-troubleshooting-test-runners }
{:.no_toc} <iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
