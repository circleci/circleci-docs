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
* テストを分割する [Executor ]({{site.baseurl}}/executor-intro/) の数の指定
* CircleCI CLI が提供するオプション (名前やサイズに基づいて、またはタイミングデータを使って) によるテストスイートの分割

## はじめに
{: #introduction }

パイプラインは、多くの場合コードがコミットされるたびに一連のテストが実行されるように設定されます。 プロジェクトに含まれるテストの数が多いほど、 1 つのコンピューティングリソースで完了するのに時間がかかるようになります。 この時間を短縮するために、複数の並列の実行環境でテストを分割し、実行することができます。 テスト分割は、CI/CD パイプラインのテスト部分を高速化できる優れた方法です。

テスト分割を使用すると、1 つのテストスイートにおいて分割する場所を以下の方法でインテリジェントに定義できます。

* 名前に基づいて
* サイズに基づいて
* タイミングデータを使用して

## テスト分割のしくみ
{: #how-test-splitting-works }

例えば **タイミングベース**のテスト分割機能を使うと、_以前の_テスト実行のタイミングデータを使って、並行で実行される指定した数のテスト環境でテストスイートをできるだけ均等に分割できます。 これにより、使用中のコンピューティング能力のテスト時間が可能な限り短くなります。

![テスト分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

このタイミングデータを使ったテスト分割の効果を定量的に示すために、 CircleCI アプリケーションプロジェクト全体で実行されるテストスイートに `parallelism: 10` を追加すると、実際にテスト時間が **26:11 から 3:55** に短縮されました。

タイミングベースのテスト分割により、テストを最も正確に分割でき、各テストスイートの実行を確実に最適化することができます。 分割する場所の決定には、必ず最も新しいタイミンングデータが使用されます。

go テストスイートを例にあげます。 この例では、すべてのテスト実行が 1つのテスト環境 (Docker コンテナ) で順番に実行されます。

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

1. 並列実行により、多数の同一テスト環境 (下記例では 10 個) をスピンアップする
2. `--split-by=timings` フラグを指定して `circleci tests split` コマンドを使用し、テストをすべての実行環境で均等に分割する

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

テストを初めて実行するときは、コマンドで使用するタイミングデータがありませんが、その後の実行でテスト時間が最適化されます。
{: class="alert alert-info"}

## ジョブの並列実行レベルの指定
{: #specif-a-jobs-parallelism-level }

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/jobs-steps/)レベルで定義します。 `parallelism` キーにより、ジョブを実行するためにセットアップする独立した Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 2 以上の値を設定します。 下記の例では、`parallelism` は `4` と設定されており、このジョブには 4 つの同一の実行環境がセットアップされることを意味します。 その後変更がなければ、ジョブ全体が各実行環境で実行されます。 各環境で別々のテストを実行して、テストの実行時間を短縮するには、[テスト分割の設定](#use-the-circleci-cli-to-split-tests)をする必要があります。

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

### セルフホストランナーでの並列実行機能の使用
{: #use-parallelism-with-self-hosted-runners }

[セルフホストランナー]({{site.baseurl}}/ja/runner-overview/)を使ったジョブでこの並列実行機能を使用するには、ジョブを実行するランナーリソースクラスに、少なくとも 2 つのセルフホストランナーが関連付けられていることを確認してください。 指定したリソースクラスでアクティブなセルフホストランナーの数より大きな並列実行の値を設定すると、実行するセルフホストランナーがない超過した並列タスクは、セルフホストランナーが使用可能になるまでキューに入ります。

詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference/#parallelism) を参照してください。

## CircleCI CLI を使用したテスト分割
{: #use-the-circleci-cli-to-split-tests }

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当ては、使用しているテストランナーの要件に応じて、ファイル名またはクラス名に基づいて行われます。 テスト分割には CircleCI CLI が必要で、実行時に自動的にビルドに挿入されます。

`circleci tests` コマンド (`glob` と `split`) は、CircleCI コンテナ内にのみ存在する情報を必要とするため、CLI でローカル実行することはできません。
{: class="alert alert-warning"}

CLI では、並列ジョブの実行時に複数の Executor にテストを分割できます。 それには、`circleci tests split` コマンドでファイル名またはクラス名のリストをテストランナーに渡す必要があります。

[セルフホストランナー]({{site.baseurl}}/ja/runner-overview/)は、CLI を使ってテストを分割する代わりに、`circleci-agent` を直接呼び出すことができます。 これは、[タスクエージェント]({{site.baseurl}}/ja/runner-overview/#circleci-runner-operation)が既に `$PATH` 上に存在し、テスト分割時には追加の依存関係が削除されるからです。


### 1.  テストファイルのグロブ
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

### 2.  テスト分割
{: split-tests }

#### a.  タイミングデータに基づいた分割
{: #split-by-timing-data }

`store_test_results` を使用していない場合、テスト分割に使用できるタイミングデータがありません。
{: class="alert alert-warning"}

一連の並列 Executor でテストスイートを最適化するための最良の方法は、タイミングデータを使用してテストを分割することです。 この方法では、テストが最も均等に分割され、テスト時間が短縮されます。

CircleCI は、テストスイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/ja/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリからタイミングデータを保存しています。 このタイミングデータには、ファイル名やクラス名ごとに各テストが完了するまでにかかった時間が含まれます。

タイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。 これで、使用可能なタイミングデータが分析され、テストが可能な限り均等に並列コンテナに分割されます。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

CLI は、テストスイートによって生成されたタイミングデータに、ファイル名とクラス名の両方が存在することを想定しています。 デフォルトでは、分割は `filename` に基づく `--timings-type` に設定されています。 テストカバレッジ出力のフォーマットに応じて、異なるタイミングタイプを選択する必要がある場合があります。 有効なタイミングタイプは、`filename`、`classname`、`testname`、`autodetect` です。

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

部分的に検出されたテスト結果については、タイミングデータが見つからないテストにランダムな小さな値が割り当てられます。 このデフォルトの値は、`--time-default` フラグを使って特定の値に上書きできます。

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

手動でタイミングデータを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/ja/configuration-reference/#store_artifacts) ステップを使用します。

タイミングデータが見つからない場合、`Error autodetecting timing type, falling back to weighting by name` というメッセージが出力されます。 この場合、テストはテスト名に基づきアルファベット順に分割されます。
{: class="alert alert-info"}

#### b.  名前に基づいた分割 (デフォルト)
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

#### c. ファイルサイズに基づいた分割
{: #splitting-by-filesize }

ファイルパスを指定すれば、CLI はファイルサイズでも分割できます。 それには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

### 3.  分割テストの実行
{: #running-split-tests }

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストをファイルに保存してから、そのファイルをテストランナーに渡します。

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

ファイル `/tmp/tests-to-run` の内容は、`$CIRCLE_NODE_INDEX` と `$CIRCLE_NODE_TOTAL` に応じて、コンテナごとに異なる値を持ちます。

## 手動による設定
{: #manual-allocation }

CLI は現在のコンテナインデックスと使用可能な実行環境の数を調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテストファイルを分割します。

デフォルトでは、プロジェクトの設定ファイルの `parallelism` キーによってコンテナ数を指定します。 `--total` フラグを使用すると、手動で設定できます。

```shell
circleci tests split --total=4 test_filenames.txt
```

同様に、現在のコンテナインデックスは `$CIRCLE_NODE_INDEX` 環境変数から自動的に決定されますが、`--index` フラグを使用して手動で設定することもできます。

```shell
circleci tests split --index=0 test_filenames.txt
```

## 環境変数を使用したテスト分割
{: #using-environment-variables-to-split-tests }

CircleCI には並列の Executor 間でのテスト分割処理を完全に制御するために環境変数が 2 つ用意されており、CLI の代わりに使用し、コンテナを個別に設定することができます。

`$CIRCLE_NODE_TOTAL` はジョブの実行に使用されている並列コンテナの合計数、`$CIRCLE_NODE_INDEX` は現在実行されている特定のコンテナのインデックスです。 詳細については、[プロジェクトの値と変数]({{site.baseurl}}/ja/variables#built-in-environment-variables)を参照してください。

## その他のテスト分割方法
{: #other-ways-to-split-tests }

一部のサードパーティのアプリケーションやライブラリでも、テスト スイートの分割がサポートされていますが、 CircleCI ではこれらのアプリケーションの開発やサポートを行っていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、[CircleCI の Discuss フォーラム](https://discuss.circleci.com/)で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)**: Golang パッケージをグロブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージテストを複数のコンテナに分割できます。

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```

## Known Limitations
{: #known-limitations }

Test splitting by timing does not work on Windows resource classes at this time.

## 次のステップ
{: #next-steps }

* チュートリアル: [パイプラインを高速化するためのテスト分割](/docs/ja/test-splitting-tutorial)
* [テスト分割のとラブルシューティング]({{ site.baseurl }}/troubleshoot-test-splitting/)
* [テストデータの収集]({{ site.baseurl }}/collect-test-data/)
* [テストインサイト]({{ site.baseurl }}/insights-tests/)
