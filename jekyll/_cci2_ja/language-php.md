---
layout: classic-docs
title: "言語ガイド: PHP"
short-title: "PHP"
description: "CircleCI 2.0 での PHP を使用したビルドとテスト"
categories:
  - language-guides
order: 6
version:
  - Cloud
  - Server v2.x
---

ここでは、PHP サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

* 目次
{:toc}

## クイックスタート: デモ用の PHP Laravel リファレンス プロジェクト
CircleCI 2.0 での PHP のビルド方法を示すために、PHP Laravel リファレンス プロジェクトが用意されています。

We maintain a reference PHP Laravel project to show how to build PHP on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel" target="_blank">GitHub 上の PHP Laravel デモ プロジェクト</a>
- [CircleCI でビルドされたデモ PHP Laravel プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel/blob/circleci-2.0/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、PHP プロジェクトで CircleCI 2.0 を使用するためのベスト プラクティスを示しています。

## CircleCI のビルド済み Docker イメージ
セカンダリ「サービス」コンテナとして使用するデータベース イメージも提供されています。

CircleCI のビルド済みイメージを使用することをお勧めします。 このイメージには、CI 環境で役立つツールがプリインストールされています。 [Docker Hub](https://hub.docker.com/r/circleci/php/) から必要な PHP バージョンを選択できます。 デモ プロジェクトでは、公式 CircleCI イメージを使用しています。

以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

## PHP のデモ プロジェクトのビルド
{: #build-the-demo-php-project-yourself }

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

---

## 設定ファイルの例
{: #sample-configuration }

Following is the commented `.circleci/config.yml` file in the demo project.

{% raw %}
```yaml
version: 2 # CircleCI 2.0 を使用します

jobs: # 一連のステップ
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    docker: # Docker でステップを実行します

      - image: circleci/php:7.1-node-browsers # このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
    working_directory: ~/laravel # ステップが実行されるディレクトリ
    steps: # 実行可能コマンドの集合
      - checkout # ソース コードを作業ディレクトリにチェックアウトする特別なステップ
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
      - restore_cache: # `composer.lock` が変更されていない場合に、依存関係キャッシュを復元する特別なステップ
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします (https://circleci.com/ja/docs/2.0/caching/ を参照)
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: # `composer.lock` キャッシュ キー テンプレートを使用して依存関係キャッシュを保存する特別なステップ
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache: # `package.json` が変更されていない場合に、依存関係キャッシュを復元する特別なステップ
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします (https://circleci.com/ja/docs/2.0/caching/ を参照)
            - node-v1-
      - run: yarn install
      - save_cache: # `package.json` キャッシュ キー テンプレートを使用して依存関係キャッシュを保存する特別なステップ
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run: touch storage/testing.sqlite 
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
      # デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```
{% endraw %}

## 設定ファイルの詳細
{: #config-walkthrough }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```


実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 ここでは、ブラウザー ツールを含む [CircleCI 提供の PHP Docker イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#php)を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-node-browsers 
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

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例のキャッシュ キーは、`composer.lock` ファイルのチェックサムに基づいていますが、より汎用的なキャッシュ キーを使用するようにフォールバックします。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。


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

完了です。 これで PHP アプリケーション用に CircleCI 2.0 をセットアップできました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"}を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

- その他のパブリック PHP プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/ja/2.0/examples/)」を参照してください。

- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)に目を通すことをお勧めします。 ここでは、Python と Flask を使用した構成を例に詳しく解説しています。
