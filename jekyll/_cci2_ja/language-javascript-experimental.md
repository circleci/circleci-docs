---
layout: classic-docs
title: "CircleCI での Node.js アプリケーションの設定"
short-title: "JavaScript"
description: "CircleCI  での JavaScript と Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

{% raw %}
ここでは、Node.js で記述されたサンプルアプリケーションを参考に、CircleCI を設定する方法について説明します。
{% endraw %}

{% include snippets/language-guided-tour-cards.md lang="Node.JS" demo_url_slug="javascript" demo_branch="master" guide_completion_time="15" sample_completion_time="10" %}

## はじめに
{: #overview }

このガイドでは、Node.js サンプルアプリケーションを使って、CircleCI 上で Node.js アプリケーションをビルドする場合の設定のベストプラクティスについて説明します。 このアプリケーションは [GitHub 上でホスティング]({{site.gh_public_org_url}}/circleci-demo-javascript-react-app)され、[CircleCI 上でビルド]({{site.cci_public_org_url}}/circleci-demo-javascript-react-app){:rel="nofollow"}されます。

このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/circleci-demo-javascript-react-app/blob/master/.circleci/config.yml)を書き直してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### 1.  バージョンの指定
{: #specify-a-version }

すべての config.yml は、最初にバージョンキーを指定します。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。
```yaml
version: 2.1
```

`2.1` は、CircleCI の最新のバージョンであり、CircleCI のすべての最新機能と改善事項の利用が可能です。

### 2.  Node Orb の使用
{: #use-the-node-orb }

Node.js [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/node)には、Node.js とパッケージマネージャー (npm、yarn) を簡単にインストールできるパッケージ化された CircleCI 設定セットが含まれています。 パッケージはデフォルトでキャッシュ付きでインストールされ、 Linux x86_64、macOS x86_64、および Arm64 のサポートが自動的に含まれます。 Orb に関する詳細は、[こちら]({{site.baseurl}}/2.0/orb-intro/)をご覧ください。

設定にこの Orb を追加するには、下記を挿入します。
```yaml
orbs:
  node: circleci/node@4.7.0
```

注: 組織の設定で、サードパーティ製 Orb の使用を有効にする、または組織の CircleCI 管理者にアクセス許可をリクエストする必要がある場合があります。

### 3.  ワークフローの作成
{: #create-a-workflow }

ワークフロー は、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細は、[ワークフローの設定]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  my_workflow: # ワークフロー名です。お客様のワークフローに合う名前に変更して下さい。
```

### 4.  ジョブの作成
{: #create-a-job }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 ジョブに関する詳細は、[こちら]({{site.baseurl}}/2.0/configuration-reference/#jobs)を参照して下さい。

CircleCI を使い始めた開発者からよくいただく質問は、ビルド、テスト、デプロイの 3 つの基本タスクの実行に関してです。 このセクションでは必要な設定の各変更について説明します。 CircleCI では公式の Node.js Orb を使っているため、これらのステップを簡単に実行することができます。

#### a.  アプリのビルドとテスト
{: #build-and-test-the-app }

yarn を使用している場合は:

```yaml
jobs:
  build_and_test: # 任意の名前をお選びください。
    docker:
      - image: cimg/node:17.2.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: テストの実行
      - run:
          command: yarn build
          name: アプリのビルド
      - persist_to_workspace:
          root: ~/project
          paths: .
```

同様に、npm を使用している場合は:

```yaml
jobs:
  build_and_test: # 任意の名前をお選びください。
    docker:
      - image: cimg/node:17.2.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          command: npm run test
          name: テストの実行
      - run:
          command: npm run build
          name: アプリのビルド
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

このジョブでは Node Orb を使用しているため、自動キャッシュとベストプラクティスを適用した Node パッケージをインストールします。 これにはロックファイルが必要です。

#### b.  アプリのデプロイ
{: #deploy-the-app }

この例では、 Heroku へのデプロイを選択しています。 これは公式の Heroku Orb を使って、Orb のセクションに新しい文字列を加えることによって実行できます。 Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

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
    docker:
      - image: cimg/node:17.2.0
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # リモートで Heroku にプッシュする場合は、強制プッシュします。https://devcenter.heroku.com/articles/git を参照して下さい。

```

注: `HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数が CircleCI の UI にセットアップされる可能性があります。 環境変数に関する詳細は、[こちら]({{site.baseurl}}/2.0/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

#### c.  ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

これで `build_and_test` ジョブと `deploy` ジョブが作成されたので、`build_test_deploy`ワークフローを完成させます。 同時処理、連続、および手動承認ワークフローを使ったジョブ実行のオーケストレーションの詳細については、[ワークフロー]({{site.baseurl}}/2.0/workflows)を参照してください。

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

成功です！ CircleCI 上にビルドする Node.js アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({}/2.0/project-build/#overview)を参照してください。

## 設定ファイルの全文
{: #full-configuration-file }

```yaml
version: 2.1
orbs:
  node: circleci/node@4.7.0
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test:
    docker:
      - image: cimg/node:17.2.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: yarn
      - run:
          command: yarn test
          name: テストの実行
      - run:
          command: yarn build
          name: アプリのビルド
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # 任意の名前をお選びください。
    docker:
      - image: cimg/node:17.2.0
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # リモートで Heroku にプッシュする場合は、強制プッシュします。https://devcenter.heroku.com/articles/git を参照して下さい。

workflows:
  test_my_app:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # build_and_test ジョブが完了している場合のみデプロイします。
          filters:
            branches:
              only: main # main にある場合のみデプロイします。

```

## 関連項目
{: #see-also-new }

- [Node アプリの Heroku への継続的デプロイ]({{site.blog_base_url}}/continuous-deployment-to-heroku/)
- [Node.js の Azure VM への継続的デプロイ]({{site.blog_base_url}}/cd-azure-vm/)
- [Node.js のビルドとテストスイートのタイムアウトのトラブルシューティング]({{site.support_base_url}}/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout)
