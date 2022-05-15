---
layout: classic-docs
title: "CircleCI での Python アプリケーションの構成"
short-title: "Python"
description: "CircleCI 上での Python による継続的インテグレーション"
categories:
  - language-guides
order: 7
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

{% include snippets/language-guided-tour-cards.md lang="Python" demo_url_slug="python" demo_branch="main" guide_completion_time="15" sample_completion_time="10" %}

## 概要
{: #overview-new }

This is a quickstart guide for integrating a Python project with CircleCI. This guide is designed to help you create a basic CircleCI configuration file to build, test and deploy your Python project. After completing this quickstart you can edit and optimize the config to fit the requirements of your project.

## 前提条件
{: #prerequisites}

* [A CircleCI account]({{site.baseurl}}/2.0/first-steps/)
* A Python project located in a supported VCS (currently GitHub or Bitbucket)

If you do not have a Python project, but would like to follow this guide, you can use our sample project which is [hosted on GitHub](https://github.com/CircleCI-Public/sample-python-cfd) and is [building on CircleCI]({{site.cci_public_org_url}}/sample-python-cfd){:rel="nofollow"}. このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/sample-python-cfd/blob/main/.circleci/config.yml)を記述してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough-new }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 Follow the steps below to create a working `config.yml` file.

### 1. バージョンの指定
{: #specify-a-version-new }

Every CircleCI config.yml starts with the version key. このキーは、互換性を損なう変更に関する警告を表示するために使用します。
```yaml
version: 2.1
```

`2.1` は、CircleCI の最新のバージョンであり、CircleCI のすべての最新機能と改善事項の利用が可能です。

### 2. Python Orb の使用
{: #use-the-python-orb }

Python [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/python)には、Python プログラミング言語用の一般的な CircleCI タスクの実行に使用できるパッケージ化された CircleCI 設定セットが含まれています。 これは、Linux x86_64、macOS x86_64、Arm64 をサポートしています。 Orb に関する詳細は、[こちら]({{site.baseurl}}/2.0/orb-intro/)をご覧ください。

設定にこの Orb を追加するには、下記を挿入します。
```yaml
orbs:
  python: circleci/python@2.0.3
```

**Note**: When using an orb, it is a good idea to check the [Orb Registry](https://circleci.com/developer/orbs) to ensure you are using the most recent version, or the version that fits best with your specific project.

### 3. Create jobs
{: #create-jobs }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 All of the steps in the job are executed in a single unit, either within a fresh container or virtual machine. Learn more about jobs on the [Jobs and Steps]({{site.baseurl}}/2.0/jobs-steps/) page.

A common ask from developers who are getting started with CircleCI is to perform three basic tasks: `build`, `test` and `deploy`. This section guides you through each of the config changes needed. Because we are using the official Python orb, we can use commands that are built into the orb to keep our config simple and succinct:

#### a.  アプリのビルドとテスト
{: #build-and-test-the-app }

このステップでは、Python [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/python) で使われている `python/install-packages` コマンドを使用します。 このコマンドにより自動的に Python 環境が設定され、お客様のプロジェクトに`pip`によりグローバルに、または`poetry` や`pipenv`により`virtualenv`にパッケージがインストールされます。
```yaml
jobs:
  build_and_test: # this can be any name you choose
    executor: python/default # use the default executor defined within the orb
    steps:
      - checkout # checkout source code
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Run tests
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

#### b.  アプリのデプロイ
{: #deploy-the-app }

In this quickstart guide, we will deploy to [Heroku](https://www.heroku.com/). We can do this using the official Heroku orb by adding a new line into our orb section. Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

```yaml
orbs:
  python: circleci/python@2.0.3
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを実行するために、リストにジョブを追加する必要があります。

```yaml
jobs:
  # ...以前のジョブ...
  deploy: # this can be any name you choose
    executor: heroku/default # use the default executor defined within the orb
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

Note: Environment variables containing the necessary secrets such as `HEROKU_API_KEY` and `HEROKU_APP_NAME` can be set up in the CircleCI web app. 環境変数に関する詳細は、[こちら]({{site.baseurl}}/2.0/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

### 4. ワークフローの作成
{: #create-a-workflow }

ワークフロー は、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細は、[ワークフローの設定]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  build_test_deploy: # this can be any name you choose
```

### 5. ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

Now that we have our workflow, `build_test_deploy`, we can use it to orchestrate the running of our `build_and_test` and `deploy` jobs. Refer to the [Using Workflows to Schedule Jobs]({{site.baseurl}}/2.0/workflows/) page for more details about orchestrating jobs with concurrent, sequential, and manual approval workflows.

```yaml
workflows:
  build_test_deploy:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # only deploy if the build_and_test job has completed
          filters:
            branches:
              only: main # only deploy when on main
```

### 6. まとめ
{: #conclusion }

CircleCI 上にビルドする Python アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({}/2.0/project-build/#overview)を参照してください。

## 設定ファイルの全文
{: #full-configuration-file-new }

```yaml
version: 2.1
orbs:
  python: circleci/python@2.0.3
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test: # this can be any name you choose
    executor: python/default
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Run tests
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # this can be any name you choose
    executor: python/default
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

- [Python Django テストでのテスト分割の使用]({{site.support_base_url}}/hc/en-us/articles/360048786831-Use-test-splitting-with-Python-Django-tests)
- [Pytest を使った Flask フレームワークのテスト]({{site.blog_base_url}}/testing-flask-framework-with-pytest/)
- [CircleCI で Django を使用する方法]({{site.support_base_url}}/hc/en-us/articles/115012795327-How-do-I-use-Django-on-CircleCI-)
