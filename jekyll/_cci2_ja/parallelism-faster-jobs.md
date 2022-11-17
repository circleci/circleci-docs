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

Use parallelism and test splitting to:

* Reduce the time taken for the testing portion of your CI/CD pipeline.
* Specify a number of [executors]({{site.baseurl}}/executor-intro/) across which to split your testss.
* Split your test suite using one of the options provided by the CircleCI CLI: by name, size or by using timing data.

## はじめに
{: #introduction }

パイプラインは、一般的にコードがコミットされるたびに一連のテストが実行されるように設定されます。 プロジェクトに含まれるテストの数が多いほど、 1 つのコンピューティングリソースで完了するのに時間がかかるようになります。 この時間を短縮するために、複数の並列の実行環境でテストを分割し、実行することができます。 テスト分割は、CI/CD パイプラインのテスト部分を高速化できる優れた方法です。

テスト分割を使用すると、テストスイート全体で分割が行われる場所をインテリジェントに定義できます。

* 名前で
* サイズで
* タイミングデータを使用して

## How test splitting works
{: #how-test-splitting-works }

Using **timing-based** test splitting as an example, timing data from the _previous_ test run is used to split a test suite as evenly as possible over a specified number of test environments running in parallel. This delivers the lowest possible test time for the compute power in use.

![テスト分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

このタイミングデータを使ったテスト分割の効果を定量的に示すために、 CircleCI アプリケーションプロジェクト全体で実行されるテストスイートに `parallelism: 10` を追加すると、実際にテスト時間が **26:11 から 3:55** に短縮されました。

タイミングベースのテスト分割により、テストを最も正確に分割でき、各テストスイートの実行で確実に最適化することができます。 分割する場所の決定には、必ず最も新しいタイミンングデータが使用されます。

As an example, take a go test suite. Here, all tests run sequentially in a single test environment, in this example, a docker container:

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

To split these tests using timing data:

1. Introduce parallelism to spin up a number of identical test environments (10 in this example)
2. Use the `circleci tests split` command, with the `--split-by=timings` flag to split the tests evenly across all executors.

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
    parallelism: 10
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

The first time the tests are run there will be no timing data for the command to use, but on subsequent runs the test time will be optimized.
{: class="alert alert-info"}

## Specify a job's parallelism level
{: #specif-a-jobs-parallelism-level }

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/jobs-steps/)レベルで定義します。 The `parallelism` key specifies how many independent executors are set up to run the job.

ジョブのステップを並列に実行するには、`parallelism` キーに 2 以上の値を設定します。 In the example below `parallelism` is set to `4`, meaning four identical execution environments will be set up for the job. With no further changes the full job will be run in each execution environment. To run different tests in each environment, so reducing the time taken to run the tests, you also need to [configure test splitting](#use-the-circleci-cli-to-split-tests).

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

### Use parallelism with self-hosted runners
{: #use-parallelism-with-self-hosted-runners }

[セルフホストランナー]({{site.baseurl}}/ja/runner-overview/)を使ったジョブでこの並列実行機能を使用するには、ジョブを実行するランナーリソースクラスに、少なくとも 2 つのセルフホストランナーが関連付けられていることを確認してください。 任意のリソースクラスでアクティブなセルフホストランナーの数より大きな並列実行の値を設定すると、実行するセルフホストランナーがない過剰な並列タスクは、セルフホストランナーが使用可能になるまでキューに入れられます。

For more information, see the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/#parallelism) page.

## Use the CircleCI CLI to split tests
{: #use-the-circleci-cli-to-split-tests }

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当ては、使用しているテストランナーの要件に応じて、ファイル名またはクラス名に基づいて行われます。 テスト分割には CircleCI CLI が必要で、実行時にビルドに自動挿入されます。

The `circleci tests` commands (`glob` and `split`) cannot be run locally via the CLI as they require information that only exists within a CircleCI container.
{: class="alert alert-warning"}

CLI では、並列ジョブの実行時に複数の Executor にテストを分割できます。 それには、`circleci tests split` コマンドでファイル名またはクラス名のリストをテストランナーに渡す必要があります。

[セルフホストランナー]({{site.baseurl}}/ja/runner-overview/)は、CLI を使ってテストを分割する代わりに、`circleci-agent` を直接呼び出すことができます。 これは、[タスクエージェント]({{site.baseurl}}/ja/runner-overview/#circleci-runner-operation)が既に `$PATH` 上に存在し、テスト分割時には追加の依存関係が削除されるからです。


### 1.  Glob test files
{: #glob-test-files }

CLI では、以下のパターンを使用したテストファイルのグロブをサポートしています。

- `*` は、任意の文字シーケンスに一致します (パス区切り文字を除く)。
- `**` は、任意の文字シーケンスに一致します (パス区切り文字を含む)。
- `?` は、任意の 1 文字に一致します (パス区切り文字を除く)。
- `[abc]` は、角かっこ内の任意の文字に一致します (パス区切り文字を除く)。
- `{foo,bar,...}` は、中かっこ内のいずれかの文字シーケンスに一致します。

テストファイルをグロブするには、`circleci tests glob` コマンドに 1 つ以上のパターンを渡します。

```shell
circleci tests glob "tests/unit/*.java" "tests/functional/*.java"
```

パターン照合の結果を確認するには、`echo` コマンドを使用します。

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    parallelism: 4
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

### 2.  Split tests
{: split-tests }

#### a.  Split by timing data
{: #split-by-timing-data }

If you do not use `store_test_results`, there will be no timing data available to split your tests.
{: class="alert alert-warning"}

一連の並列 Executor でテストスイートを最適化するための最良の方法は、タイミングデータを使用してテストを分割することです。 これにより、テストが最も均等に分割され、テスト時間が短縮されます。

CircleCI は、テストスイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/ja/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリからタイミングデータを保存しています。 このタイミングデータは、ファイル名やクラス名ごとに各テストが完了するまでにかかった時間で構成されます。

タイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。 これで、使用可能なタイミングデータが分析され、テストが可能な限り均等に並列コンテナに分割されます。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

CLI は、テストスイートによって生成されたタイミングデータに、ファイル名とクラス名の両方が存在することを想定しています。 By default, splitting defaults `--timings-type` to `filename`. You may need to choose a different timings type depending on how your test coverage output is formatted. Valid timing types are `filename`, `classname`, `testname`, and `autodetect`.

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

部分的に検出されたテスト結果については、タイミングデータが見つからないテストにランダムな小さな値が割り当てられます。 このデフォルトの値は、`--time-default` フラグを使って特定の値に上書きできます。

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

手動でタイミングデータを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/ja/configuration-reference/#store_artifacts) ステップを使用します。

If no timing data is found, you will receive a message: `Error autodetecting timing type, falling back to weighting by name.`. この場合、テストはテスト名に基づきアルファベット順に分割されます。
{: class="alert alert-info"}

#### b.  Split by name (default)
{: #split-by-name }

デフォルトでは、`--split-by` フラグを使用しない場合、`circleci tests split` はファイル名またはクラス名の一覧が渡されることを想定しており、テスト名によってアルファベット順にテストを分割します。 ファイル名の一覧は、以下に挙げる複数の方法で用意できます。

* テストファイル名を含むテキストファイルを作成する
```shell
circleci tests split test_filenames.txt
```

* テストファイルへのパスを指定する
```shell
circleci tests split < /path/to/items/to/split
```

* テストファイルのグロブをパイプする
```shell
circleci tests glob "test/**/*.java" | circleci tests split
```

#### c. Split by filesize
{: #splitting-by-filesize }

ファイルパスを指定すれば、CLI はファイルサイズでも分割できます。 それには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

### 3.  Run split tests
{: #running-split-tests }

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストをファイルに保存してから、そのファイルをテストランナーに渡します。

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

ファイル `/tmp/tests-to-run` の内容は、`$CIRCLE_NODE_INDEX` と `$CIRCLE_NODE_TOTAL` に応じて、コンテナごとに異なる値を持ちます。

## Manual allocation
{: #manual-allocation }

The CLI looks up the number of available execution environments, along with the current container index (`$CIRCLE_NODE_INDEX`). 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテストファイルを分割します。

デフォルトでは、プロジェクトの設定ファイルの `parallelism` キーによってコンテナ数を指定します。 `--total` フラグを使用すれば、手動で設定できます。

```shell
circleci tests split --total=4 test_filenames.txt
```

Similarly, the current container index is automatically picked up from the `$CIRCLE_NODE_INDEX` environment variable, but can be manually set by using the `--index` flag.

```shell
circleci tests split --index=0 test_filenames.txt
```

## Use environment variables to split tests
{: #using-environment-variables-to-split-tests }

CircleCI には並列の Executor 間でのテスト分割処理を完全に制御するために環境変数が 2 つ用意されており、CLI の代わりに使用してコンテナを個別に設定できます。

`$CIRCLE_NODE_TOTAL` is the total number of parallel containers being used to run your job, and `$CIRCLE_NODE_INDEX` is the index of the specific container that is currently running. 詳細については、[プロジェクトの値と変数]({{site.baseurl}}/ja/variables#built-in-environment-variables)を参照してください。

## その他のテスト分割方法
{: #other-ways-to-split-tests }

Some third party applications and libraries might help you to split your test suite. CircleCI ではこれらのアプリケーションの開発やサポートを行っていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、[CircleCI の Discuss フォーラム](https://discuss.circleci.com/)で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)**: Golang パッケージをグロブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージテストを複数のコンテナに分割できます。

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```

## 次のステップ
{: #next-steps }

* Tutorial: [Test splitting to speed up your pipelines](/docs/test-splitting-tutorial)
* [テスト分割のとラブルシューティング]({{ site.baseurl }}/troubleshoot-test-splitting/)
* [テストデータの収集]({{ site.baseurl }}/collect-test-data/)
* [テストインサイト]({{ site.baseurl }}/insights-tests/)
