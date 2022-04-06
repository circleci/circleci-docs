---
layout: classic-docs
title: "CircleCI での Python アプリケーションの設定"
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

{% raw %}
ここでは、Python で記述されたサンプルアプリケーションを参考に、CircleCI を設定する方法について説明します。
{% endraw %}

{% include snippets/language-guided-tour-cards.md lang="Python" demo_url_slug="python" demo_branch="main" guide_completion_time="15" sample_completion_time="10" %}

## はじめに
{: #overview-new }

このガイドでは、Django サンプルアプリケーションを使って、CircleCI 上で Python アプリケーションをビルドする場合の設定のベストプラクティスについて説明します。 このアプリケーションは [GitHub 上でホスティング]({{site.gh_public_org_url}}/circleci-demo-python-django)され、[CircleCI 上でビルド]({{site.cci_public_org_url}}/circleci-demo-python-django){:rel="nofollow"}されます。

このガイドに沿って、[リポジトリをフォーク]({{site.gh_help_articles_url}}/fork-a-repo/)し、[設定ファイル]({{site.gh_public_org_url}}/circleci-demo-python-django/blob/master/.circleci/config.yml)を書き直してみることをお勧めします。

## 設定ファイルの詳細
{: #configuration-walkthrough-new }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

### 1. バージョンの指定
{: #specify-a-version-new }

すべての config.yml は、最初にバージョンキーを指定します。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。
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
  python: circleci/python@1.5.0
```

注: 組織の設定で、サードパーティ製 Orb の使用を有効にする、または組織の CircleCI 管理者にアクセス許可をリクエストする必要がある場合があります。

### 3. ワークフローの作成
{: #create-a-workflow }

ワークフロー は、一連のジョブとその実行順序を定義するためのルールです。 ワークフローを使用すると、設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。 ワークフロー内で実行したいジョブを定義します、 このワークフローはコミットのたびに実行されます。 詳細は、[ワークフローの設定]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を参照して下さい。

```yaml
workflows:
  my_workflow: # ワークフロー名です。お客様のワークフローに合う名前に変更して下さい。
```

### 4.  ジョブの作成
{: #create-a-job }

ジョブは設定の構成要素です。 また、必要に応じてコマンド / スクリプトを実行するステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 ジョブに関する詳細は、[こちら]({{site.baseurl}}/2.0/configuration-reference/#jobs)を参照して下さい。

CircleCI を使い始めた開発者からよくいただく質問は、ビルド、テスト、デプロイの 3 つの基本タスクの実行に関してです。 このセクションでは必要な設定の各変更について説明します。 CircleCI では公式の Python Orb を使っているため、これらのステップを簡単に実行することができます。

#### a.  アプリのビルドとテスト
{: #build-and-test-the-app }

このステップでは、Python [Orb]({{site.devhub_base_url}}/orbs/orb/circleci/python) で使われている `python/install-packages` コマンドを使用します。 このコマンドにより自動的に Python 環境が設定され、お客様のプロジェクトに`pip`によりグローバルに、または`poetry` や`pipenv`により`virtualenv`にパッケージがインストールされます。
```yaml
jobs:
  build_and_test: # 任意の名前をお選びください。
    docker:
      - image: cimg/python:3.10.1
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: テストの実行
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .
```

#### b.  アプリのデプロイ
{: #deploy-the-app }

この例では、 Heroku へのデプロイを選択しています。 これは公式の Heroku Orb を使って、Orb のセクションに新しい文字列を加えることによって実行できます。 Heroku Orb には、アプリケーションを Heroku にデプロイするために使用できる事前にパッケージ化された CircleCI 設定セットが含まれています。 Heroku Orb に関する詳細は、[こちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku)を参照して下さい。

```yaml
orbs:
  python: circleci/python@1.5.0
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを実行するために、リストにジョブを追加する必要があります。

```yaml
jobs:
  # ...以前のジョブ...
  deploy: # 任意の名前をお選びください。
    docker:
      - image: cimg/python:3.10.1
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # リモートで Heroku にプッシュする場合は、強制プッシュします。https://devcenter.heroku.com/articles/git を参照して下さい。

```

注: `HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数が CircleCI の UI にセットアップされる可能性があります。 環境変数に関する詳細は、[こちら]({{site.baseurl}}/2.0/env-vars/#setting-an-environment-variable-in-a-project)を参照して下さい。

#### c.  ワークフローへのジョブの追加
{: #add-jobs-to-the-workflow }

これで `build_and_test` ジョブと `deploy` ジョブが作成されたので、`build_test_deploy`ワークフローを完成させます。 同時実行、連続、および手動承認ワークフローを使ったジョブ実行のオーケストレーションの詳細については、[ワークフロー]({{site.baseurl}}/2.0/workflows)を参照してください。

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
              only: main # main にある場合のみデプロイします、
```

### 5. まとめ
{: #conclusion }

成功です！ CircleCI 上にビルドする Python アプリケーションを設定しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ]({}/2.0/project-build/#overview)を参照してください。

## 設定ファイルの全文
{: #full-configuration-file-new }

```yaml
version: 2.1
orbs:
  python: circleci/python@1.5.0
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test: # 任意の名前をお選びください。
    docker:
      - image: cimg/python:3.10.1
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: テストの実行
          command: python -m pytest
      - persist_to_workspace:
          root: ~/project
          paths:
            - .

  deploy: # 任意の名前をお選びください。
    docker:
      - image: cimg/python:3.10.1
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

- [Python Django テストでのテスト分割の使用]({{site.support_base_url}}/hc/en-us/articles/360048786831-Use-test-splitting-with-Python-Django-tests)
- [Pytest を使った Flask フレームワークのテスト]({{site.blog_base_url}}/testing-flask-framework-with-pytest/)
- [CircleCI  で Django を使用する方法]({{site.support_base_url}}/hc/en-us/articles/115012795327-How-do-I-use-Django-on-CircleCI-)
