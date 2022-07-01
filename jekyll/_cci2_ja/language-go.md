---
layout: classic-docs
title: "言語ガイド: Go"
short-title: "Go"
description: "CircleCI  での Go (Golang) を使用したビルドとテスト"
categories:
  - language-guides
order: 3
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI では、Docker イメージにインストール可能な任意のバージョンの Go を使用して、Go プロジェクトをビルドできます。 お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

* 目次
{:toc}

## クイック スタート: デモ用の Go リファレンス プロジェクト
{: #quickstart-demo-go-reference-project }

CircleCI でのビルド方法を示すために、Go リファレンスプロジェクトを提供しています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">GitHub 上の Go デモ プロジェクト</a>
- [CircleCI でビルドされた Go デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 この設定ファイルは、Go プロジェクトで CircleCI を使用するためのベスト プラクティスを示しています。


## 設定ファイルの例
{: #sample-configuration }

{% raw %}

```yaml
version: 2
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    parallelism: 2

    environment: # environment variables for the build itself
      TEST_RESULTS: /tmp/test-results # path to where test results will be saved

    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      - run: mkdir -p $TEST_RESULTS # create the test results directory

      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}

      #  Wait for Postgres to be ready before proceeding
      - run:
          name: Waiting for Postgres to be ready
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: Run unit tests
          environment: # environment variables for the database url and path to migration files
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations

          # store the results of our tests in the $TEST_RESULTS directory
          command: |
            PACKAGE_NAMES=$(go list ./... | circleci tests split --split-by=timings --timings-type=classname)
            gotestsum --junitfile ${TEST_RESULTS}/gotestsum-report.xml -- $PACKAGE_NAMES

      - run: make # pull and build dependencies for the project

      - save_cache:
          key: go-mod-v4-{{ checksum "go.sum" }}
          paths:
            - "/go/pkg/mod"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts

      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
workflows:
  version: 2
  build-workflow:
    jobs:
      - build
```

{% endraw %}

### CircleCI のビルド済み Docker イメージ
{: #pre-built-circleci-docker-images }
{:.no_toc}

CircleCI のビルド済みイメージを使用することをお勧めします。 このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/golang/>) から必要なバージョンを選択できます。 デモ プロジェクトでは、公式 CircleCI イメージを使用しています。

### デモ プロジェクトのビルド
{: #build-the-demo-project-yourself }
{:.no_toc}

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用して <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Go デモ プロジェクト</a>をビルドする方法を示します。

1. お使いのアカウントに、GitHub 上の <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Go デモ プロジェクト</a>をフォークします。
2. CircleCI アプリケーションの[プロジェクトダッシュボード](https://app.circleci.com/projects/){:rel="nofollow"}に行き、フォークしたプロジェクトの隣にある**[Follow Project (プロジェクトをフォローする)]**ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

変更をローカルでテストする場合は、[CircleCI の CLI ツール]({{site.baseurl}}/ja/2.0/local-cli/)を使用して `circleci build` を実行します。

---

## 設定ファイルの詳細
{: #config-walkthrough }

このセクションでは、`.circleci/config.yml` 内のコマンドについて説明します。

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 ワークフローを使用せず、ジョブが 1 つしかない場合は、 `build` という名前にする必要があります。 下記では、ジョブが `docker` Executor を CircleCI 製の golang 1.12 用 Docker イメージを使用するように指定されています。 次に、*セカンダリイメージ* を使って Postgres を使用できるようにします。 最後に、`environment` キーを使って Postgres コンテナの環境変数を指定します。


```yaml
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: cimg/postgres:9.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test
```

Docker をセットアップしたら、テスト結果のパスを格納しておく環境変数を設定します。 この環境変数は _ジョブ_ 全体に設定されますが、`POSTGRES_USER` と `POSTGRES_DB` に設定される環境変数は Postgres コンテナ専用です。

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

`build` ジョブ内にいくつかの `steps` を追加します。 ジョブの大半を占めるのがステップです。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。

```yaml
    steps:
      - checkout
```

次に、テスト結果を収集するためのディレクトリを作成します。

```yaml
      - run: mkdir -p $TEST_RESULTS
```

その後、キャッシュをプルダウンします (存在する場合)。 初回実行時にはこの処理は実行されません。

{% raw %}
```yaml
      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}
```
{% endraw %}

JUnit レポート作成ツールの Go 実装とアプリケーションの他の依存関係をインストールします。 これらは、プライマリ コンテナにプリインストールしておくと便利です。

両方のコンテナ (プライマリと Postgres) が同時に起動されます。 ただし、Postgres の準備には少し時間がかかるため、 その前にテストが開始するとジョブが失敗します。 このため、依存サービスが準備できるまで待機することをお勧めします。 ここでは Postgres のみを使用するため、以下のようにステップを追加します。

```yaml
      - run:
          name: Postgres が準備できるまで待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
```

次はテストの実行です。 そのためには、データベースの URL と DB 移行ファイルのパスを指定する環境変数を設定する必要があります。 このステップには、以下のようにいくつかの追加コマンドを記述します。

{% raw %}
```yaml
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: |
            PACKAGE_NAMES=$(go list ./... | circleci tests split --split-by=timings --timings-type=classname)
            gotestsum --junitfile ${TEST_RESULTS}/gotestsum-report.xml -- $PACKAGE_NAMES
```
{% endraw %}

単体テスト実行用のコマンドは、他のコマンドより複雑です。 ここでは、 \[テスト分割\]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/#splitting-test-files)  を使用して、リソースを並列コンテナに割り当てます。 プロジェクトに大規模なテストスイートがある場合、テスト分割機能を使うとパイプラインを高速化できます。

次に、`make` を使って実際のビルドコマンドを実行します。サンプルの Go プロジェクトでは、ビルドを作成し実行するコマンドを使用しています。 このビルドが新しい依存関係でプルする場合、 `save_cache` ステップでその依存関係をキャッシュします。

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build
```


次に、Postgres 依存サービスを起動します。`curl` を使って Ping し、サービスが起動して実行されていることを確認します。

{% raw %}
```yaml
      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts
```
{% endraw %}

すべて成功すると、サービスは実行され、`localhost:8080` の Post 要求に正常に応答します。

最後に、テスト結果を保存するパスを指定します。 `store_test_results` ステップにより、Insights を使ってテスト結果の推移が確認でき、`store_artifacts` ステップにより、すべてのタイプのファイルを、手動で確認したい場合はテストログをアップロードすることができます。

```yaml
      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
```


最後に、ワークフローブロックを指定します。 これは必須ではありません (順序付けされるジョブは 1 つだけなので) が、推奨されます。

```yaml

workflows:
  version: 2
  build-workflow: # the name of our workflow
    jobs: # the jobs that we are sequencing.
      - build
```

完了です。 これで Go アプリケーション用に CircleCI  を設定できました。 CircleCI でビルドを行うとどのように表示されるかについては、[ジョブページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"} を参照してください。

## 関連項目
{: #see-also }

デプロイターゲットの設定例については、[デプロイターゲットの設定例]({{ site.baseurl }}/ja/2.0/deployment-integrations/)を参照してください。

[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows)の使用方法: 特にパイプラインの最適化やより複雑なプロジェクトのオーケストレーションをする際に役立ちます。

キャッシュの活用方法については、[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。
