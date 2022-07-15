---
layout: classic-docs
title: "CircleCI での Node.js アプリケーションの設定"
short-title: "JavaScript"
description: "CircleCI  での JavaScript と Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

{% include snippets/language-guided-tour-cards.md lang="Node.JS" demo_url_slug="javascript" demo_branch="master" guide_completion_time="15" sample_completion_time="10" %}

## 概要
{: #overview }

このドキュメントは、Node.JS プロジェクトと CircleCI を連携させるためのクイックスタートガイドです。 このガイドでは、Node. JS プロジェクトをビルド、テスト、デプロイするための基礎的な CircleCI 設定ファイルを作成する方法を紹介します。 このクイックスタートの完了後、お客様のプロジェクトの要件に合うように設定ファイルを編集および最適化することができます。

## 前提条件
{: #prerequisites}

* [ CircleCI アカウント]({{site.baseurl}}/ja/first-steps/)
* 対応する VCS (現在は、Github または Bitbucket) に置かれた Node. JS プロジェクト

このガイドに従う際に Node.JS プロジェクトがないお客様は、弊社のサンプルプロジェクトをご利用いただけます。サンプルプロジェクトは、 [GitHub でホスト]({{site.gh_public_org_url}}/sample-javascript-cfd)、または[CircleCI でビルド]({{site.cci_public_org_url}}/sample-javascript-cfd)されています。 このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/sample-javascript-cfd/blob/master/.circleci/config.yml)を記述してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### 1. バージョンの指定
{: #specify-a-version }

すべての CircleCI config.yml は、最初にバージョンキーを指定します。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。
```yaml
version: 2.1
```

`2.1` は、CircleCI の最新のバージョンであり、CircleCI のすべての最新機能と改善事項の利用が可能です。

### 2. Node Orb の使用
{: #use-the-node-orb }

Node.js [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/node)には、Node.js とパッケージマネージャー (npm、yarn) を簡単にインストールできるパッケージ化された CircleCI 設定セットが含まれています。 パッケージはデフォルトでキャッシュ付きでインストールされ、 Linux x86_64、macOS x86_64、および Arm64 のサポートが自動的に含まれます。 Orb に関する詳細は、[こちら]({{site.baseurl}}/ja/orb-intro/)をご覧ください。

設定にこの Orb を追加するには、下記を挿入します。
```yaml
orbs:
  node: circleci/node@5.0.2

```

**注**: Orb を使用する際は、[Orb レジストリ](https://circleci.com/developer/orbs)をチェックして、最新バージョン、またはお客様のプロジェクトに最も合ったバージョンを使用しているかを確認することをお勧めします。

### 3. ジョブの作成
{: #create-jobs }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 ジョブに関する詳細は、[ジョブとステップ]({{site.baseurl}}/ja/jobs-steps/)のページを参照してください。

CircleCI を使い始めた開発者からよくいただく質問は、ビルド、テスト、デプロイの 3 つの基本タスクの実行に関してです。 このセクションでは必要な設定の各変更について説明します。 CircleCI では、公式の Node Orb を使用しているため、Orb に組み込まれているコマンドを使って設定をシンプルかつ簡潔にすることができます。

#### a.  アプリのビルドとテスト
{: #build-and-test-the-app }

yarn を使用している場合は:

```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: node/default # use the default executor defined within the orb
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: Run tests
      - run:
          command: yarn build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths: .
```

npm を使用している場合は:

```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: node/default # use the default executor defined within the orb
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          command: npm run test
          name: Run tests
      - run:
          command: npm run build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

このジョブでは Node Orb を使用しているため、自動キャッシュとベストプラクティスを適用した Node パッケージをインストールします。 これにはロックファイルが必要です。

#### b.  アプリのデプロイ
{: #deploy-the-app }

このクイックスタートガイドでは、[Heroku](https://www.heroku.com/) をデプロイします。 これは公式の Heroku Orb を使って、Orb のセクションに新しい文字列を加えることによって実行できます。 Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

```yaml
orbs:
  node: circleci/node@4.7.0
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを実行するために、リストにジョブを追加する必要があります。

```yaml
jobs:
  # ...以前のジョブ...
  deploy: # 任意の名前をお選びください。
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

注: `HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数が CircleCI の UI にセットアップされる可能性があります。 環境変数に関する詳細は、[こちら]({{site.baseurl}}/ja/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

### 3. ワークフローの作成
{: #create-a-workflow }

ワークフローは、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細については、[ワークフローの設定]({{ site.baseurl }}/ja/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  build_test_deploy: # this can be any name you choose

```

### 4.  ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

完成したワークフロー、`build_test_deploy` を使用して `build_and_test` ジョブと `deploy` ジョブの実行をオーケストレーションします。 同時実行、順次実行、および手動承認ワークフローを使ったジョブのオーケストレーションの詳細については、[ワークフローを使ったジョブのスケジュール実行]({{site.baseurl}}/ja/workflows)を参照してください。

```yaml
workflows:
  build_test_deploy: # 任意の名前をお選びください。
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # build_and_test ジョブが完了している場合のみデプロイします。
          filters:
            branches:
              only: main #  main にある場合のみデプロイします。

```

### 5. まとめ
{: #conclusion }

CircleCI 上にビルドする Node.js アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({{site.baseurl}}/ja/project-build/#overview)を参照してください。

## 設定ファイルの全文
{: #full-configuration-file }

```yaml
version: 2.1
orbs:
  node: circleci/node@5.0.2
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test:
    executor: node/default
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: Run tests
      - run:
          command: yarn build
          name: Build app
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # this can be any name you choose
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git

workflows:
  test_my_app:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # only deploy if the build_and_test job has completed
          filters:
            branches:
              only: main # only deploy when on main
```

## 関連項目
{: #see-also-new }

- [Node アプリの Heroku への継続的デプロイ]({{site.blog_base_url}}/ja/continuous-deployment-to-heroku/)
- [Node.js の Azure VM への継続的デプロイ]({{site.blog_base_url}}/ja/cd-azure-vm/)
- [Node.js のビルドとテストスイートのタイムアウトのトラブルシューティング]({{site.support_base_url}}/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout)
