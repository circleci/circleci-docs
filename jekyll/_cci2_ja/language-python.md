---
layout: classic-docs
title: "CircleCI での Python アプリケーションの設定"
short-title: "Python"
description: "CircleCI 上での Python による継続的インテグレーション"
categories:
  - language-guides
order: 7
---

ここでは、Python で記述されたサンプルアプリケーションを参考に、CircleCI を設定する方法について説明します。

- 目次
{:toc}

## 概要

このガイドでは、Django サンプルアプリケーションを使用しながら、CircleCI 上で Python アプリケーションをビルドする場合の設定のベストプラクティスについて説明します。 このアプリケーションは [GitHub 上でホスティング](https://github.com/CircleCI-Public/circleci-demo-python-django)され、[CircleCI 上でビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}されます。

このガイドに沿って、[リポジトリをフォーク](https://help.github.com/articles/fork-a-repo/)し、[設定ファイル](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml)を記述してみることをお勧めします。

## 設定の詳細説明

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### バージョンの指定

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2
```

### ビルドジョブの作成

1回の実行は 1つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) を使用していないため、`build` ジョブを持つ必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

```yaml
version: 2
jobs:
  build:  # Workflows を使用しない実行に必要です
    working_directory: ~/circleci-demo-python-django
```

### Executor タイプの選択

ジョブのステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 リストの先頭にあるイメージがジョブの[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)になります。 ジョブのすべてのコマンドは、このコンテナで実行されます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4  # ビルドジョブのプライマリコンテナ
```

**メモ：**`circleci/python:3.6.4` は、CircleCI が提供する[コンビニエンスイメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)です。 これらのイメージは正式な Docker イメージの拡張版で、CI/CD 環境にとって便利なツールが含まれます。

### 他サービスの追加と環境変数の設定

データベースなどのサービス用の追加コンテナを指定します。 [`environment`]({{ site.baseurl }}/ja/2.0/env-vars/#コンテナ内で環境変数を設定する) キーを使用して、コンテナ内のすべてのコマンドで使用される環境変数を設定します。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4 # 各ジョブで Docker Executor のイメージを定義する必要があり、後続のジョブでは別のイメージを定義できます
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2 # サービスコンテナの指定方法を示す例
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

### 依存関係のインストール

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソースコードがチェックアウトされます。

[`run`]({{ site.baseurl }}/ja/2.0/configuration-reference/#run) ステップを使用して、bash コマンドを実行します。 この例では、[Pipenv](https://pipenv.readthedocs.io/en/latest/) を使用して仮想環境を作成し、Python パッケージをインストールします。

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      - checkout  # ソースコードを作業ディレクトリにチェックアウトします
      - run:
          command: |  # Pipenv を使用して依存関係をインストールします
            sudo pip install pipenv
            pipenv install
```

### 依存関係のキャッシュ

実行の間隔を短縮するには、[依存関係またはソースコードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、仮想環境とインストールされたパッケージがキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}

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
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache:
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
          paths:
            - ".venv"
            - "/usr/local/bin"
            - "/usr/local/lib/python3.6/site-packages"
```

{% endraw %}

**メモ：**`chown` コマンドを使用して、依存関係の場所へのアクセスを CircleCI に許可します。

### テストの実行

`run` ステップを使用して、テストスイートを実行します。

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

[`store_test_results`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_test_results) ステップを使用して、テスト結果を CircleCI にアップロードします。 この結果は、CircleCI アプリケーションの**テストサマリー**セクションに表示されます。

[`store_artifacts`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) ステップを使用して、テスト結果をアーティファクトとして保存します。

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

この Django アプリケーションはどこにもデプロイされません。 デプロイの例については、[Flask を使用したプロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)または[デプロイに関するドキュメント]({{ site.baseurl }}/ja/2.0/deployment-integrations/)を参照してください。

## 完全な設定ファイル

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 1回の実行の基本作業単位
  build: # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要
    # ステップが実行されるディレクトリ
    working_directory: ~/circleci-demo-python-django
    docker: # Docker でステップを実行します
      # CircleCI Python イメージは https://hub.docker.com/r/circleci/python/ で入手できます
      - image: circleci/python:3.6.4
        environment: # プライマリコンテナの環境変数
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      # CircleCI PostgreSQL イメージは https://hub.docker.com/r/circleci/postgres/ で入手できます
      - image: circleci/postgres:9.6.2
        environment: # Postgres コンテナのための環境変数
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
    steps: # `build` ジョブを構成するステップ
      - checkout # ソースコードを作業ディレクトリにチェックアウトします
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:
      # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
      - run:
          command: |
            sudo pip install pipenv
            pipenv install
      - save_cache: # Pipfile のチェックサムをキャッシュキーとして使用して、Python の依存関係をキャッシュします
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
          paths:
            - ".venv"
            - "/usr/local/bin"
            - "/usr/local/lib/python3.6/site-packages"
      - run:
          command: |
            pipenv run python manage.py test
      - store_test_results: # テストサマリー (https://circleci.com/docs/ja/2.0/collect-test-data/) に表示するテスト結果をアップロードします
          path: test-results
      - store_artifacts: # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するテストサマリーをアップロードします
          path: test-results
          destination: tr1
```

{% endraw %}

## 関連項目

- 他の言語ガイドについては、「[チュートリアル]({{ site.baseurl }}/ja/2.0/tutorials/)」を参照してください。
