---
layout: classic-docs
title: "CircleCI でのテストの自動化"
description: "テストの自動化、インテグレーション、分析のセットアップに関する概要"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

## はじめに
{: #introduction }

CircleCI を使用すると、お客様のコードを変更やマージの前に自動的にテストできます。 テストツールは、Jest、Mocha、pytest、JUnit、Selenium、XCTest などのフレームワークと連携できます。

お客様がテストを CircleCI パイプラインと連携すると、ソフトウェアをユーザーに高い信頼性で効率的に配信できるだけでなく、すぐにフィードバックが得られるため、問題や失敗したテストをより迅速に解決できます。 テスト出力データは CircleCI で使用でき、失敗したテストのデバッグに役立ちます。 テストデータを CircleCI に保存すると、テストインサイトや並列実行機能を利用でき、パイプラインをさらに最適化できる機会を特定できます。

## 基本事項
{: #basics}

テストスイートをパイプラインで自動的に実行するには、設定キーを `.circleci/config.yml` ファイルに追加します。 通常これらは、**ジョブ**内で実行するための**ステップ**またはステップのコレクションとして定義されます。

パイプラインは、テストのスイートを実行環境内で実行するためのステップを含む定義済みの 1 つのジョブを持つ単一のワークフローで構成されます。

```yaml
jobs:
  build-and-test:
    docker:
      - image: cimg/node:16.10
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run tests
          command: npm test
```

`run` は、シェル内でコマンドを実行する組み込みステップです。 テストやその他のコマンドを実行するための `run` ステップの詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/2.0/configuration-reference)リファレンスをご覧ください。

お客様の要件によっては、複数のジョブをオーケストレーションする複雑なワークフローが必要な場合があります。 たとえば、プロジェクトを構築し、独立した Linux、macOS、Windows の各実行環境内でテストするための複数の同時実行ジョブがある場合があります。 テストジョブは、先行するビルドジョブが成功した場合にのみ、実行したいこともあります。

ワークフロー機能に関する詳細は、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows)に関するドキュメントを参照してください。 [サンプル設定]({{ site.baseurl }}/ja/2.0/sample-config)のページで、その他のワークフローのサンプルを参照することもできます。

## テストを簡略化するための Orb の使用
{: #orbs }

Orb を使用すると、一般的なテスティングツールをご利用の設定と連携できます。 Cypress、LambdaTest、Sauce Labs などの CircleCI パートナーの Orb をお客様の `.circleci/config.yml` ファイルで呼び出せます。 これらの Orb を利用し、組み込みジョブを実行してお客様のパイプライン内に一般的なテストタスクを組み込んだり、お客様のジョブ内に簡潔な使用状況コマンドを組み込んだりすることができます。

Orb はモバイルテスト、ブラウザーテスト、負荷テスト、コードカバレッジに使用できます。 Orb を使い始めるには、[Orb の概要]({{ site.baseurl }}/ja/2.0/orb-intro)ドキュメントを参照してください。 Orb レジストリを表示するには、[CircleCI Developer Hub](https://circleci.com/developer/orbs?query=&category=Testing) にアクセスしてください。

## テストデータの保存
{: #store-test-data }

テストからの成果は、2 種類の方法で CircleCI に保存できます。

  * `store_test_results` ステップを使用する

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_test_results:
          path: test-results
    ```

    このステップによって、テスト結果がアップロードされて保存され、Web アプリ内のジョブの **Tests** タブで、失敗したテストからの出力に直接アクセスできるようになります。

    `store_test_results` の詳細は、[CircleCI の設定]({{ site.baseurl }}/ja/2.0/configuration-reference#storetestresults)リファレンスでご確認いただけます。

  * テスト結果をアーティファクトとして保存する

    テスト結果は、`store_artifacts` ステップを使ってアーティファクトとして保存することもできます。

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_artifacts:
          path: test-results
          destination: junit
    ```

    Results can later be accessed or downloaded as files via the **Artifacts** section of a job in the CircleCI web app, or via the API.

    More details on `store_artifacts` can be found in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference#storeartifacts) reference. You can also read more in the [Storing Build Artifacts]({{ site.baseurl }}/2.0/artifacts) guide.

For more detailed examples of storing test data with different testing frameworks, refer to the [Collecting Test Data]({{ site.baseurl }}/2.0/collect-test-data) document.

## テストインサイト
{: #test-insights }

When test results are stored, test analytics also become available on the **Tests** tab of the **Insights** page in the web app. Metrics for flaky tests, tests with the lowest success rates, and slow tests help you identify opportunities to optimize pipelines as well as further improve your testing strategy.

More information is available in the [Test Insights]({{ site.baseurl }}/2.0/insights-tests) guide.

## 次のステップ
{: #next-steps }

* Further optimize your pipelines with [parallelism and test splitting]({{ site.baseurl }}/2.0/collect-test-data).
* Try our [test splitting tutorial]({{ site.baseurl }}/2.0/test-splitting-tutorial).
* Integrate tests for [macOS]({{ site.baseurl }}/2.0/testing-macos) or [iOS]({{ site.baseurl }}/2.0/testing-ios) apps.
* Read our [Browser Testing]({{ site.baseurl }}/2.0/browser-testing) guide to common methods for running and debugging browser tests in CircleCI.
* To get event-based notifications in Slack about your pipelines (e.g. if a job passes or fails), try our [Slack Orb]({{ site.baseurl }}/2.0/slack-orb-tutorial) tutorial.

