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
      - image: circleci/golang:1.12
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

次に、`jobs` キーを記述します。 If we do not use workflows and have only one job, it must be named `build`. Below, our job specifies to use the `docker` executor as well as the CircleCI created docker-image for golang 1.12. Next, we use a *secondary image* so that our job can also make use of Postgres. Finally, we use the `environment` key to specify environment variables for the Postgres container.

```yaml
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.12
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

After setting up Docker we will set an environment variable to store the path to our test results. Note, this environment variable is set for the entirety of the *job* whereas the environment variables set for `POSTGRES_USER` and `POSTGRES_DB` are specifically for the Postgres container.

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

Now we need to add several `steps` within the `build` job. Steps make up the bulk of a job.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step to check out source code.

```yaml
    steps:
      - checkout
```

Next we create a directory for collecting test results

```yaml
      - run: mkdir -p $TEST_RESULTS
```

Then we pull down the cache (if present). If this is your first run, this won't do anything.

{% raw %}
```yaml
<br />      - restore_cache: # restores saved cache if no changes are detected since last run
          keys:
            - go-mod-v4-{{ checksum "go.sum" }}
```
{% endraw %}

And install the Go implementation of the JUnit reporting tool and other dependencies for our application. These are good candidates to be pre-installed in primary container.

Both containers (primary and postgres) start simultaneously. Postgres, however, may require some time to get ready. If our tests start before Postgres is available, the job will fail. It is good practice to wait until dependent services are ready; in this example Postgres is the only dependent service.

```yaml
      - run:
          name: Waiting for Postgres to be ready
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
```

Now we run our tests. To do that, we need to set an environment variable for our database's URL and path to the DB migrations files. This step has some additional commands, we'll explain them below.

{% raw %}
```yaml
<br />      - run:
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

Next we run our actual build command using `make` - the Go sample project uses make to run build commands. If this build happens to pull in new dependencies, we will cache them in the `save_cache` step.

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
<br />      - run:
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

Finally, let's specify a path to store the results of the tests. The `store_test_results` step allows you to leverage insights to view how your test results are doing over time, while using the `store_artifacts` step allows you to upload any type of file; in this case, also the test logs if one would like to inspect them manually.

```yaml
      - store_artifacts: # upload test summary for display in Artifacts
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # upload test results for display in Test Summary
          path: /tmp/test-results
```

Finally, we specify the workflow block. This is not mandatory (as we only have one job to sequence) but it is recommended.

```yaml
<br />workflows:
  version: 2
  build-workflow: # the name of our workflow
    jobs: # the jobs that we are sequencing.

      - build
```

完了です。 これで Go アプリケーション用に CircleCI 2.0 を構成できました。CircleCI でビルドを行うとどのように表示されるかについては、[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}を参照してください。

## 関連項目

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。

How to use [workflows]({{ site.baseurl }}/2.0/workflows), which are particularly useful for optimizing your pipelines and orchestrating more complex projects.

Refer to the [Caching Dependencies]({{ site.baseurl }}/2.0/caching/) document for more caching strategies.