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

CircleCI は、XML ファイルからテスト メタデータを収集し、それを使用してジョブに関するインサイトを提供します。 ここでは、よく使用されるテスト ランナー用にテスト メタデータを XML として出力し、`store_test_results` ステップでレポートを保存するように CircleCI を構成する方法について説明します。

* 目次
{:toc}

テスト結果をアーティファクトとして表示するには、`store_artifacts` ステップを使用してテスト結果をアップロードします。

設定ファイルでは、以下のように [`store_test_results`]({{ site.baseurl}}/2.0/configuration-reference/#store_test_results) キーが使用されます。

![&lt;br /&gt;- store_test_results:
    path: /tmp/test-results]( {{ site.baseurl }}/assets/img/docs/test-summary.png)

テスト メタデータを収集するように CircleCI を構成すると、最も頻繁に失敗するテストの一覧がアプリケーション内の [[Insights (インサイト)]](https://circleci.com/build-insights){:rel="nofollow"} の詳細ページに表示されるので、不安定なテストを特定して、繰り返し発生している問題を分離できます。

The usage of the [`store_test_results`]({{ site.baseurl}}/2.0/configuration-reference/#store_test_results) key in your config looks like the following:

```sh
- store_test_results:
    path: test-results
```

ここで、`path` キーは、JUnit XML または Cucumber JSON テスト メタデータ ファイルのサブディレクトリが含まれる `working_directory` への絶対パスまたは相対パスです。 この `path` 値が非表示のフォルダーではないことを確認してください (たとえば `.my_hidden_directory` は無効な形式です)。

大多数のテスト ランナーが何らかの形式でサポートしているように、JUnit XML 出力を生成するカスタムのテスト ステップを使用している場合は、以下のとおり XML ファイルをサブディレクトリに書き出します。

![失敗したテストに関するインサイト]( {{ site.baseurl }}/assets/img/docs/insights.png)

_The above screenshot applies to CircleCI Server only._

**If you are using CircleCI Cloud**, see the [API v2 Insights endpoints](https://circleci.com/docs/api/v2/#circleci-api-insights) to find test failure information.

## フォーマッタの有効化
{: #enabling-formatters }

JUnit フォーマッタを有効化するまで、テスト メタデータは CircleCI 2.0 で自動的には収集されません。 RSpec、Minitest、および Django に対して、以下の構成を追加してフォーマッタを有効化します。

- RSpec では、gemfile に以下を追加する必要があります。

```
gem 'rspec_junit_formatter'
```

- Minitest では、gemfile に以下を追加する必要があります。

```
gem 'minitest-ci'
```

- Django は、[django-nose](https://github.com/django-nose/django-nose) テスト ランナーを使用して構成する必要があります。

**Note:** For detailed information on how to test your iOS applications, refer to the [Testing iOS Applications on macOS]({{ site.baseurl}}/2.0/testing-ios/) page.

## カスタム テスト ステップでのメタデータの収集
{{ site.baseurl }}/ja/2.0/collect-test-data/#rspec

Write the XML files to a subdirectory if you have a custom test step that produces JUnit XML output as is supported by most test runners in some form, for example:
```
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

### カスタム テスト ランナーの例
このセクションでは、以下のテスト ランナーの例を示します。
{:.no_toc}

Mocha テスト ランナーで JUnit テストを出力するには、[JUnit Reporter for Mocha](https://www.npmjs.com/package/mocha-junit-reporter) を使用します。

* [Cucumber]({{ site.baseurl }}/2.0/collect-test-data/#cucumber)
* [Maven Surefire]({{ site.baseurl }}/2.0/collect-test-data/#java-junit-の結果に使用する-maven-surefire-プラグイン)
* [Gradle]({{ site.baseurl }}/2.0/collect-test-data/#gradle-junit-のテスト結果)
* [Mocha]({{ site.baseurl }}/2.0/collect-test-data/#nodejs-用の-mocha)
* [AVA]({{ site.baseurl }}/2.0/collect-test-data/#nodejs-用の-ava)
* [ESLint]({{ site.baseurl }}/2.0/collect-test-data/#eslint)
* [PHPUnit]({{ site.baseurl }}/2.0/collect-test-data/#phpunit)
* [pytest]({{ site.baseurl }}/2.0/collect-test-data/#pytest)
* [RSpec]({{ site.baseurl }}/2.0/collect-test-data/#rspec)
* [test2junit]({{ site.baseurl }}/2.0/collect-test-data/#clojure-テスト用の-test2junit)
* [trx2junit]({{ site.baseurl }}/2.0/collect-test-data/#visual-studionet-core-テスト用の-trx2junit)
* [Karma]({{ site.baseurl }}/2.0/collect-test-data/#karma)
* [Jest]({{ site.baseurl }}/2.0/collect-test-data/#jest)


#### Cucumber
`.circleci/config.yml` のテスト用作業セクションは、以下のようになります。
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

`path:` は、ファイルが格納されるディレクトリをプロジェクトのルート ディレクトリからの相対ディレクトリで指定します。 CircleCI は、アーティファクトを収集して S3 にアップロードし、アプリケーション内の**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示します。

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
[AVA](https://github.com/avajs/ava) テスト ランナーで JUnit テストを出力するには、[tap-xunit](https://github.com/aghassemi/tap-xunit) を指定して TAP レポーターを使用します。
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
`.circleci/config.yml` の作業テスト セクションは、以下のようになります。
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
`pytest` を使用するプロジェクトにテスト メタデータを追加するには、JUnit XML を出力するように指定したうえで、テスト メタデータを保存します。
{:.no_toc}

さらに、テスト コマンドを以下のように変更します。

`.circleci/config.yml` のテスト用作業セクションは、以下の例のようになります。

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
カスタム `minitest` ビルド ステップを使用するプロジェクトにテスト メタデータ コレクションを追加するには、Gemfile に以下の gem を追加します。

さらに、テスト コマンドを以下のように変更します。

{% raw %}
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
{% endraw %}

#### <a name="ava"></a>Node.js 用の AVA
{: #lessa-nameavagreaterlessagreaterava-for-nodejs }
{:.no_toc}

`.circleci/config.yml` の作業セクションは、以下のようになります。

`.circleci/config.yml` の作業セクションは、以下のようになります。

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


#### ESLint
Karma テスト ランナーで JUnit テストを出力するには、[karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter) を使用します。
{:.no_toc}

Jest データを収集するには、まず `jest.config.js` という名前の Jest 設定ファイルを以下のように作成します。

`.circleci/config.yml` に、以下の `run` ステップを追加します。

```
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


#### PHPUnit
全体の手順については、Viget の記事「[Using JUnit on CircleCI 2.0 with Jest and ESLint (Jest および ESLint と共に CircleCI 2.0 で JUnit を使用する)](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint)」を参照してください。
{:.no_toc}

PHPUnit テストの場合は、`--log-junit` コマンド ライン オプションを使用してファイルを生成し、それを `/phpunit` ディレクトリに書き込む必要があります。 `.circleci/config.yml` は以下のようになります。

```
    {{ site.baseurl }}/ja/2.0/collect-test-data/#phpunit
```

#### pytest
{{ site.baseurl }}/ja/2.0/collect-test-data/#pytest
{:.no_toc}

To add test metadata to a project that uses `pytest` you need to tell it to output JUnit XML, and then save the test metadata:

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

And modify your test command to this:

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

### Minitest
詳細については、[minitest-ci README](https://github.com/circleci/minitest-ci#readme) を参照してください。
{:.no_toc}

To add test metadata collection to a project that uses a custom `minitest` build step, add the following gem to your Gemfile:

```
gem 'minitest-ci'
```

And modify your test command to this:

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

See the [minitest-ci README](https://github.com/circleci/minitest-ci#readme) for more info.

#### Clojure テスト用の test2junit
{{ site.baseurl }}/ja/2.0/collect-test-data/#clojure-テスト用の-test2junit
{:.no_toc}

Clojure のテスト出力を XML 形式に変換するには、[test2junit](https://github.com/ruedigergad/test2junit) を使用します。 詳細については、[サンプル プロジェクト](https://github.com/kimh/circleci-build-recipies/tree/clojure-test-metadata-with-test2junit)を参照してください。

#### Visual Studio/.NET Core テスト用の trx2junit
{{ site.baseurl }}/ja/2.0/collect-test-data/#visual-studionet-core-テスト用の-trx2junit
{:.no_toc}
Visual Studio または .NET Core で出力される trx ファイルを XML 形式に変換するには、[trx2junit](https://github.com/gfoidl/trx2junit) を使用します。

A working `.circleci/config.yml` section might look like this:

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

To output JUnit tests with the Karma test runner you can use [karma-junit-reporter](https://www.npmjs.com/package/karma-junit-reporter).

A working `.circleci/config.yml` section might look like this:

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

// 追加の構成...
{
  reporters: ['junit'],
  junitReporter: {
    outputDir: process.env.JUNIT_REPORT_PATH,
    outputFile: process.env.JUNIT_REPORT_NAME,
    useBrowserName: false
  },
}
// 追加の構成...
```

#### Jest
{: #jest }
{:.no_toc}

{{ site.baseurl }}/ja/2.0/collect-test-data/#java-junit-の結果に使用する-maven-surefire-プラグイン

A working `.circleci/config.yml` section might look like this:

```yaml
steps:
  - run:
      name: JUnit カバレッジ レポーターのインストール
      command: yarn add --dev jest-junit
  - run:
      name: JUnit をレポーターとして使用したテストの実行
      command: jest --ci --runInBand --reporters=default --reporters=jest-junit
      environment:
        JEST_JUNIT_OUTPUT_DIR: "reports/junit/js-test-results.xml"
```

For a full walkthrough, refer to this article by Viget: [Using JUnit on CircleCI 2.0 with Jest and ESLint](https://www.viget.com/articles/using-junit-on-circleci-2-0-with-jest-and-eslint). Note that usage of the jest cli argument `--testResultsProcessor` in the article has been superseded by the `--reporters` syntax, and JEST_JUNIT_OUTPUT has been replaced with `JEST_JUNIT_OUTPUT_DIR` and `JEST_JUNIT_OUTPUT_NAME`, as demonstrated above.

**メモ:** Jest テストの実行時には、`--runInBand` フラグを使用してください。 このフラグがない場合、Jest はジョブを実行している仮想マシン全体に CPU リソースを割り当てようとします。 `--runInBand` を使用すると、Jest は仮想マシン内の仮想化されたビルド環境のみを使用するようになります。

`--runInBand` の詳細については、[Jest CLI](https://facebook.github.io/jest/docs/en/cli.html#runinband) ドキュメントを参照してください。 この問題の詳細については、公式 Jest リポジトリの [Issue 1524](https://github.com/facebook/jest/issues/1524#issuecomment-262366820) と [Issue 5239](https://github.com/facebook/jest/issues/5239#issuecomment-355867359) を参照してください。

## API
{: #api }

実行時のテスト メタデータに API からアクセスするには、[テスト メタデータ API ドキュメント](https://circleci.com/docs/api/#get-build-test-metadata)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

[インサイトの使用]({{ site.baseurl }}/2.0/insights/)

## ビデオ: テスト ランナーのトラブルシューティング
{: #video-troubleshooting-test-runners }
{:.no_toc}
{:.no_toc} <iframe width="360" height="270" src="https://www.youtube.com/embed/CKDVkqIMpHM" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>
