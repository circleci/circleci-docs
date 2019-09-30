---
layout: classic-docs
title: "Node.js - JavaScript チュートリアル"
short-title: "JavaScript"
description: "CircleCI 2.0 での JavaScript および Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
---

ここでは、Node.js サンプルアプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

- 目次
{:toc}

## クイックスタート：デモ用の JavaScript Node.js リファレンスプロジェクト

We maintain a reference JavaScript Node.js project to show how to build an Express.js app on CircleCI 2.1:

- <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express" target="_blank">GitHub 上の JavaScript Node デモプロジェクト</a>
- [CircleCI でビルドされた JavaScript Node デモプロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

このプロジェクトには、CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 This file shows best practice for using CircleCI 2.1 with Node projects.

## CircleCI のビルド済み Docker イメージ

CircleCI のビルド済みイメージを使用することをお勧めします。このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/node/>) から必要な Node バージョンを選択できます。 デモプロジェクトでは、公式 CircleCI イメージを使用しています。

セカンダリ「サービス」コンテナとして使用するデータベースイメージも提供されています。

## JavaScript Node のデモプロジェクトのビルド

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモプロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

## 設定例

以下に、デモプロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

{% raw %}
```yaml
version: 2.1 # use CircleCI 2.1
jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    working_directory: ~/mern-starter # directory where steps will run
    docker: # run the steps with Docker

      - image: circleci/node:10.16.3 # ...with this image as the primary container; this is where all `steps` will run
      - image: mongo:4.2.0 # and this image as the secondary service container
    steps: # a collection of executable commands
      - checkout # special step to check out source code to working directory
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache: # special step to restore the dependency cache
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache: # special step to save the dependency cache
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run: # run tests
          name: test
          command: npm test
      - run: # run coverage report
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # special step to save test results as as artifact
          # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: test-results.xml
          prefix: tests
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: coverage
          prefix: coverage
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test-results.xml
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
```

##
{% endraw %}
## 設定の詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2.1
```

1回の実行は 1つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) を使用していないため、`build` ジョブを持つ必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブのステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 リストの先頭にあるイメージがジョブの[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)になります。 ジョブのすべてのコマンドは、このコンテナで実行されます。

```yaml
jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
```

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソースコードがチェックアウトされます。

実行の間隔を短縮するには、[依存関係またはソースコードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、`package.json` のチェックサムをキャッシュキーとして使用して、`node_modules` をキャッシュします。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}
```yaml
    steps:

      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - ./node_modules
```
{% endraw %}

依存関係がインストールされたので、テストスイートを実行し、テスト結果をアーティファクトとしてアップロードできます (CircleCI Web アプリで使用できるようになります)。

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

完了です。 You just set up CircleCI 2.1 for a Node.js app. Check out our project’s [Job page](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"} to see how this looks when building on CircleCI.

## 関連項目
{:.no_toc}

- デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
- その他のパブリック JavaScript プロジェクトの設定例については、「[設定ファイルをローカルでテストする]({{ site.baseurl }}/ja/2.0/examples/)」を参照してください。
- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)に目を通すことをお勧めします。ここでは、Python と Flask を使用した設定を例に詳しく解説しています。