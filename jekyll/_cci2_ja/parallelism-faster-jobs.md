---
layout: classic-docs
title: "テストの並列実行"
short-title: "テストの並列実行"
description: "テストを並列に実行する方法"
categories:
  - 最適化
order: 60
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

プロジェクトに含まれるテストの数が多いほど、テストを 1 台のマシンで実行するのに時間がかかるようになります。 この時間を短縮するために、テストを複数の Executor に分散させて並列に実行することができます。 それには、並列処理レベルを指定して、テスト ジョブ用にスピン アップする個別の Executor の数を定義する必要があります。 そして、CircleCI CLI を使用してテストファイルを分割するか、環境変数を使用して各並列マシンを個別に構成します。

* 目次
{:toc}

## ジョブの並列処理レベルの指定
{: #specifying-a-jobs-parallelism-level }

テストスイートは通常、`.circleci/config.yml` ファイルの[ジョブ]({{ site.baseurl }}/2.0/jobs-steps/#sample-configuration-with-concurrent-jobs) レベルで定義します。 `parallelism` キーにより、ジョブのステップを実行するためにセットアップする独立した Executor の数を指定します。

ジョブのステップを並列に実行するには、`parallelism` キーに 2 以上の値を設定します。

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
```

![並列処理]({{ site.baseurl }}/assets/img/docs/executor_types_plus_parallelism.png)

詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/#parallelism)」を参照してください。

## CircleCI CLI を使用したテストの分割
{: #using-the-circleci-cli-to-split-tests }

CircleCI では、複数のコンテナに対してテストを自動的に割り当てることができます。 割り当ては、使用しているテストランナーの要件に応じて、ファイル名またはクラス名に基づいて行われます。 割り当てには CircleCI CLI が必要で、実行時にビルドに自動挿入されます。

CLI をローカルにインストールするには、「[CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/)」の説明を参照してください。

注: `circleci tests` コマンド (`glob` と `split`) は、CircleCI コンテナ内にのみ存在する情報を必要とするため、CLI でローカル実行することはできません。

### テストファイルの分割
{: #splitting-test-files }
{:.no_toc}

CLI では、並列ジョブの実行時に複数のマシンにテストを分割できます。 それには、`circleci tests split` コマンドでファイル名またはクラス名のリストをテストランナーに渡す必要があります。

#### テストファイルのグロブ
{: #globbing-test-files }
{:.no_toc}

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

#### タイミングデータに基づいた分割
{: #splitting-by-timing-data }

一連の並列 Executor でテストスイートを最適化するための最良の方法は、タイミングデータを使用してテストを分割することです。 これにより、テストが最も均等に分割され、全体のテスト時間が短縮されます。

![テストの分割]({{ site.baseurl }}/assets/img/docs/test_splitting.png)

CircleCI は、テストスイートの実行が成功するたびに、[`store_test_results`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_test_results) ステップでパスを指定しているディレクトリからタイミングデータを保存しています。 このタイミングデータには、使用している言語に応じて、ファイル名またはクラス名ごとに各テストが完了するのにかかった時間が記録されます。

メモ: `store_test_results` を使用しないと、テストの分割に使用できるタイミングデータは生成されません。

タイミングで分割するには、分割タイプ `timings` を付けて `--split-by` フラグを使用します。 これで、使用可能なタイミングデータが分析され、テストが可能な限り均等に並列コンテナに分割され、テストの実行時間が最短になります。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=timings
```

CLI は、テスト スイートによって生成されたタイミング データに、ファイル名とクラス名の両方が存在することを想定しています。 デフォルトでは、ファイル名に基づいて分割されますが、`--timings-type` フラグを使用してクラス名を指定することもできます。

```shell
cat my_java_test_classnames | circleci tests split --split-by=timings --timings-type=classname
```

For partially found test results, we automatically assign a random small value to any test we did not find timing data for. You can override this assigned value to a specific value with the `--time-default` flag.

```shell
circleci tests glob "**/*.rb" | circleci tests split --split-by=timings --time-default=10s
```

手動でタイミング データを格納および取得する場合は、[`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) ステップを使用します。

注: タイミングデータが見つからない場合、`Error autodetecting timing type, falling back to weighting by name` というメッセージが出力されます。 この場合、テストは、テスト名に基づきアルファベット順に分割されます。

#### テスト名に基づいた分割
{: #splitting-by-name }
{:.no_toc}

デフォルトでは、`--split-by` フラグを使用しない場合、`circleci tests split` はファイル名またはクラス名の一覧が渡されることを想定しており、テスト名またはクラス名によってアルファベット順にテストを分割します。 ファイル名の一覧は、以下に挙げる複数の方法で用意できます。

テストファイル名を含むテキストファイルを作成する

```shell
circleci tests split test_filenames.txt
```

テストファイルへのパスを指定する

```shell
circleci tests split < /path/to/items/to/split
```

テストファイルのグロブをパイプする

```shell
circleci tests glob "test/**/*.java" | circleci tests split
```

CLI は、使用可能なコンテナ数と現在のコンテナ インデックスを調べます。 次に、決定論的な分割アルゴリズムを使用して、使用可能なすべてのコンテナでテスト ファイルを分割します。

デフォルトでは、`parallelism` キーによってコンテナ数を指定します。 `--total` フラグを使用すれば、手動で設定できます。

```shell
circleci tests split --total=4 test_filenames.txt
```

同様に、現在のコンテナ インデックスは環境変数を基に自動的に決定されますが、`--index` フラグを使用して手動で設定することも可能です。

```shell
circleci tests split --index=0 test_filenames.txt
```

#### ファイルサイズに基づいた分割
{: #splitting-by-filesize }
{:.no_toc}

ファイル パスを指定すれば、CLI はファイル サイズでも分割できます。 それには、分割タイプ `filesize` を付けて `--split-by` フラグを使用します。

```shell
circleci tests glob "**/*.go" | circleci tests split --split-by=filesize
```

## 環境変数を使用したテストの分割
{: #using-environment-variables-to-split-tests }

CircleCI には並列処理を完全に制御するための環境変数が 2 つ用意されており、CLI の代わりに使用してコンテナを個別に構成できます。 `CIRCLE_NODE_TOTAL` はジョブの実行に使用されている並列コンテナの合計数、`CIRCLE_NODE_INDEX` は現在実行されている特定のコンテナのインデックスです。 詳細については、「[定義済み環境変数]({{ site.baseurl }}/2.0/env-vars/#定義済み環境変数)」を参照してください。

## 分割テストの実行
{: #running-split-tests }

テストをグロブおよび分割しても、実際にテストが実行されるわけではありません。 テストのグループ化とテストの実行を結び付けるには、グループ化されたテストをファイルに保存してから、そのファイルをテスト ランナーに渡します。

```shell
circleci tests glob "test/**/*.rb" | circleci tests split > /tmp/tests-to-run
bundle exec rspec $(cat /tmp/tests-to-run)
```

ファイル `/tmp/tests-to-run` の内容は、`$CIRCLE_NODE_INDEX` と `$CIRCLE_NODE_TOTAL` に応じて、コンテナごとに異なる値を持ちます。

## Python Django テストでのテスト分割の使用
{: #using-test-splitting-with-python-django-tests }

CircleCI でテスト分割を活用するには、実行するテストの一覧を渡す必要があります。 しかし、Django を使用する場合、テストの実行方法によっては、テストをグロブして渡すことができません。

独自のユースケースに合わせたテスト分割では、問題が発生することがあります。 Python Django でテスト分割を行えない問題については、\[こちらの Discuss の記事\] (https://discuss.circleci.com/t/python-django-tests-not-being-split-correctly/36624) に解決例が示されています。

以下に、この例を使用してテスト分割を行う簡単な例を示します。
```yml
- run:
    command: |
      # __init__ ファイルを除外してテストファイルを取得
      TESTFILES=$(circleci tests glob "catalog/tests/*.py" | sed 's/\S\+__init__.py//g')
      echo $TESTFILES | tr ' ' '\n' | sort | uniq > circleci_test_files.txt
      cat circleci_test_files.txt
      TESTFILES=$(circleci tests split --split-by=timings circleci_test_files.txt)
      # manage.py テストに合わせた形式にファイルパスを変更
      TESTFILES=$(echo $TESTFILES | tr "/" "." | sed 's/.py//g')
      echo $TESTFILES
      pipenv run python manage.py test --verbosity=2 $TESTFILES
```

## その他のテスト分割方法
{: #using-test-splitting-with-pytest }

pytest で複数のコンテナにテストを分割しようとすると、以下のいずれかのエラーが発生することがあります。

```
No timing found for "tests/commands/__init__.py"
No timing found for "tests/commands/test_1.py"
No timing found for "tests/commands/test_2.py"
```

これらのエラーのいずれかが返された場合は、以下に示すような多少の調整が必要です。

### カスタムの working_directory を設定している場合
{: #are-you-setting-a-custom-working-directory? }

この場合は、テストメタデータの XML ファイルに保存するファイルパスを調整してみてください。 または、可能であれば、コンテナの標準作業ディレクトリを使用して、エラーを解決できるかどうか試してください。 具体的には、テスト実行ジョブに含まれる `working_directory` をすべて削除します。

### `pytest.ini` の場所を確認する
{: #where-does-your-pytest-ini-live }

テスト分割を正しく行うには、ルートディレクトリでテストを実行する必要があります。 テストの実行場所がルートディレクトリではない場合、`run` コマンドをテストする前に以下のコマンドを実行してみてください。

```shell
cp -f .circleci/resources/pytest_build_config.ini pytest.ini
```

`.circleci/resources/pytest_build_config.ini` パスは、プロジェクト内でこのファイルが実際に置かれている場所に合わせて置き換えてください。

### pytest.ini に junit_family を設定している場合
{: #are-you-setting-the-junit-family-in-your-pytest-ini }

pytest.ini ファイルに `junit_family=legacy` のような設定があるかどうかを確認してください。 `junit_family` の設定方法については、[こちら](https://docs.pytest.org/en/stable/_modules/_pytest/junitxml.html)のページを参照してください。

上記ページの該当箇所は、"families" で検索すると確認できます。

### タイミング基準で正しく分割するサンプルプロジェクト
{: #example-project-that-correctly-splits-by-timing }

以下に、テストの分割方法を紹介する [`sample-python-cfd` プロジェクト](https://github.com/CircleCI-Public/sample-python-cfd)からフォークしたサンプルを示します。

```yml
version: 2.1
orbs:
  python: circleci/python@1.2
jobs:
  build-and-test:
    parallelism: 2
    docker:
      - image: cimg/python:3.8
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: テストの実行
          command: |
            set -e
            TEST_FILES=$(circleci tests glob "openapi_server/**/test_*.py" | circleci tests split --split-by=timings)
            mkdir -p test-results
            pytest --verbose --junitxml=test-results/junit.xml $TEST_FILES
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
workflows:
  sample:
    jobs:
      - build-and-test
```

テスト分割を適切に行うビルドのサンプルについては、[こちら](https://app.circleci.com/pipelines/github/nbialostosky/sample-python-cfd/18/workflows/8b37bd45-ed19-42e1-8cc4-44401697f3fc/jobs/20)をご覧ください。

### ビデオ: グロブのトラブルシューティング
{: #video-troubleshooting-globbing }
{:.no_toc}

注: 以下のビデオで使われているコマンドを実際に使用するには、[`ジョブに SSH で接続`]({{ site.baseurl }}/2.0/ssh-access-jobs/)する必要があります。

<iframe width="854" height="480" src="https://www.youtube.com/embed/fq-on5AUinE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>

## 関連項目
{: #see-also }

[コンテナを使用する]({{ site.baseurl }}/2.0/containers/)

## その他のテスト分割方法
{: #other-ways-to-split-tests }

一部のサードパーティのアプリケーションやライブラリでも、テストスイートの分割がサポートされています。 これらのアプリケーションは、CircleCI では開発およびサポートが行われていません。 CircleCI でこれらのアプリケーションを使用して問題が発生した場合は、オーナーに確認してください。 問題が解決しない場合は、CircleCI のフォーラム「[CircleCI Discuss](https://discuss.circleci.com/)」で対処方法を検索するか、質問してみてください。

- **[Knapsack Pro](https://knapsackpro.com)**: 並列 CI ノード間でテストを動的に割り当て、テストスイートの実行を高速化します。 CI のビルド時間への効果は[こちらのグラフ](https://docs.knapsackpro.com/2018/improve-circleci-parallelisation-for-rspec-minitest-cypress)でご確認ください。

- **[phpunit-finder](https://github.com/previousnext/phpunit-finder)**: `phpunit.xml` ファイルに対してクエリを行い、テストファイル名の一覧を取得して出力するヘルパー CLI ツールです。 テストを分割して CI ツールのタイミングに基づいて並列に実行する場合に、このツールを使用すると便利です。
- **[go list](https://golang.org/cmd/go/#hdr-List_packages_or_modules)**: Golang パッケージをグロブするには、組み込みの Go コマンド `go list ./...` を使用します。 これにより、パッケージテストを複数のコンテナに分割できます。

  ```shell
  go test -v $(go list ./... | circleci tests split)
  ```
