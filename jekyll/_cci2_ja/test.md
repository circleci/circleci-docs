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

テストスイートをパイプラインで自動的に実行するには、設定キーを `.circleci/config.yml` ファイルに追加します。 These would typically be defined as a **step** or collection of steps to be executed in a **job**.

A pipeline might consist of a single workflow, with a single job defined that includes a step to execute a suite of tests within an execution environment.

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

`run` is a built-in step that runs commands in a shell. To read more about the `run` step for executing tests and other commands, go to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference) reference.

Depending on your requirements, you might have more complex workflows that orchestrate multiple jobs. For example, you might have several concurrent jobs for building and testing your project in separate Linux, macOS, and Windows execution environments. You might also want to require that a test job is run only if a preceding build job is successful.

For a more in-depth look at workflows functionality, read the [Workflows]({{ site.baseurl }}/2.0/workflows) document. You can also refer to the [Sample Configuration]({{ site.baseurl }}/2.0/sample-config) page for more workflow examples.

## Use orbs to simplify testing
{: #orbs }

Orbs provide a way to integrate popular testing tools into your configuration. You can invoke CircleCI partner orbs such as Cypress, LambdaTest, and Sauce Labs in your `.circleci/config.yml` file. These orbs will allow you to include common testing tasks in your pipelines by running built-in jobs or concise usage commands in your jobs.

Orbs are available for mobile testing, browser testing, load testing, and code coverage. To get started with orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro) document. To view the orb registry, visit the [CircleCI Developer Hub](https://circleci.com/developer/orbs?query=&category=Testing).

## Store test data
{: #store-test-data }

Results from testing can be saved in CircleCI in two different ways.

  * Use the `store_test_results` step

    ```yaml
    steps:
      ... # Steps to build and test your application
      - store_test_results:
          path: test-results
    ```

    This step uploads and stores test results, and also enables direct access to output from failed tests on the **Tests** tab of a job in the web app.

    More details on `store_test_results` can be found in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference#storetestresults) reference.

  * Store test results as artifacts

    Test results can also be stored as artifacts using the `store_artifacts` step.

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

