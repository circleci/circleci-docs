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

This is a quickstart guide for integrating a Node.JS project with CircleCI. This guide is designed to help you create a basic CircleCI configuration file to build, test and deploy your Node.JS project. After completing this quickstart you can edit and optimize the config to fit the requirements of your project.

## 前提条件
{: #prerequisites}

* [A CircleCI account]({{site.baseurl}}/2.0/first-steps/)
* A Node.JS project located in a supported VCS (currently GitHub or Bitbucket)

If you do not have a Node.JS project, but would like to follow this guide, you can use our sample project, which is [hosted on GitHub]({{site.gh_public_org_url}}/sample-javascript-cfd) and is [building on CircleCI]({{site.cci_public_org_url}}/sample-javascript-cfd). このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/sample-javascript-cfd/blob/master/.circleci/config.yml)を記述してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### 1. バージョンの指定
{: #specify-a-version }

Every CircleCI config.yml starts with the version key. このキーは、互換性を損なう変更に関する警告を表示するために使用します。
```yaml
version: 2.1
```

`2.1` は、CircleCI の最新のバージョンであり、CircleCI のすべての最新機能と改善事項の利用が可能です。

### 2. Node Orb の使用
{: #use-the-node-orb }

Node.js [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/node)には、Node.js とパッケージマネージャー (npm、yarn) を簡単にインストールできるパッケージ化された CircleCI 設定セットが含まれています。 パッケージはデフォルトでキャッシュ付きでインストールされ、 Linux x86_64、macOS x86_64、および Arm64 のサポートが自動的に含まれます。 Orb に関する詳細は、[こちら]({{site.baseurl}}/2.0/orb-intro/)をご覧ください。

設定にこの Orb を追加するには、下記を挿入します。
```yaml
orbs:
  node: circleci/node@5.0.2
```

**Note**: When using an orb, it is a good idea to check the [Orb Registry](https://circleci.com/developer/orbs) to ensure you are using the most recent version, or the version that fits best with your specific project.

### 3. Create jobs
{: #create-jobs }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 Learn more about jobs on the [Jobs and Steps]({{site.baseurl}}/2.0/jobs-steps/) page.

A common ask from developers who are getting started with CircleCI is to perform 3 basic tasks: `build`, `test` and `deploy`. This section guides you through each of the config changes needed. Because we are using the official Node orb, we can use commands that are built into the orb to keep our config simple and succinct:

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

同様に、npm を使用している場合は:

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

In this quickstart guide, we will deploy to [Heroku](https://www.heroku.com/). We can do this using the official Heroku orb by adding a new line into our orb section. Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

```yaml
orbs:
  node: circleci/node@4.7.0
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを実行するために、リストにジョブを追加する必要があります。

```yaml
jobs:
  # ...以前のジョブ...
  deploy: # this can be any name you choose
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

注: `HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数が CircleCI の UI にセットアップされる可能性があります。 環境変数に関する詳細は、[こちら]({{site.baseurl}}/2.0/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

### 3. ワークフローの作成
{: #create-a-workflow }

ワークフロー は、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細は、[ワークフローの設定]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  build_test_deploy: # this can be any name you choose
```

### 4.  ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

Now that we have our workflow, `build_test_deploy`, we can use it to orchestrate the running of our `build_and_test` and `deploy` jobs. Refer to the [Using Workflows to Schedule Jobs]({{site.baseurl}}/2.0/workflows/) page for more details about orchestrating jobs with concurrent, sequential, and manual approval workflows.

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

CircleCI 上にビルドする Node.js アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({}/2.0/project-build/#overview)を参照してください。

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

- [Node アプリの Heroku への継続的デプロイ]({{site.blog_base_url}}/continuous-deployment-to-heroku/)
- [Node.js の Azure VM への継続的デプロイ]({{site.blog_base_url}}/cd-azure-vm/)
- [Node.js のビルドとテストスイートのタイムアウトのトラブルシューティング]({{site.support_base_url}}/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout)
