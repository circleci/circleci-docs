---
layout: classic-docs
title: "言語ガイド: Go"
short-title: "Go"
description: "CircleCI 2.0 での Go (Golang) を使用したビルドとテスト"
categories:
  - language-guides
order: 3
---

CircleCI では、Docker イメージにインストール可能な任意のバージョンの Go を使用して、Go プロジェクトをビルドできます。 お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

- 目次
{:toc}

## クイック スタート: デモ用の Go リファレンス プロジェクト

CircleCI 2.0 でのビルド方法を示すために、Go リファレンス プロジェクトを提供しています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">GitHub 上の Go デモ プロジェクト</a>
- [CircleCI でビルドされた Go デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 この設定ファイルは、Go プロジェクトで CircleCI 2.0 を使用するためのベスト プラクティスを示しています。

## 設定ファイルの例

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.12 #
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    environment: # environment variables for the build itself
      TEST_RESULTS: /tmp/test-results # path to where test results will be saved

    steps: # steps that comprise the `build` job

      - checkout # check out source code to working directory
      - run: mkdir -p $TEST_RESULTS # create the test results directory

      - restore_cache: # restores saved cache if no changes are detected since last run
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:
            - v1-pkg-cache

      # Normally, this step would be in a custom primary image;
      # we've added it here for the sake of explanation.

      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      #  CircleCi's Go Docker image includes netcat
      #  This allows polling the DB port to confirm it is open before proceeding

      - run:
          name: Waiting for Postgres to be ready
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres && exit 1

      - run:
          name: Run unit tests
          environment: # environment variables for the database url and path to migration files
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          # Store the results of our tests in the $TEST_RESULTS directory
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out

      - run: make # pull and build dependencies for the project

      - save_cache: # Store cache in the /go/pkg directory
          key: v1-pkg-cache
          paths:
            - "/go/pkg"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts

      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: /tmp/test-results
```

{% endraw %}

### CircleCI のビルド済み Docker イメージ
{:.no_toc}

CircleCI のビルド済みイメージを使用することをお勧めします。このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/golang/>) から必要なバージョンを選択できます。 デモ プロジェクトでは、公式 CircleCI イメージを使用しています。

### デモ プロジェクトのビルド
{:.no_toc}

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用して <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Go デモ プロジェクト</a>をビルドする方法を示します。

1. お使いのアカウントに、GitHub 上の <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Go デモ プロジェクト</a>をフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

変更をローカルでテストする場合は、[CircleCI の CLI ツール](https://circleci.com/ja/docs/2.0/local-jobs/)を使用して `circleci build` を実行します。

* * *

## 設定ファイルの詳細

このセクションでは、`.circleci/config.yml` 内のコマンドについて説明します。

`config.yml` は必ず [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 どの設定ファイルにも「build」ジョブを含める必要があります。 これが、CircleCI によって自動的に選択され実行される唯一のジョブです。

ジョブの中で、`working_directory` を指定します。 Go では、[Go Workspace](https://golang.org/doc/code.html#Workspaces) の構造が厳密に定められているため、その要件を満たすパスを指定する必要があります。

```yaml
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go
```

他のディレクトリを指定しない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとなります。

`working_directory` のすぐ下の `docker` で、このジョブの[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)のイメージを指定します。

```yaml
    docker:
      - image: circleci/golang:1.12
```

このデモで使用するカスタム イメージは `golang:1.12.0` に基づいており、`netcat` も含まれます (後で使用します)。

さらに、PostgreSQL のイメージを使用し、データベース初期化用の 2 つの環境変数を指定します。

```yaml
      - image: circleci/postgres:9.6-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

Docker をセットアップしたら、テスト結果のパスを格納しておく環境変数を設定します。

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

`build` ジョブ内にいくつかの `steps` を追加します。

[`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

```yaml
    steps:
      - checkout
```

次に、テスト結果を収集するためのディレクトリを作成します。

```yaml
      - run: mkdir -p $TEST_RESULTS
```

その後、キャッシュをプルダウンします (存在する場合)。 初回実行時にはこの処理は実行されません。

```yaml
      - restore_cache:
          keys:
            - v1-pkg-cache
```

JUnit レポート作成ツールの Go 実装とアプリケーションの他の依存関係をインストールします。 これらは、プライマリ コンテナにプリインストールしておくと便利です。

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

次はテストの実行です。 そのためには、データベースの URL と DB 移行ファイルのパスを指定する環境変数を設定する必要があります。 このステップには、以下のようにいくつかの追加コマンドを記述します。

```yaml
      - run:
          name: 単体テストの実行
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
```

このプロジェクトでは、`make` を使用してビルドとテストを行っているため、`make test` を実行するだけです (`Makefile` の内容は[こちらのページ](https://github.com/CircleCI-Public/circleci-demo-go/blob/master/Makefile)で参照)。 テスト結果を収集してからアップロードするために、ここでは `go-junit-report` を使用します (テスト結果の詳細については[プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)を参照)。

```bash
make test | go-junit-report > ${TEST_RESULTS}/go-test-report.xml
```

上記の場合、`make test` からの出力は、`stdout` に表示されることなく、すべて `go-junit-report` に直接渡されます。 その問題を解決するには、`tee` と `trap` という、2 つの Unix 標準コマンドを使用します。 1 つ目のコマンドを使用すると、出力を `stdout` または別の場所に複製することができます (詳細については[こちらのページ](http://man7.org/linux/man-pages/man1/tee.1.html)を参照)。 2 つめのコマンドを使用すると、スクリプトの終了時に実行するコマンドを指定できます (詳細については[こちらのページ](http://man7.org/linux/man-pages/man1/trap.1p.html)を参照)。 つまり、以下のような記述になります。

```bash
trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
make test | tee ${TEST_RESULTS}/go-test.out
```

これで、単体テストが正常に終了したことを確認できるようになります。正常に終了したら、サービスを開始し、稼働しているかどうかをバリデーションします。

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build

      - run:
          name: サービスの開始
          environment:
            CONTACTS_DB_URL: "postgres://root@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: サービスが稼働していることのバリデーション
          command: curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

`make` を使用してプロジェクトの依存関係をプルおよびビルドしたら、ビルドされたパッケージをキャッシュに保存します。 この方法で Go プロジェクトの依存関係をキャッシュすることをお勧めします。

サービスを開始するには、最初にそれをビルドする必要があります。 その後、テスト ステップで使用したものと同じ環境変数を使用して、サービスを開始します。 `background: true` でサービスの実行を継続し、次のステップに進みます。`curl` を使用して、サービスが正常に開始されたことと、サービスがリクエストに応答していることをバリデーションします。

最後に、テスト結果を保存するパスを指定します。

```yaml
      - store_test_results:
          path: /tmp/test-results
```

完了です。 これで Go アプリケーション用に CircleCI 2.0 を構成できました。CircleCI でビルドを行うとどのように表示されるかについては、[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}を参照してください。

## 関連項目

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。

キャッシュの活用方法については、「[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)」を参照してください。