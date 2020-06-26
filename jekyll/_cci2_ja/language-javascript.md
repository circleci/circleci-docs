---
layout: classic-docs
title: "Node.js - JavaScript チュートリアル"
short-title: "JavaScript"
description: "CircleCI 2.0 での JavaScript および Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
---

ここでは、Node.js サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

- 目次
{:toc}

## クイックスタート: デモ用の JavaScript Node.js リファレンス プロジェクト

CircleCI 2.1 で Express.js アプリケーションをビルドする方法を示すために、JavaScript Node.js リファレンス プロジェクトが用意されています。

- <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express" target="_blank">GitHub 上の JavaScript Node デモ プロジェクト</a>
- [CircleCI でビルドされた JavaScript Node デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

このプロジェクトには、CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、Node プロジェクトで CircleCI 2.1 を使用するためのベスト プラクティスを示しています。

## CircleCI のビルド済み Docker イメージ

CircleCI のビルド済みイメージを使用することをお勧めします。このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/node/>) から必要な Node バージョンを選択できます。 デモ プロジェクトでは、公式 CircleCI イメージを使用しています。

セカンダリ「サービス」コンテナとして使用するデータベース イメージも提供されています。

## JavaScript Node のデモ プロジェクトのビルド

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

## 設定ファイルの例

以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

{% raw %}
```yaml
version: 2.1 # CircleCI 2.1 を使用します
jobs: # 一連のステップ
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    working_directory: ~/mern-starter # ステップが実行されるディレクトリ
    docker: # Docker でステップを実行します

      - image: circleci/node:10.16.3 # このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
      - image: mongo:4.2.0 # このイメージをセカンダリ サービス コンテナとして使用します
    steps: # 実行可能コマンドの集合
      - checkout # ソース コードを作業ディレクトリにチェックアウトする特別なステップ
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache: # 依存関係キャッシュを復元する特別なステップ
          # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache: # 依存関係キャッシュを保存する特別なステップ
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run: # テストを実行します
          name: test
          command: npm test
      - run: # カバレッジ レポートを実行します
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # テスト結果をアーティファクトとして保存する特別なステップ
          # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するテスト サマリーをアップロードします 
          path: test-results.xml
          prefix: tests
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するため
          path: coverage
          prefix: coverage
      - store_test_results: # テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示するため
          path: test-results.xml
      # デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```

##
{% endraw %}
## 設定ファイルの詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2.1
```

実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは [Executor]({{ site.baseurl }}/2.0/executor-types/) という仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 最初に記述したイメージが、ジョブの[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)になります。 ジョブのすべてのコマンドがこのコンテナで実行されます。

```yaml
jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
```

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

実行の間隔を短縮するには、[依存関係またはソース コードのキャッシュ]({{ site.baseurl }}/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、`package-lock.json` のチェックサムをキャッシュキーとして使用して、`node_modules` をキャッシュします。

[`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}
```yaml
    steps:

      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
```
{% endraw %}

依存関係がインストールされたので、テスト スイートを実行し、テスト結果をアーティファクトとしてアップロードできます (CircleCI Web アプリで使用できるようになります)。

```yaml
      - run:
          name: test
          command: npm test
      - run:
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
```

完了です。 これで Node.js アプリケーション用に CircleCI 2.1 をセットアップできました。CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}を参照してください。

## 関連項目
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- その他のパブリック JavaScript プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/2.0/examples/)」を参照してください。
- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)に目を通すことをお勧めします。ここでは、Python と Flask を使用した構成を例に詳しく解説しています。