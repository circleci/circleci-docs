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

このドキュメントは、Pyton プロジェクトと CircleCI を連携させるためのクイックスタートガイドです。 このガイドでは、Python プロジェクトをビルド、テスト、デプロイするための基礎的な CircleCI 設定ファイルを作成する方法を紹介します。 このクイックスタートの完了後、お客様のプロジェクトの要件に合うように設定ファイルを編集および最適化することができます。

## 前提条件
{: #prerequisites}

* [CircleCI アカウント]({{site.baseurl}}/ja/first-steps/)
* 対応する VCS (現在は、Github または Bitbucket) に置かれた Python プロジェクト

このガイドに従う際に Python プロジェクトがないお客様は、弊社のサンプルプロジェクトをご利用いただけます。サンプルプロジェクトは、 [GitHub でホスト](https://github.com/CircleCI-Public/sample-python-cfd)、または[ CircleCI でビルド]({{site.cci_public_org_url}}/sample-python-cfd){:rel="nofollow"} されています。 このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/sample-python-cfd/blob/main/.circleci/config.yml)を記述してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough-new }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、作業を行う `config.yml` ファイルを作成してください。

### 1. バージョンの指定
{: #specify-a-version-new }

すべての CircleCI config.yml は、最初にバージョンキーを指定します。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。
```yaml
version: 2.1
```

`2.1` は、CircleCI の最新のバージョンであり、CircleCI のすべての最新機能と改善事項の利用が可能です。

### 2. Python Orb の使用
{: #use-the-python-orb }

Python [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/python)には、Python プログラミング言語用の一般的な CircleCI タスクの実行に使用できるパッケージ化された CircleCI 設定セットが含まれています。 これは、Linux x86_64、macOS x86_64、Arm64 をサポートしています。 Orb に関する詳細は、[こちら]({{site.baseurl}}/ja/orb-intro/)をご覧ください。

設定にこの Orb を追加するには、下記を挿入します。
```yaml
orbs:
  python: circleci/python@2.0.3
```

**注**: Orb を使用する際は、[Orb レジストリ](https://circleci.com/developer/orbs)をチェックして、最新バージョン、またはお客様のプロジェクトに最も合ったバージョンを使用しているかを確認することをお勧めします。

### 3. ジョブの作成
{: #create-jobs }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 ジョブに関する詳細は、[ジョブとステップ]({{site.baseurl}}/ja/jobs-steps/)のページを参照してください。

CircleCI を使い始めた開発者からよくいただく質問は、`build`、`test`、`deploy` の 3 つの基本タスクの実行に関してです。 このセクションでは必要な設定の各変更について説明します。 CircleCI では、公式の Python Orb を使用しているため、Orb に組み込まれているコマンドを使って設定をシンプルかつ簡潔にすることができます。

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

このクイックスタートガイドでは、[Heroku](https://www.heroku.com/) をデプロイします。 これは公式の Heroku Orb を使って、Orb のセクションに新しい文字列を加えることによって実行できます。 Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

```yaml
orbs:
  python: circleci/python@2.0.3
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを実行するために、リストにジョブを追加する必要があります。

```yaml
jobs:
  # ...以前のジョブ...
  deploy: # 任意の名前をお選びください。
    executor: heroku/default # Orb 内で定義されているデフォルトの Executor を使います。
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # force push when pushing to the heroku remote, see: https://devcenter.heroku.com/articles/git
```

注: `HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数が CircleCI Web アプリにセットアップされる場合があります。 環境変数に関する詳細は、[こちら]({{site.baseurl}}/ja/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

### 4. ワークフローの作成
{: #create-a-workflow }

ワークフロー は、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細については、[ワークフローの設定]({{ site.baseurl }}/ja/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  build_test_deploy: # 任意の名前をお選びください。

```

### 5. ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

完成したワークフロー、`build_test_deploy` を使用して `build_and_test` ジョブと `deploy` ジョブの実行をオーケストレーションします。 同時実行、順次実行、および手動承認ワークフローを使ったジョブのオーケストレーションの詳細については、[ワークフローを使ったジョブのスケジュール実行]({{site.baseurl}}/ja/workflows)を参照してください。

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

CircleCI 上にビルドする Python アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({{site.baseurl}}/ja/project-build/#overview)を参照してください。

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
