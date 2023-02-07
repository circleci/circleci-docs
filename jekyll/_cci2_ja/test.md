---
layout: classic-docs
title: CircleCI でのテストの自動化
description: テストの自動化、インテグレーション、分析のセットアップに関する概要.
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

## はじめに
{: #introduction }

CircleCI を使用すると、お客様のコードを変更内容がマージされる前に自動的にテストできます。 テストツールは、Jest、Mocha、pytest、JUnit、Selenium、XCTest などのフレームワークと連携できます。

お客様がテストを CircleCI パイプラインと連携すると、ソフトウェアをユーザーに高い信頼性で効率的に配信できるだけでなく、すぐにフィードバックが得られるため、問題や失敗したテストをより迅速に解決できます。 テスト出力データは CircleCI で使用でき、失敗したテストのデバッグに役立ちます。 If you save your test data in CircleCI, you can also take advantage of Test Insights as well as parallelism features to identify opportunities to further optimize your pipelines.

## 基本事項
{: #basics}

テストスイートをプロジェクトパイプラインで自動的に実行するには、設定キーを `.circleci/config.yml` ファイルに追加します。 通常これらは、**ジョブ**内で実行するための**ステップ**またはステップのコレクションとして定義されます。

パイプラインは、テストのスイートを実行環境内で実行するためのステップを含む定義済みの 1 つのジョブを持つ単一のワークフローで構成されます。

```yaml
jobs:
  build-and-test:
    docker:
      - image: cimg/node:16.10
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run tests
          command: npm test
```

`run` は、シェル内でコマンドを実行する組み込みステップです。 To read more about the `run` step for executing tests and other commands, go to the [Configuration reference](/docs/configuration-reference) page.

お客様の要件によっては、複数のジョブをオーケストレーションする複雑なワークフローが必要な場合があります。 例として、プロジェクトを独立した Linux、macOS、Windows の各実行環境内で構築してテストするための複数の同時実行ジョブがある場合が挙げられます。 または、テストジョブは、先行するビルドジョブが成功した後でのみ実行することを要求したい場合があります。

For a more in-depth look at workflows functionality, visit the [Workflows](/docs/workflows) page. You can also refer to the [Sample configuration](/docs/sample-config) page for more workflow examples.

## テストを簡略化するための Orb の使用
{: #orbs }

Orb を使用すると、一般的なテストツールをご利用の設定と連携できます。 Cypress、LambdaTest、Sauce Labs などの CircleCI パートナーの Orb をお客様の `.circleci/config.yml` ファイルで呼び出せます。 このような Orb を利用することで、組み込みジョブを実行してお客様のパイプライン内に一般的なテストタスクを組み込んだり、お客様のジョブ内に簡潔な使用状況コマンドを組み込んだりすることができます。

Orb はモバイルテスト、ブラウザーテスト、負荷テスト、コードカバレッジに使用できます。 To get started with orbs, visit the [Orbs introduction](/docs/orb-intro) page. Orb レジストリを表示するには、[CircleCI Developer Hub](https://circleci.com/developer/ja/orbs?query=&category=Testing) にアクセスしてください。

## テストデータの保存
{: #store-test-data }

テストからの成果は、以下の 2 種類の方法で CircleCI に保存できます。

  * `store_test_results` ステップを使用する:

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_test_results:
          path: test-results
    ```

    このステップによって、テスト結果がアップロードされて保存されます。さらに、Web アプリ内のジョブの **Tests** タブで、失敗したテストからの出力に直接アクセスできるようになります。

    More details on `store_test_results` can be found on the [Configuration reference](/docs/configuration-reference#storetestresults) page.

  * テスト結果をアーティファクトとして保存する:

    テスト結果は、`store_artifacts` ステップを使ってアーティファクトとして保存することもできます。

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_artifacts:
          path: test-results
          destination: junit
    ```

    Results can later be accessed or downloaded as files via the **Artifacts** section of a job in the CircleCI web app, or through the API.

    More details on `store_artifacts` can be found in the [Configuration reference](/docs/configuration-reference#storeartifacts) page. You can also read more in the [Storing build artifacts](/docs/artifacts) guide.

For more detailed examples of storing test data with different testing frameworks, refer to the [Collect test data](/docs/collect-test-data) page.

## テストインサイト
{: #test-insights }

テスト結果が保存されるときに、テスト分析も Web アプリの **Insights** ページの **Tests** タブで利用できるようになります。 結果が不安定なテスト、成功率が低いテスト、遅いテストのメトリクスを使うと、パイプラインを最適化し、テスト戦略をさらに向上できる機会を把握できます。

More information is available on the [Test Insights](/docs/insights-tests) page.

## 次のステップ
{: #next-steps }

* Further optimize your pipelines with [parallelism and test splitting](/docs/parallelism-faster-jobs/).
* Try our [test splitting tutorial](/docs/test-splitting-tutorial).
* Integrate tests for [macOS](/docs/testing-macos) or [iOS](/docs/testing-ios) apps.
* Read our [Browser testing](/docs/browser-testing) guide to common methods for running and debugging browser tests in CircleCI.
* To get event-based notifications in Slack about your pipelines (for example, if a job passes or fails), try our [Slack orb](/docs/slack-orb-tutorial) tutorial.

