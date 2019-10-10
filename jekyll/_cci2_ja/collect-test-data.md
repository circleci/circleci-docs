---
layout: classic-docs
title: "テストメタデータの収集"
short-title: "テストメタデータの収集"
categories: [configuring-jobs]
description: "テストメタデータの収集"
order: 34
---

CircleCI は、XML ファイルからテストメタデータを収集し、それを使用してジョブへのインサイトを提供します。 ここでは、よく使用されるテストランナー用にテストメタデータを XML として出力し、`store_test_results` ステップでレポートを保存するように CircleCI を設定する方法について説明します。

* 目次
{:toc}

テスト結果をアーティファクトとして表示するには、`store_artifacts` ステップを使用してテスト結果をアップロードします。

コンフィグでは、以下のように [`store_test_results`]({{site.baseurl}}/ja/2.0/configuration-reference/#store_test_results) キーが使用されます。

```sh
- store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML または Cucumber JSON テストメタデータファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パスです。 この `path` 値が非表示のフォルダーではないことを確認してください (たとえば `.my_hidden_directory` は無効な形式です)。

テストメタデータを収集するように CircleCI を設定すると、最も頻繁に失敗するテストがアプリケーション内の [Insights (インサイト)](https://circleci.com/build-insights){:rel="nofollow"} の詳細ページにリストされるので、不安定なテストを特定して、繰り返し発生している問題を分離できます。

![失敗するテストに関するインサイト]({{ site.baseurl }}/assets/img/docs/insights.png)

## フォーマッタの有効化

JUnit フォーマッタを有効にするまで、テストメタデータは CircleCI 2.0 で自動的には収集されません。 RSpec、Minitest、および Django に対して、以下の設定を追加してフォーマッタを有効にします。

* RSpec では、gemfile に以下の設定を追加する必要があります。

    gem 'rspec_junit_formatter'


* Minitest では、gemfile に以下の設定を追加する必要があります。

    gem 'minitest-ci'


* Django は、[django-nose](https://github.com/django-nose/django-nose) テストランナーを使用して設定する必要があります。

## カスタムテストステップでのメタデータの収集

大部分のテストランナーで何らかの形式でサポートされているように、JUnit XML 出力を生成するカスタムテストステップがある場合は、XML ファイルをサブディレクトリに書き出します。以下はその例です。

    - store_test_results:
        path: /tmp/test-results


### カスタムテストランナーの例
{:.no_toc}

このセクションでは、以下のテストランナーの例を示します。

* [Cucumber]({{ site.baseurl }}/2.0/collect-test-data/#cucumber)
* [Maven Surefire]({{ site.baseurl }}/2.0/collect-test-data/#maven-surefire-plugin-for-java-junit-results)
* [Gradle]({{ site.baseurl }}/2.0/collect-test-data/#gradle-junit-results)
* [Mocha]({{ site.baseurl }}/2.0/collect-test-data/#mochajs)
* [Ava]({{ site.baseurl }}/2.0/collect-test-data/#ava)
* [ESLint]({{ site.baseurl }}/2.0/collect-test-data/#eslint)
* [PHPUnit]({{ site.baseurl }}/2.0/collect-test-data/#phpunit)
* [pytest]({{ site.baseurl }}/2.0/collect-test-data/#pytest)
* [RSpec]({{ site.baseurl }}/2.0/collect-test-data/#rspec)
* [test2junit]({{ site.baseurl }}/2.0/collect-test-data/#test2junit-for-clojure-tests)
* [Karma]({{ site.baseurl }}/2.0/collect-test-data/#karma)
* [Jest]({{ site.baseurl }}/2.0/collect-test-data/#jest)

#### Cucumber
{:.no_toc}

カスタム Cucumber ステップの場合は、JUnit フォーマッタを使用してファイルを生成し、それを `cucumber` ディレクトリに書き込む必要があります。 `.circleci/config.yml` ファイルに追加するコードの例は以下のとおりです。

```yaml
    steps:
      - run:
          name: テスト結果を保存
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber --format junit --out ~/cucumber/junit.xml
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber
```

`path:` は、ファイルが格納されるディレクトリをプロジェクトのルートディレクトリからの相対ディレクトリで指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーション内の**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示します。

または、Cucumber の JSON フォーマッタを使用する場合は、出力ファイルに `.cucumber` で終わる名前を付け、それを `/cucumber` ディレクトリに書き出します。 たとえば、以下のようになります。

```yaml
    steps:
      - run:
          name: テスト結果を保存
          command: |
            mkdir -p ~/cucumber
            bundle exec cucumber pretty --format json --out ~/cucumber/tests.cucumber
          when: always
      - store_test_results:
          path: ~/cucumber
      - store_artifacts:
          path: ~/cucumber
```

#### Java JUnit の結果に使用する Maven Surefire プラグイン
{:.no_toc}

[Maven](http://maven.apache.org/) ベースのプロジェクトをビルドする場合は、[Maven Surefire プラグイン](http://maven.apache.org/surefire/maven-surefire-plugin/)を使用して XML 形式のテストレポートを生成することがほとんどです。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yaml
    steps:
      - run:
          name: テスト結果を保存
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
{:.no_toc}

[Gradle](https://gradle.org/) で Java または Groovy ベースのプロジェクトをビルドする場合は、テストレポートが XML 形式で自動的に生成されます。 CircleCI では、これらのレポートを簡単に収集できます。 以下のコードをプロジェクトの `.circleci/config.yml` ファイルに追加します。

```yaml
    steps:
      - run:
          name: テスト結果を保存
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
{:.no_toc}

Mocha テストランナーで JUnit テストを出力するには、[mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter) を使用します。

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

以下は、[marcospgp](https://github.com/marcospgp) から提供された、Mocha と nyc の組み合わせに使用できる完全な例です。

{% raw %}
```
version: 2
    jobs:
        build:
            environment:
                CC_TEST_REPORTER_ID: code_climate_id_here
                NODE_ENV: development
            docker:
                - image: circleci/node:8
                  environment:
                    MONGODB_URI: mongodb://admin:password@localhost:27017/db?authSource=admin
                - image: mongo:4.0
                  environment:
                    MONGO_INITDB_ROOT_USERNAME: admin
                    MONGO_INITDB_ROOT_PASSWORD: password
            working_directory: ~/repo
            steps:
                - checkout

                # npm を更新します
                - run:
                    name: update-npm
                    command: 'sudo npm install -g npm@latest'

                # 依存関係をダウンロードしてキャッシュします
                - restore_cache:
                    keys:
                        - v1-dependencies-{{ checksum "package-lock.json" }}
                    # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします
                        - v1-dependencies-

                - run: npm install

                - run: npm install mocha-junit-reporter # CircleCI 専用

                - save_cache:
                    paths:
                        - node_modules
                    key: v1-dependencies-{{ checksum "package-lock.json" }}

            - run: mkdir reports

                # mocha を実行します
                - run:
                    name: npm test
                    command: ./node_modules/.bin/nyc ./node_modules/.bin/mocha --recursive --timeout=10000 --exit --reporter mocha-junit-reporter --reporter-options mochaFile=reports/mocha/test-results.xml
                    when: always

                # eslint を実行します
                - run:
                    name: eslint
                    command: |
                        ./node_modules/.bin/eslint ./ --format junit --output-file ./reports/eslint/eslint.xml
                    when: always

                # Code Climate のカバレッジレポートを実行します

                - run:
                    name: Code Climate テストレポーターをセットアップ
                    command: |
                        # テストレポーターを静的バイナリとしてダウンロードします
                        curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
                        chmod +x ./cc-test-reporter
                        ./cc-test-reporter before-build
                    when: always

                - run:
                    name: code-coverage
                    command: |
                        mkdir coverage
                        # nyc レポートでは、nyc が既に実行されている必要があります
                        # これにより、必要なデータが入った .nyc_output フォルダーが作成されます
                        ./node_modules/.bin/nyc report --reporter=text-lcov > coverage/lcov.info
                        ./cc-test-reporter after-build -t lcov
                    when: always

                # 結果をアップロードします

                - store_test_results:
                    path: reports

                - store_artifacts:
                    path: ./reports/mocha/test-results.xml

                - store_artifacts:
                    path: ./reports/eslint/eslint.xml

                - store_artifacts: # テストカバレッジをアーティファクトとしてアップロードします
                    path: ./coverage/lcov.info
                    prefix: tests
```
{% endraw %}

#### <a name="ava"></a>Node.js 用の Ava
{:.no_toc}

[Ava](https://github.com/avajs/ava) テストランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

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


#### ESLint
{:.no_toc}

[ESLint](http://eslint.org/) から JUnit 結果を出力するには、[JUnit フォーマッタ](http://eslint.org/docs/user-guide/formatters/#junit)を使用します。

`.circleci/config.yml` の作業テストセクションは、以下のようになります。

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


#### PHPUnit
{:.no_toc}

PHPUnit テストの場合は、`--log-junit` コマンドラインオプションを使用してファイルを生成し、それを `/phpunit` ディレクトリに書き込む必要があります。 `.circleci/config.yml` は以下のようになります。

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


#### pytest
{:.no_toc}

`pytest` を使用するプロジェクトにテストメタデータを追加するには、JUnit XML を出力するように指定したうえで、テストメタデータを保存します。

          - run:
              name: run tests
              command: |
                . venv/bin/activate
                mkdir test-reports
                pytest --junitxml=test-reports/junit.xml

          - store_test_results:
              path: test-reports

          - store_artifacts:
              path: test-reports


#### RSpec
{:.no_toc}

カスタム `rspec` ビルドステップを使用するプロジェクトにテストメタデータコレクションを追加するには、Gemfile に以下の gem を追加します。

    gem 'rspec_junit_formatter'


さらに、テストコマンドを以下のように変更します。

        steps:
          - checkout
          - run: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs=4 --retry=3
          - run: mkdir ~/rspec
          - run:
              command: bundle exec rspec --format progress --format RspecJunitFormatter -o ~/rspec/rspec.xml
              when: always
          - store_test_results:
              path: ~/rspec


### Minitest
{:.no_toc}

カスタム `minitest` ビルドステップを使用するプロジェクトにテストメタデータコレクションを追加するには、Gemfile に以下の gem を追加します。

    gem 'minitest-ci'


さらに、テストコマンドを以下のように変更します。

        steps:
          - checkout
          - run: bundle check || bundle install
          - run:
              command: bundle exec rake test
              when: always
          - store_test_results:
              path: test/reports


詳細については、[minitest-ci README](https://github.com/circleci/minitest-ci#readme) を参照してください。

#### Clojure テスト用の test2junit
{:.no_toc}
Clojure のテスト出力を XML 形式に変換するには、[test2junit](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプルプロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

#### Karma
{:.no_toc}

Karma テストランナーで JUnit テストを出力するには、[karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter) を使用します。

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

#### Jest
{:.no_toc}

Jest データを収集するには、まず `jest.config.js` という名前の Jest コンフィグファイルを以下のように作成します。

```javascript
// jest.config.js
{
  reporters: ["default", "jest-junit"],
}
```

`.circleci/config.yml` に、以下の `run` ステップを追加します。

```yaml
steps:
  - run:
      name: JUnit カバレッジレポーターをインストール
      command: yarn add --dev jest-junit
  - run:
      name: JUnit をレポーターとしてテストを実行
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT: "reports/junit/js-test-results.xml"
```

全体の手順については、Viget の記事「[Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint)」を参照してください。

**メモ：**Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest は、ジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は、仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

`--runInBand` の詳細については、[Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) ドキュメントを参照してください。 この問題の詳細については、公式 Jest リポジトリの [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) と [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) を参照してください。

## API

実行時のテストメタデータに API からアクセスするには、[test-metadata API ドキュメント]({{ site.baseurl }}/api/v1-reference/#test-metadata)を参照してください。

## 関連項目
{:.no_toc}

[インサイトの利用]({{ site.baseurl }}/2.0/insights/)

## ビデオ: テストランナーのトラブルシューティング
{:.no_toc}

<iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
