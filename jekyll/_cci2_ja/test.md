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

CircleCI を使用すると、お客様のコードを変更内容がマージされる前に自動的にテストできます。 テストツールは、Jest、Mocha、pytest、JUnit、Selenium、XCTest などのフレームワークと連携できます。

お客様がテストを CircleCI パイプラインと連携すると、ソフトウェアをユーザーに高い信頼性で効率的に配信できるだけでなく、すぐにフィードバックが得られるため、問題や失敗したテストをより迅速に解決できます。 テスト出力データは CircleCI で使用でき、失敗したテストのデバッグに役立ちます。 テストデータを CircleCI に保存すると、テストインサイトや並列実行機能を利用でき、パイプラインをさらに最適化できる機会を把握できます。

## 基本事項
{: #basics}

テストスイートをプロジェクトパイプラインで自動的に実行するには、設定キーを `.circleci/config.yml` ファイルに追加します。 通常これらは、**ジョブ**内で実行するための**ステップ**またはステップのコレクションとして定義されます。

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

`run` は、シェル内でコマンドを実行する組み込みステップです。 テストやその他のコマンドを実行するための `run` ステップの詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference)リファレンスをご覧ください。

お客様の要件によっては、複数のジョブをオーケストレーションする複雑なワークフローが必要な場合があります。 例として、プロジェクトを独立した Linux、macOS、Windows の各実行環境内で構築してテストするための複数の同時実行ジョブがある場合が挙げられます。 または、テストジョブは、先行するビルドジョブが成功した後でのみ実行することを要求したい場合があります。

ワークフロー機能に関する詳細は、[ワークフロー]({{ site.baseurl }}/ja/workflows)に関するドキュメントを参照してください。 [サンプル設定]({{ site.baseurl }}/ja/sample-config)のページで、その他のワークフローのサンプルを参照することもできます。

## テストを簡略化するための Orb の使用
{: #orbs }

Orb を使用すると、一般的なテストツールをご利用の設定と連携できます。 Cypress、LambdaTest、Sauce Labs などの CircleCI パートナーの Orb をお客様の `.circleci/config.yml` ファイルで呼び出せます。 このような Orb を利用することで、組み込みジョブを実行してお客様のパイプライン内に一般的なテストタスクを組み込んだり、お客様のジョブ内に簡潔な使用状況コマンドを組み込んだりすることができます。

Orb はモバイルテスト、ブラウザーテスト、負荷テスト、コードカバレッジに使用できます。 Orb を初めてお使いの場合、[Orb の概要]({{ site.baseurl }}/ja/orb-intro)ドキュメントを参照してください。 Orb レジストリを表示するには、[CircleCI Developer Hub](https://circleci.com/developer/ja/orbs?query=&category=Testing) にアクセスしてください。

## テストデータの保存
{: #store-test-data }

テストからの成果は、以下の 2 種類の方法で CircleCI に保存できます。

  * `store_test_results` ステップを使用する

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_test_results:
          path: test-results
    ```

    このステップによって、テスト結果がアップロードされて保存されます。さらに、Web アプリ内のジョブの **Tests** タブで、失敗したテストからの出力に直接アクセスできるようになります。

    `store_test_results` の詳細は、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference#storetestresults)リファレンスでご確認いただけます。

  * テスト結果をアーティファクトとして保存する

    テスト結果は、`store_artifacts` ステップを使ってアーティファクトとして保存することもできます。

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_artifacts:
          path: test-results
          destination: junit
    ```

    成果は後でファイルとしてアクセスまたはダウンロードできます。これには、CircleCI Web アプリのジョブの **Artifacts** セクションを使用するか、API を使用します。

    `store_artifacts` の詳細は、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference#storeartifacts)リファレンスでご確認いただけます。 詳細は、[ビルドアーティファクトの保存]({{ site.baseurl }}/ja/artifacts)ガイドでもご確認いただけます。

異なるテストフレームワークを使用したテストデータの保存の詳細なサンプルは、[テストデータの収集]({{ site.baseurl }}/ja/collect-test-data)ドキュメントをご覧ください。

## テストインサイト
{: #test-insights }

テスト結果が保存されるときに、テスト分析も Web アプリの **Insights** ページの **Tests** タブで利用できるようになります。 結果が不安定なテスト、成功率が低いテスト、遅いテストのメトリクスを使うと、パイプラインを最適化し、テスト戦略をさらに向上できる機会を把握できます。

詳しくは、[テストインサイト]({{ site.baseurl }}/ja/insights-tests)ガイドをご覧ください。

## 次のステップ
{: #next-steps }

* [並列実行とテストの分割]({{ site.baseurl }}/ja/collect-test-data)によってご利用のパイプパインをさらに最適化します。
* [テスト分割チュートリアル]({{ site.baseurl }}/ja/test-splitting-tutorial)をお試しください。
* [macOS]({{ site.baseurl }}/ja/testing-macos) アプリまたは [iOS]({{ site.baseurl }}/ja/testing-ios) アプリのテストを連携します。
* CircleCI でブラウザーテストを実行し、デバッグするための一般的な方法について、[ブラウザーテスト]({{ site.baseurl }}/ja/browser-testing)ガイドをお読みください。
* パイプラインに関するイベントベースの通知 (ジョブがパスまたは失敗した場合など) を Slack で受け取るには、[Slack Orb]({{ site.baseurl }}/ja/slack-orb-tutorial) チュートリアルをご確認ください。

