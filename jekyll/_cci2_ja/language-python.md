---
layout: classic-docs
title: "CircleCI での Python アプリケーションの構成"
short-title: "Python"
description: "CircleCI 上での Python による継続的インテグレーション"
categories:
  - language-guides
order: 7
version:
  - Cloud
  - Server v2.x
---

ここでは、Python で記述されたサンプル アプリケーションを参考に、CircleCI を構成する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }

このガイドでは、Django サンプル アプリケーションを使用しながら、CircleCI 上で Python アプリケーションをビルドする場合の構成のベスト プラクティスについて説明します。 このアプリケーションは [GitHub 上でホスティング](https://github.com/CircleCI-Public/circleci-demo-python-django)され、[CircleCI 上でビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}されます。

このガイドに沿って、[リポジトリをフォーク](https://help.github.com/articles/fork-a-repo/)し、[設定ファイル](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml)を記述してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### バージョンの指定
{: #specify-a-version }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

### ビルド ジョブの作成
{: #create-a-build-job }

実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

```yaml
version: 2
jobs:
  build:  # ワークフローを使用しない実行に必要です
    working_directory: ~/circleci-demo-python-django
```

### Executor タイプの選択
ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 最初に記述したイメージが、ジョブの[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)になります。 ジョブのすべてのコマンドがこのコンテナで実行されます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4  # ビルド ジョブのプライマリ コンテナ
```

**メモ:** `circleci/python:3.6.4` は、CircleCI が提供する[コンビニエンス イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)です。 これらのイメージは正式な Docker イメージの拡張版で、CI/CD 環境にとって便利なツールが含まれます。

### 他サービスの追加と環境変数の設定
{: #add-other-services-and-set-environment-variables }

データベースなどのサービス用の追加コンテナを指定します。 [`environment`]({{ site.baseurl }}/ja/2.0/env-vars/#コンテナでの環境変数の設定) キーを使用して、コンテナ内のすべてのコマンドで使用される環境変数を設定します。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4 # every job must define an image for the docker executor and subsequent jobs may define a different image.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2 # an example of how to specify a service container
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

### 依存関係のインストール
{: #install-dependencies }

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

[`run`]({{ site.baseurl }}/ja/2.0/configuration-reference/#run) ステップを使用して、bash コマンドを実行します。 この例では、[Pipenv](https://pipenv.readthedocs.io/en/latest/) を使用して仮想環境を作成し、Python パッケージをインストールします。

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      - checkout  # ソース コードを作業ディレクトリにチェックアウトします
      - run:
          command: |  # Pipenv を使用して依存関係をインストールします
            sudo pip install pipenv
            pipenv install
```

### 依存関係のキャッシュ
{: #cache-dependencies }

[`store_artifacts`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) ステップを使用して、テスト結果をアーティファクトとして保存します。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、仮想環境とインストールされたパッケージがキャッシュされます。

実行の間隔を短縮するには、[依存関係またはソース コードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

**メモ:** `chown` コマンドを使用して、依存関係の場所へのアクセスを CircleCI に許可します。

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      - checkout
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:  # このステップは依存関係をインストールする*前*に実行します
          key: deps9-{% raw %}{{ .Branch }}-{{ checksum "Pipfile.lock" }}{% endraw %}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache:
          key: deps9-{% raw %}{{ .Branch }}-{{ checksum "Pipfile.lock" }}{% endraw %}
          paths:
            - ".venv"
            - "/usr/local/bin"
            - "/usr/local/lib/python3.6/site-packages"
```

`run` ステップを使用して、テスト スイートを実行します。

Use the `run` step to run your test suite.

### テストの実行
{: #run-tests }

Use the `run` step to run your test suite.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - run:
        command: |
          pipenv run python manage.py test
```

### テスト結果のアップロードおよび保存
{: #upload-and-store-test-results }

[`store_test_results`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_test_results) ステップを使用して、テスト結果を CircleCI にアップロードします。 この結果は、CircleCI アプリケーションの**テスト サマリー**セクションに表示されます。

Use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step to save test results as artifacts.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
          destination: tr1
```

### アプリケーションのデプロイ
{: #deploy-application }

この Django アプリケーションはどこにもデプロイされません。 デプロイの例については、[Flask を使用したプロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)または[デプロイに関するドキュメント]({{ site.baseurl }}/ja/2.0/deployment-integrations/)を参照してください。

## 設定ファイルの全文
{: #full-configuration-file }

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # A basic unit of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    # directory where steps are run
    working_directory: ~/circleci-demo-python-django
    docker: # run the steps with Docker
      # CircleCI Python images available at: https://hub.docker.com/r/circleci/python/
      - image: circleci/python:3.6.4
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for primary container
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # environment variables for the Postgres container.
          version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4 # 各ジョブで Docker Executor のイメージを定義する必要があり、後続のジョブでは別のイメージを定義できます
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2 # サービス コンテナの指定方法を示す例
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
        POSTGRES_USER: root
          POSTGRES_DB: circle_test
    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: deps9-{% raw %}{{ .Branch }}-{{ checksum "Pipfile.lock" }}{% endraw %}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache: # cache Python dependencies using checksum of Pipfile as the cache-key
          key: deps9-{% raw %} {{ .Branch }}-{{ checksum "Pipfile.lock" }}{% endraw %}
          paths:
            - "venv"
      - run:
          command: |
            pipenv run python manage.py test
      - store_test_results: # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test-results
      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: test-results
          destination: tr1
```

{% endraw %}

## 関連項目
{: #see-also }

- 他の言語ガイドについては、「[チュートリアル]({{ site.baseurl }}/2.0/tutorials/)」を参照してください。
