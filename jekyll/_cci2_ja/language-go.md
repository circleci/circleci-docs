---
layout: classic-docs
title: "言語ガイド: Go"
short-title: "Go"
description: "CircleCI 2.0 での Go (Golang) を使用したビルドとテスト"
categories:
  - language-guides
order: 3
version:
  - Cloud
  - Server v2.x
---

CircleCI では、Docker イメージにインストール可能な任意のバージョンの Go を使用して、Go プロジェクトをビルドできます。 お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

* 目次
{:toc}

## クイック スタート: デモ用の Go リファレンス プロジェクト
{: #quickstart-demo-go-reference-project }

CircleCI 2.0 でのビルド方法を示すために、Go リファレンス プロジェクトを提供しています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">GitHub 上の Go デモ プロジェクト</a>
- [CircleCI でビルドされた Go デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 この設定ファイルは、Go プロジェクトで CircleCI 2.0 を使用するためのベスト プラクティスを示しています。


## 設定ファイルの例
{: #sample-configuration }

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
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
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

変更をローカルでテストする場合は、[CircleCI の CLI ツール](https://circleci.com/ja/docs/2.0/local-jobs/)を使用して `circleci build` を実行します。

---

## 設定ファイルの詳細
{: #config-walkthrough }

このセクションでは、`.circleci/config.yml` 内のコマンドについて説明します。

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 If we do not use workflows and have only one job, it must be named `build`. Below, our job specifies to use the `docker` executor as well as the CircleCI created docker-image for golang 1.12. Next, we use a *secondary image* so that our job can also make use of Postgres. Finally, we use the `environment` key to specify environment variables for the Postgres container.


```yaml
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test
```

Docker をセットアップしたら、テスト結果のパスを格納しておく環境変数を設定します。 Note, this environment variable is set for the entirety of the _job_ whereas the environment variables set for `POSTGRES_USER` and `POSTGRES_DB` are specifically for the Postgres container.

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

Next we create a directory for collecting test results

```yaml
      - run: mkdir -p $TEST_RESULTS
```

その後、キャッシュをリストアします (存在する場合)。 初回実行時にはこの処理は実行されません。

{% raw %}
```yaml
      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}
```
{% endraw %}

JUnit レポート作成ツールの Go 実装とアプリケーションの他の依存関係をインストールします。 これらは、プライマリ コンテナにプリインストールしておくと便利です。

両方のコンテナ (プライマリと Postgres) が同時に起動されます。 Postgres, however, may require some time to get ready. ただし、Postgres の準備には少し時間がかかるため、その前にテストが開始するとジョブが失敗します。 このため、依存サービスが準備できるまで待機することをお勧めします。 ここでは Postgres のみを使用するため、以下のようにステップを追加します。

```yaml
      - run:
          name: Waiting for Postgres to be ready
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

The command for running unit tests is more complicated than some of our other steps. Here we are using \[test splitting\]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#splitting-test-files) to allocate resources across parallel containers. Test splitting can help speed up your pipeline if your project has a large test suite.

Next we run our actual build command using `make` - the Go sample project uses make to run build commands. `make` を使用してプロジェクトの依存関係をプルおよびビルドしたら、ビルドされたパッケージをキャッシュに保存します。

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build
```


Now we will start the Postgres dependent service, using `curl` to ping it to validate that the service is up and running.

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

If all went well, the service ran and successfully responded to the post request at `localhost:8080`.

最後に、テスト結果を保存するパスを指定します。 The `store_test_results` step allows you to leverage insights to view how your test results are doing over time, while using the `store_artifacts` step allows you to upload any type of file; in this case, also the test logs if one would like to inspect them manually.

```yaml
      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
```


Finally, we specify the workflow block. This is not mandatory (as we only have one job to sequence) but it is recommended.

```yaml

workflows:
  version: 2
  build-workflow: # the name of our workflow
    jobs: # the jobs that we are sequencing.
      - build
```

完了です。 これで Go アプリケーション用に CircleCI 2.0 を構成できました。 CircleCI でビルドを行うとどのように表示されるかについては、[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}を参照してください。

## 関連項目
{: #see-also }

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

How to use [workflows]({{ site.baseurl }}/2.0/workflows), which are particularly useful for optimizing your pipelines and orchestrating more complex projects.

キャッシュの活用方法については、「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」を参照してください。
