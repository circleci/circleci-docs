---
layout: classic-docs
title: "テストの並列実行"
short-title: "テストの並列実行"
description: "テストを並列に実行する方法"
categories:
  - optimization
order: 60
---

プロジェクトに多数のテストが含まれる場合、それらを 1台のマシンで実行するのは時間がかかります。 この時間を短縮するために、テストを複数のマシンに分散させて並列に実行することができます。 それには、並列処理レベルを指定する必要があります。 CircleCI CLI を使用してテストファイルを分割するか、環境変数を使用して並列マシンを個別に設定します。

- 目次
{:toc}

## ジョブの並列処理レベルの指定

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/#並列ジョブの設定例)レベルで定義されます。 `parallelism` キーには、ジョブのステップを実行するうえで設定が必要な独立した Executors の数を指定します。

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

詳細については、「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/#parallelism)」を参照してください。

## CircleCI CLI を使用したテストの分割

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当てはファイル単位で行われます。 割り当てには CircleCI CLI が必要で、実行時にビルドに自動挿入されます。

CLI をローカルにインストールするには、「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/ja/2.0/local-cli/)」の説明を参照してください。

### テストファイルのグロブ

{:.no_toc}

CLI では、以下のパターンを使用したテストファイルのグロブをサポートしています。

- `*` は、任意の文字シーケンスに一致します (パス区切り文字を除く)。
- `**` は、任意の文字シーケンスに一致します (パス区切り文字を含む)。
- `?` は、任意の 1文字に一致します (パス区切り文字を除く)。
- `[abc]` は、角かっこ内の任意の文字に一致します (パス区切り文字を除く)。
- `{foo,bar,...}` は、中かっこ内のいずれかの文字シーケンスに一致します。

テストファイルをグロブするには、`circleci tests glob` コマンドに 1つ以上のパターンを渡します。

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

### テストファイルの分割

{:.no_toc}

CLI では、並列ビルドの実行時に、複数のマシン間でテストを分割することができます。 テストを分割するには、ファイル名のリストを `circleci tests split` コマンドに渡します。

    circleci tests split test_filenames.txt


CLI は、コンテナ数と現在のコンテナインデックスを調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナ間でテストファイルを分割します。

デフォルトでは、`parallelism` キーによってコンテナ数が指定されます。 `--total` フラグを使用すれば、手動で設定できます。

    circleci tests split --total=4 test_filenames.txt


同様に、現在のコンテナインデックスは環境変数を基に自動的に決定されますが、`--index` フラグを使用して手動で設定することも可能です。

    circleci tests split --index=0 test_filenames.txt


#### ファイル名に基づいた分割

{:.no_toc}

デフォルトでは、`circleci tests split` はファイル名の一覧が渡されることを想定しており、テスト名によってテストをアルファベット順に分割します。 ファイル名の一覧は、以下に挙げる複数の方法で用意できます。

テストファイル名を含むテキストファイルを作成する

    circleci tests split test_filenames.txt


テストファイルへのパスを指定する

    circleci tests split < /path/to/items/to/split


テストファイルのグロブをパイプする

    circleci tests glob "test/**/*.java" | circleci tests split


#### ファイルサイズに基づいた分割

{:.no_toc}

ファイルパスを指定すれば、CLI はファイルサイズでも分割できます。 ファイルサイズで分割するには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

    circleci tests glob "**/*.go" | circleci tests split --split-by=filesize


#### タイミングデータに基づいた分割

{:.no_toc}

CircleCI は、テストスイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリにタイミングデータを保存します。 `store_test_results` を使用しないと、テストの分割に使用できるタイミングデータは生成されません。

テストのタイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。

    circleci tests glob "**/*.go" | circleci tests split --split-by=timings


CLI は、テストスイートによって生成されたタイミングデータに、ファイル名とクラス名の両方が存在することを想定しています。 デフォルトでは、ファイル名に基づいて分割するように指定されていますが、`--timings-type` フラグを使用してクラス名を指定することもできます。

    cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname


手動でタイミングデータを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) ステップを使用します。

## 環境変数を使用したテストの分割

CircleCI には、並列処理を完全に制御するために、コンテナを個別に設定するとき CLI の代わりに使用できる 2つの環境変数が用意されています。 `CIRCLE_NODE_TOTAL` はジョブの実行に使用されている並列コンテナの合計数、`CIRCLE_NODE_INDEX` は現在実行されている特定のコンテナのインデックスです。 詳細については、「[定義済み環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#定義済み環境変数)」を参照してください。

## 分割テストの実行

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストを環境変数に保存してから、その変数をテストランナーに渡します。

```bash
TESTFILES=$(circleci tests glob "spec/**/*.rb" | circleci tests split --split-by=timings)
bundle exec rspec -- ${TESTFILES}
```

TESTFILES 変数は、$CIRCLE_NODE_INDEX と $CIRCLE_NODE_TOTAL に応じて、コンテナごとに異なる値を持ちます。

### ビデオ：グロブのトラブルシューティング

{:.no_toc}

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>

## 関連項目

[コンテナを使用する]({{ site.baseurl }}/2.0/containers/)

## その他のテスト分割方法

一部のサードパーティのアプリケーションやライブラリでも、テストスイートの分割がサポートされています。 これらのアプリケーションは、CircleCI では開発およびサポートが行われていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、CircleCI のフォーラム「[CircleCI Discuss](https://discuss.circleci.com/)」で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**：並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[PHPUnit Finder](https://github.com/previousnext/phpunit-finder)**：`phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して印刷するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
