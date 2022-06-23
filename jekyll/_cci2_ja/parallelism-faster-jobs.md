---
layout: classic-docs
title: "テスト分割と並列実行"
description: "CircleCI パイプラインを最適化するために、並列のコンピューティング環境でテストを分割し実行するためのガイドです。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

プロジェクトに含まれるテストの数が多いほど、 1 つのコンピューティングリソースで完了するのに時間がかかるようになります。 この時間を短縮するために、複数の並列の実行環境でテストを分割し、実行することができます。 並列実行レベルを指定すると、スピンアップしてテストスイートを実行する [Executor]({{site.baseurl}}/ja/2.0/executor-intro/) の数が定義されます。 その後、CIrcleCI CLI を使ってテストスイートを分割したり、環境変数を使って並列実行している各 Exexutor を設定することができます。

* 目次
{:toc}

## テストを分割してパイプラインを高速化する
{: #test-splitting-to-speed-up-pipelines }

パイプラインは、一般的にコードがコミットされるたびに一連のテストが実行されるように設定されます。 テスト分割は、CI/CD パイプラインのテスト部分を高速化できる優れた方法です。 一連のテストを並行で実行されるさまざまなテスト環境に分割できます。

テスト分割を使用すると、テストスイート全体で分割が行われる場所をインテリジェントに定義できます。

* 名前で
* サイズで
* タイミングデータを使用して

**タイミングベース**のテスト分割を使用すると、前回のテスト実行のタイミングデータを使用して、並行して実行されている指定された数のテスト環境でできるだけ均等にテストスイートを分割し、使用中の計算能力のテスト時間を最小限に抑えることができます。

![テスト分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

順次実行されるテストスイートを使って、これを 説明します。すべてのテストは、単一のテスト環境 (Docker コンテナ) で実行されます。

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test
```

これらのテストをタイミングデータを使って分割するには、まず並列実行により多数の同一テスト環境 (下記例では 10個) をスピンアップします。 次に、 `--split-by=timings` フラグを指定して `circleci tests split` コマンドを使用して、すべての Executor で均等にテストを分割し、テストが最短時間で実行されるようにします。

```yaml
jobs:
  build:
    docker:
      - image: cimg/go:1.18.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 10
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split --split-by=timings)
```

**注:** テストを初めて実行するときは、コマンドで使用するタイミングデータがありませんが、その後の実行ではテスト時間が最適化されます。

### 効果は？
{: #is-it-worth-it }

このタイミングデータを使ったテスト分割の効果を定量的に示すために、 CircleCI アプリケーションプロジェクト全体で実行されるテストスイートに `parallelism: 10` を追加すると、実際にテスト時間が **26:11 から 3:55** に短縮されました。

タイミングベースのテスト分割により、テストを最も正確に分割でき、各テストスイートの実行で確実に最適化することができます。 分割する場所の決定には、必ず最も新しいタイミンングデータが使用されます。

## ジョブの並列実行レベルの指定
{: #specifying-a-jobs-parallelism-level }

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/)レベルで定義</a>します。 `parallelism` キーには、ジョブのステップを実行するために設定する個々の Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 2 以上の値を設定します。

```yaml
# ~/.circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parallelism: 4
```

![並列実行]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

[セルフホストランナー]({{site.baseurl}}/ja/2.0/runner-overview/)を使ったジョブでこの並列実行機能を使用するには、ジョブを実行するランナーリソースクラスに、少なくとも 2 つのセルフホストランナーが関連付けられていることを確認してください。 任意のリソースクラスでアクティブなセルフホストランナーの数より大きな並列実行の値を設定すると、実行するセルフホストランナーがない過剰な並列タスクは、セルフホストランナーが使用可能になるまでキューに入れられます。

詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/2.0/configuration-reference/#parallelism)を参照してください。

## CircleCI CLI を使用したテストの分割
{: #using-the-circleci-cli-to-split-tests }

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当ては、使用しているテスト ランナーの要件に応じて、ファイル名またはクラス名に基づいて行われます。 テスト分割には CircleCI CLI が必要で、実行時にビルドに自動挿入されます。

**注**: `circleci tests` コマンド (`glob` と `split`) は、CircleCI コンテナ内にのみ存在する情報を必要とするため、CLI でローカル実行することはできません。

CLI では、並列ジョブの実行時に複数の Executor にテストを分割できます。 それには、`circleci tests split` コマンドでファイル名またはクラス名のリストをテスト ランナーに渡す必要があります。

[セルフホストランナー]({{site.baseurl}}/2.0/runner-overview/)は、CLI を使ってテストを分割する代わりに、`circleci-agent` を直接呼び出すことができます。 これは、[タスクエージェント]({{site.baseurl}}/ja/2.0/runner-overview/#circleci-runner-operation)が既に `$PATH` 上に存在し、テスト分割時には追加の依存関係が削除されるからです。


### テストファイルのグロブ
{: #globbing-test-files }

CLI では、以下のパターンを使用したテストファイルのグロブをサポートしています。

- `*` は、任意の文字シーケンスに一致します (パス区切り文字を除く)。
- `**` は、任意の文字シーケンスに一致します (パス区切り文字を含む)。
- `?` は、任意の 1 文字に一致します (パス区切り文字を除く)。
- `[abc]` は、角かっこ内の任意の文字に一致します (パス区切り文字を除く)。
- `{foo,bar,...}` は、中かっこ内のいずれかの文字シーケンスに一致します。

テストファイルをグロブするには、`circleci tests glob` コマンドに 1 つ以上のパターンを渡します。

```
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

### タイミングデータに基づいた分割
{: #splitting-by-timing-data }

一連の並列 Executor でテストスイートを最適化するための最良の方法は、タイミングデータを使用してテストを分割することです。 これにより、テストが最も均等に分割され、テスト時間が短縮されます。

CircleCI は、テストスイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリからタイミング データを保存しています。 このタイミングデータは、ファイル名やクラス名ごとに各テストが完了するまでにかかった時間で構成されます。

**注**: `store_test_results` を使用しないと、テストの分割に使用できるタイミングデータは生成されません。

タイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。 これで、使用可能なタイミングデータが分析され、テストが可能な限り均等に並列コンテナに分割されます。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

CLI は、テストスイートによって生成されたタイミングデータに、ファイル名とクラス名の両方が存在することを想定しています。 デフォルトでは、ファイル名に基づいて分割されますが、`--timings-type` フラグを使用してクラス名を指定することもできます。

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

部分的に検出されたテスト結果については、タイミングデータが見つからないテストにランダムな小さな値が割り当てられます。 このデフォルトの値は、`--time-default` フラグを使って特定の値に上書きできます。

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

手動でタイミングデータを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) ステップを使用します。

**注**: タイミングデータが見つからない場合、`Error autodetecting timing type, falling back to weighting by name` というメッセージが出力されます。 この場合、テストはテスト名に基づきアルファベット順に分割されます。

### テスト名に基づいた分割
{: #splitting-by-name }

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

CLI は、使用可能なコンテナ数と現在のコンテナ インデックスを調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテスト ファイルを分割します。

デフォルトでは、プロジェクトの設定ファイルの `parallelism` キーによってコンテナ数を指定します。 `--total` フラグを使用すれば、手動で設定できます。

```shell
circleci tests split --total=4 test_filenames.txt
```

同様に、現在のコンテナ インデックスは環境変数を基に自動的に決定されますが、`--index` フラグを使用して手動で設定することも可能です。

```shell
circleci tests split --index=0 test_filenames.txt
```

### ファイルサイズに基づいた分割
{: #splitting-by-filesize }

ファイルパスを指定すれば、CLI はファイルサイズでも分割できます。 それには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

## 分割テストの実行
{: #running-split-tests }

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストをファイルに保存してから、そのファイルをテスト ランナーに渡します。

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

ファイル `/tmp/tests-to-run` の内容は、`$CIRCLE_NODE_INDEX` と `$CIRCLE_NODE_TOTAL` に応じて、コンテナごとに異なる値を持ちます。

## 環境変数を使用したテストの分割
{: #using-environment-variables-to-split-tests }

CircleCI には並列の Executor 間でのテスト分割処理を完全に制御するために環境変数が 2 つ用意されており、CLI の代わりに使用してコンテナを個別に設定できます。 `CIRCLE_NODE_TOTAL` はジョブの実行に使用されている並列コンテナの合計数、`CIRCLE_NODE_INDEX` は現在実行されている特定のコンテナのインデックスです。 詳細については、[定義済み環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#built-in-environment-variables)のページを参照してください。

## その他のテスト分割方法
{: #other-ways-to-split-tests }

一部のサードパーティのアプリケーションやライブラリでも、テストスイートの分割がサポートされています。 これらのアプリケーションは、CircleCI では開発およびサポートが行われていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、CircleCI のフォーラム「[CircleCI Discuss](https://discuss.circleci.com/)」で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)**: Golang パッケージをグロブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージテストを複数のコンテナに分割できます。

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```


## 次のステップ
{: #next-steps }

* [テスト分割のとラブルシューティング]({{ site.baseurl }}/ja/2.0/troubleshoot-test-splitting/)
* [テストデータの収集]({{ site.baseurl }}/ja/2.0/collect-test-data/)
* [テスト インサイト]({{ site.baseurl }}/ja/2.0/insights-tests/)