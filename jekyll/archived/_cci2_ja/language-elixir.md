---
layout: classic-docs
title: "言語ガイド: Elixir"
short-title: "Elixir"
description: "Elixir プロジェクトの概要と構成例"
categories:
  - language-guides
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

これは、単純な Phoenix Web アプリケーション用の注釈付き `config.yml` で、<https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix> から入手できます。

お急ぎの場合は、以下の構成をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーしてください。 お急ぎでなければ、全体に目を通し、十分に理解を深めることをお勧めします。

## 設定ファイルの例
{: #sample-configuration }

{:.tab.switch_one.Cloud}
{% raw %}

```yaml
version: 2.1 

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: {{site.baseurl}}/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: {{site.baseurl}}/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

{:.tab.switch_one.Server_3}
{% raw %}

```yaml
version: 2.1 

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: https://circleci.com/docs/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

{:.tab.switch_one.Server_2}
{% raw %}

```yaml
version: 2

jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job
    docker:  # run the steps with Docker
      - image: cimg/elixir:1.13.1  # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: cimg/postgres:10.1  # database image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store mix cache
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload junit test results for display in Test Summary
          # Read more: https://circleci.com/docs/2.0/collect-test-data/
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # Replace with the name of your :app
```
{% endraw %}

## 設定ファイルの詳細
{: #config-walkthrough }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2.1
```

実行実行は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-intro/) という仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 [CircleCI 提供の Elixir Docker イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#elixir)を使用します。

```yaml
jobs:
  build:
    parallelism: 1
    docker:
      - image: cimg/elixir:1.7.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MIX_ENV: test
      - image: cimg/postgres:10.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app
```


ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

[`run`]({{ site.baseurl }}/ja/2.0/configuration-reference/#run) ステップを使用して、コマンドを実行します。 この例では [Mix](https://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html) を使用して Elixir ツールをインストールします。

```yaml
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar --force
```

実行の間隔を短縮するには、[依存関係またはソース コードのキャッシュ]({{ site.baseurl }}/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、仮想環境とインストールされたパッケージがキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}
```yaml
      - restore_cache:
          keys:
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile
      - save_cache:
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
```
{% endraw %}

最後に、データベースがオンラインになるまで待ち、テスト スイートを実行します。 テストの実行後、CircleCI Web アプリで使用できるようにテスト結果をアップロードします。

```yaml
      - run:
          name: DB の待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run: mix test
      - store_test_results:
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME
```

## 並列実行
{: #parallelism }

**Splitting by Timings**

As of version 2.0, CircleCI requires users to upload their own JUnit XML [test output]({{site.baseurl}}/2.0/collect-test-data/#enabling-formatters). Currently the main/only Elixir library that produces that output is [JUnitFormatter](https://github.com/victorolinasc/junit-formatter).

In order to allow CircleCI's parallelization to use the `--split-by=timings` strategy with the XML output, you need to configure JUnitFormatter with the `include_filename?: true` option which will add the filename to the XML.

By default, JUnitFormatter saves the output to the `_build/test/lib/<application name>` directory, so in your `.circleci/config.yml` you will want to configure the `store_test_results` step to point to that same directory:

```yml 
  - store_test_results:
      path: _build/test/lib/<application name>
```

However, JUnitFormatter also allows you to configure the directory where the results are saved via the `report_dir` setting, in which case, the `path` value in your CircleCI config should match the relative path of wherever you're storing the output.

## 関連項目
{: #see-also }

[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/) [データベースの構成]({{ site.baseurl }}/ja/2.0/databases/)
