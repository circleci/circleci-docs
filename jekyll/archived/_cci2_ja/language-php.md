---
layout: classic-docs
title: "言語ガイド: PHP"
short-title: "PHP"
description: "CircleCI での PHP を使用したビルドとテスト"
categories:
  - language-guides
order: 6
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

ここでは、PHP サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルを作成する方法を詳細に説明します。

* 目次
{:toc}

## クイックスタート: デモ用の PHP Laravel リファレンス プロジェクト
CircleCI 2.0 での PHP のビルド方法を示すために、PHP Laravel リファレンス プロジェクトが用意されています。

CircleCI での PHP のビルド方法を示すために、PHP Laravel リファレンス プロジェクトが用意されています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel" target="_blank">GitHub 上の PHP Laravel デモ プロジェクト</a>
- [CircleCI でビルドされたデモ PHP Laravel プロジェクト](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-php-laravel){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel/blob/circleci-.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、PHP プロジェクトで CircleCI を使用するためのベスト プラクティスを示しています。

## CircleCI のビルド済み Docker イメージ
セカンダリ「サービス」コンテナとして使用するデータベース イメージも提供されています。

CircleCI のビルド済みイメージを使用することをお勧めします。 このイメージには、CI 環境で役立つツールがプリインストールされています。 [Docker Hub](https://hub.docker.com/r/circleci/php/) から必要な PHP バージョンを選択できます。 デモ プロジェクトでは、公式 CircleCI イメージを使用しています。

以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

## PHP のデモ プロジェクトのビルド
{: #build-the-demo-php-project-yourself }

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI アプリケーションの[プロジェクトダッシュボード](https://app.circleci.com/projects/){:rel="nofollow"}に行き、フォークしたプロジェクトの隣にある**[Follow Project (プロジェクトをフォローする)]**ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

---

## 設定ファイルの例
{: #sample-configuration }

以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

{% raw %}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2

jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      - image: cimg/php:8.0.14-browsers # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/laravel # directory where steps will run
    steps: # a set of executable commands
      - checkout # special step to check out source code to working directory
      - run: sudo pecl install pcov
      - run: sudo composer selfupdate
      - restore_cache: # special step to restore the dependency cache if `composer.lock` does not change
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/caching/)
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: # special step to save the dependency cache with the `composer.lock` cache key template
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache: # special step to restore the dependency cache if `package-lock.json` does not change
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/caching/)
            - node-v1-
      - run: yarn install
      - save_cache: # special step to save the dependency cache with the `package-lock.json` cache key template
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run: touch storage/testing.sqlite
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
      # See https:circleci/docs/deployment-overview#next-steps document for links to target configuration examples
```
{% endraw %}

## 設定ファイルの詳細
{: #config-walkthrough }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```


実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/ja/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/executor-intro/) と呼ばれる仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 ここでは、ブラウザー ツールを含む [CircleCI 提供の PHP Docker イメージ]({{site.baseurl}}/ja/circleci-images/#php)を使用します。

```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2
jobs:
  build:
    docker:
      - image: cimg/php:8.0.14-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/laravel
```

次に、`steps:` キーの下で、一連のコマンドを実行します。 以下のように、依存関係の管理に使用できる PHP ツールをインストールします。

{% raw %}
```yaml
    steps:

      - checkout
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
```
{% endraw %}

設定ファイルのその後のステップはすべて、依存関係の管理とキャッシュに関連しています。 このサンプル プロジェクトでは、PHP の依存関係と JavaScript の依存関係の両方をキャッシュします。

[`save_cache`]({{ site.baseurl }}/ja/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例のキャッシュ キーは、`composer.lock` ファイルのチェックサムに基づいていますが、より汎用的なキャッシュ キーを使用するようにフォールバックします。

[`save_cache`]({{ site.baseurl }}/ja/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。


{% raw %}
```yaml
      <br />      - restore_cache: 
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: 
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache:
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            - node-v1-
      - run: yarn install
      - save_cache: 
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
```
{% endraw %}

最後に、Sqlite テスト データベースを準備し、移行を実行し、テストを実行します。

```yaml
      - run: touch storage/testing.sqlite 
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
```

---

完了です。 これで PHP アプリケーション用に CircleCI をセットアップできました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"}を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- [デプロイの概要]({{site.baseurl}}/ja/deployment-overview#next-steps/)に、さまざまなターゲットの設定例へのリンクを掲載しています。
- CircleCI を初めて使用する場合は、[プロジェクトの詳細]({{ site.baseurl }}/ja/project-walkthrough/)に目を通すことをお勧めします。 ここでは、Python と Flask を使用した設定を例に詳しく解説しています。
