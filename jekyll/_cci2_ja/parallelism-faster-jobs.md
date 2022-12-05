---
layout: classic-docs
title: "テスト分割と並列実行"
description: "CircleCI パイプラインを最適化するために、並列のコンピューティング環境でテストを分割し実行するためのガイドです。"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

並列実行とテスト分割機能を使用すると以下を実現できます。

* CI/CD パイプラインのテストにかかる時間の削減
* Specify a number of [executors]({{site.baseurl}}/executor-intro/) across which to split your tests.
* CircleCI CLI が提供するオプション (名前やサイズに基づいて、またはタイミングデータを使って) によるテストスイートの分割

## はじめに
{: #introduction }

パイプラインは、多くの場合コードがコミットされるたびに一連のテストが実行されるように設定されます。 プロジェクトに含まれるテストの数が多いほど、 1 つのコンピューティングリソースで完了するのに時間がかかるようになります。 この時間を短縮するために、複数の並列の実行環境でテストを分割し、実行することができます。 テスト分割は、CI/CD パイプラインのテスト部分を高速化できる優れた方法です。

テスト分割を使用すると、1 つのテストスイートにおいて分割する場所を以下の方法でインテリジェントに定義できます。

* By **name**
* By **size**
* Using **timing** data

It is also possible to use the CLI to [manually allocate tests](#manual-allocation) across parallel environments. Another alternative is to use [environment variables](#using-environment-variables-to-split-tests) instead of the CLI to configure split tests.

## ジョブの並列実行レベルの指定
{: #specify-a-jobs-parallelism-level }

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/jobs-steps/)レベルで定義します。 `parallelism` キーにより、ジョブを実行するためにセットアップする独立した Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 2 以上の値を設定します。 In the example below, `parallelism` is set to `4`, meaning four identical execution environments will be set up for the job.

```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/base:2022.11
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![並列実行]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

With no further changes, the full `test` job is still run in each of the four execution environment. In order to automatically run _different_ tests in each environment and reduce the overall time taken to run the tests, you also need to use the `circleci tests` CLI commands in your configuration.

### セルフホストランナーでの並列実行機能の使用
{: #use-parallelism-with-self-hosted-runners }

[セルフホストランナー]({{site.baseurl}}/ja/runner-overview/)を使ったジョブでこの並列実行機能を使用するには、ジョブを実行するランナーリソースクラスに、少なくとも 2 つのセルフホストランナーが関連付けられていることを確認してください。 If you set the parallelism value to be greater than the number of active self-hosted runners in a given resource class, the excess parallel tasks that do not have a self-hosted runner on which to execute will queue until a self-hosted runner is available.

詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference/#parallelism) を参照してください。

## テスト分割のしくみ
{: #how-test-splitting-works }

例えば **タイミングベース** のテスト分割機能を使うと、 _以前の_ テスト実行のタイミングデータを使って、並行で実行される指定した数のテスト環境でテストスイートをできるだけ均等に分割できます。 これにより、使用中のコンピューティング能力のテスト時間が可能な限り短くなります。

![テスト分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

Timings-based test splitting gives the most accurate split, and is guaranteed to optimize with each test suite run. 分割する場所の決定には、必ず最新のタイミンングデータが使用されます。

As an example, take a Go test suite. Here, all tests run sequentially in a single test environment, a Docker container:

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

以下の方法により、これらのテストをタイミングデータを使って分割できます。

1. 並列実行により、多数の同一テスト環境 (下記例では 4 個) をスピンアップする
2. `--split-by=timings` フラグを指定して `circleci tests split` コマンドを使用し、テストをすべての実行環境で均等に分割する

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
    parallelism: 4
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

For a more detailed walkthrough, read the [guide to using the CLI to split tests](/docs/use-the-circleci-cli-to-split-tests), or follow our [Test Splitting tutorial](/docs/test-splitting-tutorial).

テストを初めて実行するときは、コマンドで使用するタイミングデータがありませんが、その後の実行でテスト時間が最適化されます。
{: class="alert alert-info"}

## 手動による設定
{: #manual-allocation }

CLI は現在のコンテナインデックスと使用可能な実行環境の数を調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテストファイルを分割します。

デフォルトでは、プロジェクトの設定ファイルの `parallelism` キーによってコンテナ数を指定します。 You can also manually set the number by using the `--total` flag.

```shell
circleci tests split --total=4 test_filenames.txt
```

Similarly, the current container index is automatically picked up from the `$CIRCLE_NODE_INDEX` environment variable, but can be manually set by using the `--index` flag.

```shell
circleci tests split --index=0 test_filenames.txt
```

## 環境変数を使用したテスト分割
{: #using-environment-variables-to-split-tests }

CircleCI には並列の Executor 間でのテスト分割処理を完全に制御するために環境変数が 2 つ用意されており、CLI の代わりに使用し、コンテナを個別に設定することができます。

* `$CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job.
* `$CIRCLE_NODE_INDEX` is the index of the specific container that is currently running.

詳細については、[プロジェクトの値と変数]({{site.baseurl}}/ja/variables#built-in-environment-variables)を参照してください。

## その他のテスト分割方法
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test suite. CircleCI ではこれらのアプリケーションの開発やサポートを行っていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 If you are unable to resolve the issue you can search and ask on our forum, [Discuss](https://discuss.circleci.com/).

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)**: Golang パッケージをグロブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージテストを複数のコンテナに分割できます。

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```
- **[Playwright](https://github.com/microsoft/playwright)** - This is a framework for web testing and automation and allows running sharded tests out of the box. For more details see [playwright docs](https://playwright.dev/docs/ci#circleci).

  ```yaml
  job-name:
    executor: pw-focal-development
    parallelism: 4
    steps:
      - run: SHARD="$((${CIRCLE_NODE_INDEX}+1))"; npx playwright test -- --shard=${SHARD}/${CIRCLE_NODE_TOTAL} 
  ```

## 既知の制限
{: #known-limitations }

現時点では、タイミングデータに基づいたテスト分割は Windows リソースクラスでは使用できません。

## 次のステップ
{: #next-steps }

* How to [use the CircleCI CLI to split tests](/docs/use-the-circleci-cli-to-split-tests)
* チュートリアル: [パイプラインを高速化するためのテスト分割](/docs/ja/test-splitting-tutorial)
* [テスト分割のとラブルシューティング](/docs/troubleshoot-test-splitting/)
* [テストデータの収集](/docs/collect-test-data/)
* [テストインサイト](/docs/insights-tests/)
