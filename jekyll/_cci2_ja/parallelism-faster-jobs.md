---
layout: classic-docs
title: "テストの並列実行"
short-title: "テストの並列実行"
description: "テストを並列に実行する方法"
categories:
  - optimization
order: 60
---

プロジェクトに含まれるテストの数が多いほど、テストを 1 台のマシンで実行するのに時間がかかるようになります。 この時間を短縮するために、テストを複数の Executor に分散させて並列に実行することができます。 それには、並列処理レベルを指定して、テスト ジョブ用にスピン アップする個別の Executor の数を定義する必要があります。 さらに、CircleCI CLI を使用してテスト ファイルを分割するか、環境変数を使用して各並列マシンを個別に構成します。

- 目次
{:toc}

## ジョブの並列処理レベルの指定

テスト スイートは通常、`.circleci/config.yml` ファイルの[ジョブ レベルで定義]({{ site.baseurl }}/2.0/jobs-steps/#並列ジョブを使用した設定ファイルの例)します。 `parallelism` キーには、ジョブのステップを実行するためにセットアップする独立した Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 1 よりも大きい値を設定します。

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    parallelism: 4
```

![並列処理]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/#parallelism)」を参照してください。

## CircleCI CLI を使用したテストの分割

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当ては、使用しているテスト ランナーの要件に応じて、ファイル名またはクラス名に基づいて行われます。 割り当てには CircleCI CLI が必要で、実行時にビルドに自動挿入されます。

CLI をローカルにインストールするには、「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/)」の説明を参照してください。

### テスト ファイルの分割
{:.no_toc}

CLI では、並列ジョブの実行時に複数のマシンにテストを分割できます。 それには、`circleci tests split` コマンドでファイル名またはクラス名のリストをテスト ランナーに渡す必要があります。

#### テスト ファイルのグロブ
{:.no_toc}

CLI では、以下のパターンを使用したテスト ファイルのグロブをサポートしています。

- `*` は、任意の文字シーケンスに一致します (パス区切り文字を除く)。
- `**` は、任意の文字シーケンスに一致します (パス区切り文字を含む)。
- `?` は、任意の 1 文字に一致します (パス区切り文字を除く)。
- `[abc]` は、角かっこ内の任意の文字に一致します (パス区切り文字を除く)。
- `{foo,bar,...}` は、中かっこ内のいずれかの文字シーケンスに一致します。

テスト ファイルをグロブするには、`circleci tests glob` コマンドに 1 つ以上のパターンを渡します。

    circleci tests glob "tests/unit/*.java" "tests/functional/*.java"
    

パターン照合の結果を確認するには、`echo` コマンドを使用します。

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    parallelism: 4
    steps:
      - run:
          command: |
            echo $(circleci tests glob "foo/**/*" "bar/**/*")
            circleci tests glob "foo/**/*" "bar/**/*" | xargs -n 1 echo
```

#### タイミング データに基づいた分割

一連の並列 Executor でテスト スイートを最適化するための最良の方法は、タイミング データを使用してテストを分割することです。 これにより、テストが最も均等に分割され、全体のテスト時間が短縮されます。

![テストの分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

CircleCI は、テスト スイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリからタイミング データを保存しています。 このタイミング データには、使用している言語に応じて、ファイル名またはクラス名ごとに各テストが完了するのにかかった時間が記録されます。

メモ: `store_test_results` を使用しないと、テストの分割に使用できるタイミング データは生成されません。

タイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。 これで、使用可能なタイミング データが分析され、テストが可能な限り均等に並列コンテナに分割され、テストの実行時間が最短になります。

    circleci tests glob "**/*.go" | circleci tests split --split-by=timings
    

CLI は、テスト スイートによって生成されたタイミング データに、ファイル名とクラス名の両方が存在することを想定しています。 デフォルトでは、ファイル名に基づいて分割されますが、`--timings-type` フラグを使用してクラス名を指定することもできます。

    cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
    

手動でタイミング データを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) ステップを使用します。

#### ファイル名に基づいた分割
{:.no_toc}

デフォルトでは、`--split-by` フラグを使用しない場合、`circleci tests split` はファイル名またはクラス名の一覧が渡されることを想定しており、テスト名またはクラス名によってアルファベット順にテストを分割します。 ファイル名の一覧は、以下に挙げる複数の方法で用意できます。

テスト ファイル名を含むテキスト ファイルを作成する

    circleci tests split test_filenames.txt
    

テスト ファイルへのパスを指定する

    circleci tests split < /path/to/items/to/split
    

テスト ファイルのグロブをパイプする

    circleci tests glob "test/**/*.java" | circleci tests split
    

CLI は、使用可能なコンテナ数と現在のコンテナ インデックスを調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテスト ファイルを分割します。

デフォルトでは、`parallelism` キーによってコンテナ数を指定します。 `--total` フラグを使用すれば、手動で設定できます。

    circleci tests split --total=4 test_filenames.txt
    

同様に、現在のコンテナ インデックスは環境変数を基に自動的に決定されますが、`--index` フラグを使用して手動で設定することも可能です。

    circleci tests split --index=0 test_filenames.txt
    

#### ファイル サイズに基づいた分割
{:.no_toc}

ファイル パスを指定すれば、CLI はファイル サイズでも分割できます。 それには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

    circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
    

## 環境変数を使用したテストの分割

CircleCI には並列処理を完全に制御するための環境変数が 2 つ用意されており、CLI の代わりに使用してコンテナを個別に構成できます。 `CIRCLE_NODE_TOTAL` はジョブの実行に使用されている並列コンテナの合計数、`CIRCLE_NODE_INDEX` は現在実行されている特定のコンテナのインデックスです。 詳細については、「[定義済み環境変数]({{ site.baseurl }}/2.0/env-vars/#定義済み環境変数)」を参照してください。

## 分割テストの実行

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストをファイルに保存してから、そのファイルをテスト ランナーに渡します。

```bash
circleci tests glob test/**/*.rb | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

TESTFILES 変数は、$CIRCLE_NODE_INDEX と $CIRCLE_NODE_TOTAL に応じて、コンテナごとに異なる値を持ちます。

### ビデオ: グロブのトラブルシューティング
{:.no_toc}

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe> 

## 関連項目

[コンテナを使用する]({{ site.baseurl }}/2.0/containers/)

## その他のテスト分割方法

一部のサードパーティのアプリケーションやライブラリでも、テスト スイートの分割がサポートされていますが、 CircleCI ではこれらのアプリケーションの開発やサポートを行っていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、CircleCI のフォーラム「[CircleCI Discuss](https://discuss.circleci.com/)」で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テスト スイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[PHPUnit Finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テスト ファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。

- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)** : Golang パッケージをグラブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージ テストを複数のコンテナに分割できます。 ```go test -v $(go list ./... | circleci tests split)```