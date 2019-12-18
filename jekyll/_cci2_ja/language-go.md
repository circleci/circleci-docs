---
layout: classic-docs
title: "言語ガイド：Go"
short-title: "Go"
description: "CircleCI 2.0 での Go (Golang) を使用したビルドとテスト"
categories:
  - language-guides
order: 3
---

CircleCI では、Docker イメージにインストール可能な任意のバージョンの Go を使用して、Go プロジェクトをビルドできます。 お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーし、ビルドを開始してください。

- 目次
{:toc}

## クイックスタート：デモ用の Goリファレンスプロジェクト

CircleCI 2.0 でのビルド方法を示すために、Go リファレンスプロジェクトを提供しています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">GitHub 上の Go デモプロジェクト</a>
- [CircleCI でビルドされた Go デモプロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、Go プロジェクトで CircleCI 2.0 を使用するためのベストプラクティスを示しています。

## 設定例

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 1回の実行の基本作業単位
  build: # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要
    docker: # Docker でステップを実行します
      # CircleCI Go イメージは https://hub.docker.com/r/circleci/golang/ で入手できます
      - image: circleci/golang:1.8 #
      # CircleCI PostgreSQL イメージは https://hub.docker.com/r/circleci/postgres/ で入手できます
      - image: circleci/postgres:9.6-alpine
        environment: # プライマリコンテナの環境変数
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test
    # ステップが実行されるディレクトリ。 パスは Go Workspace の要件に従う必要があります
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go

    environment: # ビルド自体のための環境変数
      TEST_RESULTS: /tmp/test-results # テスト結果を保存する場所のパス

    steps: # `build` ジョブを構成するステップ

      - checkout # ソースコードを作業ディレクトリにチェックアウトします
      - run: mkdir -p $TEST_RESULTS # テスト結果を保存するディレクトリを作成します

      - restore_cache: # 前回の実行以降の変更が検出されなかった場合、保存されているキャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          keys:
            - v1-pkg-cache

      # 通常、このステップはカスタムプライマリイメージにあります
      # この例では、説明のためにここにステップを追加しました

      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      #  CircleCi の Go Docker イメージには netcat が含まれています
      #  このため、DB ポートをポーリングして、ポートが開放されていることを確認してから処理を続行できます

      - run:
          name: Postgres が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres && exit 1

      - run:
          name: 単体テストを実行
          environment: # データベース URL と移行ファイルのパスのための環境変数
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          # テスト結果を $TEST_RESULTS ディレクトリに保存します
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out

      - run: make # プロジェクトの依存関係をプルしてビルドします

      - save_cache: # キャッシュを /go/pkg ディレクトリに保存します
          key: v1-pkg-cache
          paths:
            - "/go/pkg"

      - run:
          name: サービスを開始
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true # サービスを実行したまま次のステップに進みます

      - run:
          name: サービスが稼働中であることをバリデーション
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts

      - store_artifacts: # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するテストサマリーをアップロードします
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # テストサマリー (https://circleci.com/docs/ja/2.0/collect-test-data/) に表示するテスト結果をアップロードします
          path: /tmp/test-results
```

{% endraw %}

### CircleCI のビルド済み Docker イメージ

{:.no_toc}

CircleCI のビルド済みイメージを使用することをお勧めします。このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/golang/>) から必要なバージョンを選択できます。 デモプロジェクトでは、公式 CircleCI イメージを使用しています。

### デモプロジェクトのビルド

{:.no_toc}

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモプロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

変更をローカルでテストする場合は、[CircleCI の CLI ツール](https://circleci.com/docs/ja/2.0/local-jobs/)を使用して `circleci build` を実行します。

* * *

## 設定の詳細

このセクションでは、`.circleci/config.yml` 内のコマンドについて説明します。

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2
```

次に、`jobs` キーを置きます。 どのコンフィグファイルにも「build」ジョブを含める必要があります。 これが、CircleCI によって自動的に選択され実行される唯一のジョブです。

このジョブで、`working_directory` を指定します。 Go では、[Go Workspace](https://golang.org/doc/code.html#Workspaces) の構造が厳密に定められているため、その要件を満たすパスを指定する必要があります。

```yaml
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go
```

他のディレクトリが指定されない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとして使用されます。

`working_directory` のすぐ下の `docker` で、このジョブの[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)イメージを指定します。

```yaml
    docker:
      - image: circleci/golang:1.8
```

ここで使用するカスタムイメージは `golang:1.8.0` に基づいており、`netcat` も含まれます (後で使用します)。

さらに、PostgreSQL のイメージを使用し、データベースの初期化に使用する 2つの環境変数を指定します。

```yaml
      - image: circleci/postgres:9.4.12-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

Docker を設定したら、テスト結果のパスを保存する環境変数を設定します。

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

この `build` ジョブ内にいくつかの `steps` を追加する必要があります。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソースコードがチェックアウトされます。

```yaml
    steps:
      - checkout
```

次に、テスト結果を収集するためのディレクトリを作成します。

```yaml
      - run: mkdir -p $TEST_RESULTS
```

その後、キャッシュをプルダウンします (ある場合)。 初回実行時にはこの処理は実行されません。

```yaml
      - restore_cache:
          keys:
            - v1-pkg-cache
```

JUnit レポート作成ツールの Go 実装とアプリケーションの他の依存関係をインストールします。 これらは、プライマリコンテナにプリインストールしておくと便利です。

```yaml
      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report
```

両方のコンテナ (プライマリと Postgres) が同時に起動されます。ただし、Postgres の準備には少し時間がかかるため、その前にテストが開始するとジョブが失敗します。 このため、依存サービスが準備できるまで待機することをお勧めします。 ここでは Postgres のみを使用するため、以下のようにステップを追加します。

```yaml
      - run:
          name: Postgres が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres && exit 1
```

`netcat` が CircleCI Go イメージにインストールされているのはこのためです。 これを使用して、このポートが開放されていることをバリデーションします。

次はテストの実行です。 そのためには、データベースの URL と DB 移行ファイルのパスを指定する環境変数を設定する必要があります。 このステップには、以下のようにいくつかの追加コマンドが必要です。

```yaml
      - run:
          name: 単体テストを実行
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
```

このプロジェクトでは、`make` を使用してビルドとテストを行っているため、`make test` を実行するだけです (`Makefile` の内容は[こちらのページ](https://github.com/CircleCI-Public/circleci-demo-go/blob/master/Makefile)で参照)。 テスト結果を収集して後からアップロードするために、ここでは `go-junit-report` を使用します (テスト結果の詳細については[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)を参照)。

```bash
make test | go-junit-report > ${TEST_RESULTS}/go-test-report.xml
```

この場合、`make test` からの出力は、`stdout` に表示されることなく、すべて `go-junit-report` に直接渡されます。 その問題を解決するには、`tee` と `trap` という、2つの Unix 標準コマンドを使用します。 最初のコマンドを使用すると、出力を `stdout` または別の場所に複製することができます (詳細については[こちらのページ](http://man7.org/linux/man-pages/man1/tee.1.html)を参照)。 2つめのコマンドを使用すると、スクリプトの終了時に実行するコマンドを指定できます (詳細については[こちらのページ](http://man7.org/linux/man-pages/man1/trap.1p.html)を参照)。 つまり、以下のように記述できます。

```bash
trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
make test | tee ${TEST_RESULTS}/go-test.out
```

単体テストが正常に終了したら、サービスを開始し、それが実行中であることをバリデーションします。

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build

      - run:
          name: サービスを開始
          environment:
            CONTACTS_DB_URL: "postgres://root@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: サービスが稼働中であることをバリデーション
          command: curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

`make` を使用してプロジェクトの依存関係をプルおよびビルドしたら、ビルドされたパッケージをキャッシュに保存します。 この方法で Go プロジェクトの依存関係をキャッシュすることをお勧めします。

サービスを開始するには、最初にそれをビルドする必要があります。 その後、テストステップで使用したものと同じ環境変数を使用して、サービスを開始します。 `background: true` を使用してサービスの実行を継続し、次のステップに進みます。このステップで、`curl` を使用して、サービスが正常に開始されたことと、サービスがリクエストに応答していることをバリデーションします。

最後に、テストの結果を保存するパスを指定します。

```yaml
      - store_test_results:
          path: /tmp/test-results
```

完了です。 これで Go アプリケーション用に CircleCI 2.0 を設定できました。CircleCI でビルドを行うとどのように表示されるかについては、[ジョブページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}を参照してください。

## 関連項目

デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

キャッシュの詳細については、「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」を参照してください。
