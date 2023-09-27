---
layout: classic-docs
title: "CircleCIでGoアプリケーションを設定する方法"
description: "CircleCI　の Orb を使用して、Go プロジェクトのCI／CDをセットアップする方法こちらのドキュメントでわかりやすく皆様にご紹介しています。"
contentTags:
  platform:
  - クラウド
  - Server v4.x
  - Server v3.x
---

{% include snippets/language-guided-tour-cards.md lang="go" demo_url_slug="go" demo_branch="main" guide_completion_time="15" sample_completion_time="10" %}

## 概要
{: #overview-new }

Go プロジェクトと CircleCI を連携するためのクイックスタートガイドです。このガイドは、Go プロジェクトをビルド、テスト、デプロイするための基本的な CircleCI 設定ファイルを作成するためのものです。このクイックスタートを完了した後、プロジェクトの要件に合わせて設定を編集し、最適化することができます。

## 前提条件
{: #prerequisites}

* [CircleCI のアカウント]({{site.baseurl}}/first-steps/)
* サポートされている VCS 内の Go プロジェクト

Goプロジェクトを持っていないが、このガイドに従いたい場合は、[GitHubでホストされている](https://github.com/CircleCI-Public/sample-go-cfd)サンプルプロジェクトを使用することができます。
[CircleCI]({{site.cci_public_org_url}}/sample-go-cfd){:rel="nofollow"}でビルドされています。[リポジトリのフォーク]({{site.gh_help_articles_url}}/fork-a-repo/) を検討してください。
[設定ファイル]({{site.gh_public_org_url}}/sample-go-cfd/blob/main/.circleci/config.yml)を書き換えてください。
を書き換えてください。

## 設定のチュートリアル
{: #configuration-walkthrough-new }

すべてのCircleCIプロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/)という設定ファイルが必要です。以下の手順に従って、`config.yml` ファイルを作成してください。

### 1. バージョンを指定する
{: #specify-a-version-new }

すべての CircleCI config.yml はバージョンキーで始まります。このキーは、変更に関する警告を発行するために使用されます。
```yaml
version: 2.1
```

`2.1` は CircleCI の最新バージョンで、CircleCI の最新機能と改善点をすべてご利用いただけます。

### 2. Go Orb を使用する
{: #use-the-go-orb }

Go [orb]({{site.devhub_base_url}}/orbs/orb/circleci/go) には、Goプログラミング言語の一般的なCircleCIタスクを実行するために使用できる、パッケージ化されたCircleCI設定のセットが含まれています。Linux x86_64、macOS x86_64、Arm64をサポートしています。 [orb]({{site.baseurl}}/orb-intro/)の詳細はこちらをご覧ください。

Orb をコンフィグに追加するには、次のように入力してください：
```yaml
orbs:
  go: circleci/go@1.7.3
```

**Note**: Orb の使用際には、 [Orb Registry](https://circleci.com/developer/ja/orbs) をチェックして、最新バージョンか、特定のプロジェクトに最適なバージョンを使っていることを確認してください。

### 3. ジョブの作成
{: #create-jobs }

ジョブは設定の構成要素です。ジョブはステップの集まりで、必要に応じてコマンドやスクリプトを実行する。ジョブ内の全てのステップは、新鮮なコンテナや仮想マシン内で1つのユニットとして実行されます。ジョブの詳細については、[Jobs and Steps]({{site.baseurl}}/jobs-steps/) ページを参照してください。

CircleCIを使い始めた開発者からよく聞かれるのは、`build`、`test`、`deploy` の3つの基本的な作業を行うことである。このセクションでは、必要な各設定変更をガイドする。公式のGo orbを使用しているため、orbに組み込まれているコマンドを使用して設定をシンプルかつ簡潔に保つことができます。

#### a. アプリのビルドとテスト
{: #build-and-test-the-app }

このステップでは、Go [orb]({{site.devhub_base_url}}/orbs/orb/circleci/go)にあらかじめ設定されているコマンドを使用します。Go モジュールがダウンロードされ、キャッシュされ、テストが実行されます。

```yaml
jobs:
  build_and_test: # こちらは、どんな名前でも構いません
    executor:
      name: go/default # orb のデフォルト実行ファイルを使用してください
      tag: '1.19.2' # バージョンタグを指定する
    steps:
      - checkout # ソースコードをチェックアウトします
      - go/load-cache # キャッシュされた Go モジュールをロードします
      - go/mod-download # 'go mod download'を実行します
      - go/save-cache # Goモジュールをキャッシュに保存します
      - go/test: # Runs 'go test ./...' but includes extensive parameterization for finer tuning.
          covermode: atomic
          failfast: true
          race: true
      - persist_to_workspace:
          root: ~/project
          paths: .
```

#### b. アプリをデプロイする
{: #deploy-the-app }

このクイックスタートガイドでは、[Heroku](https://jp.heroku.com/)にデプロイします。Orb セクションに新しい行を追加することで、公式の Heroku orb を使用してこれを行うことができます。Heroku orbには、Herokuにアプリケーションをデプロイするために使用できる、パッケージ化されたCircleCI設定のセットが含まれています。 [Heroku orbの詳細はこちら]({{site.devhub_base_url}}/orbs/orb/circleci/heroku) をご覧ください。

```yaml
orbs:
  go: circleci/go@1.7.3
  heroku: circleci/heroku@1.2.6
```

次に、デプロイステップを担当するジョブをリストに追加する必要があります：

```yaml
jobs:
  # ...previous job(s)...
  deploy: # こちらは、どんな名前でも構いません
    executor: heroku/default # orbで定義されたデフォルトのエグゼキュータを使用してください
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # herokuリモートにプッシュする際の強制プッシュについては、 https://devcenter.heroku.com/articles/git をご覧ください
```

`HEROKU_API_KEY` や `HEROKU_APP_NAME` などの必要なシークレットを含む環境変数は、CircleCIウェブアプリで設定できます。[環境変数]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project)についてはこちらを参照してください。
{: class="alert alert-info" }

### 4. ワークフローを作成する
{: #create-a-workflow }

ワークフローは、ジョブの集合とその実行順序を定義するためのルールセットです。ワークフローは、設定キーのセットを使用して複雑なジョブのオーケストレーションをサポートし、障害の早期解決を支援します。ワークフロー内では、実行したいジョブを定義します。CircleCIはコミットごとにこのワークフローを実行します。[ワークフロー設定]({{ site.baseurl }}/configuration-reference/#workflows)の詳細はこちらをご覧ください。

```yaml
workflows:
  build_test_deploy: # こちらは、どんな名前でも構いません
```

### 5. ワークフローにジョブを追加する
{: #add-jobs-to-the-workflow }

ワークフロー `build_test_deploy` ができたので、それを使って `build_and_test` と `deploy` ジョブの実行をオーケストレーションすることができます。 並行承認、逐次承認、手動承認ワークフローによるジョブのオーケストレーションの詳細については、[ワークフローを使ったジョブのオーケストレーション]({{site.baseurl}}/workflows/) ページを参照してください。

```yaml
workflows:
  build_test_deploy:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # build_and_test ジョブが完了した場合のみデプロイされます
          filters:
            branches:
              only: main # メインのみでデプロイしてください
```

### 6. まとめ
{: #conclusion }

CircleCI上でビルドするGoアプリを設定し、Herokuにデプロイするだけです。プロジェクトの [パイプラインページ]({{site.baseurl}}/project-build/#overview) をチェックして、CircleCIでビルドするときにどのように見えるかを確認してください。

**デプロイのオプション?** 別のデプロイメントターゲットについては、[orb registry](https://circleci.com/ja/developer/orbs)で検索することができます。また、現在のところでは [Kubernetes](https://circleci.com/developer/orbs/orb/circleci/kubernetes)、 [AWS ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)、 [GCP GKE](https://circleci.com/developer/orbs/orb/circleci/gcp-gke)などの連携も提供しています。
{: class="alert alert-info"}

## 完全なコンフィグファイル
{: #full-configuration-file-new }

```yaml
version: 2.1
orbs:
  go: circleci/go@1.7.3
  heroku: circleci/heroku@1.2.6

jobs:
  build_and_test: # こちらは、どんな名前でも構いません
    executor:
      name: go/default # orbで定義されたデフォルトのエグゼキュータを使用
      tag: '1.19.2' # バージョン名を指定
    steps:
      - checkout # ソースコードをチェックアウト
      - go/load-cache # キャッシュされた Go モジュールをロード
      - go/mod-download # 'go mod download'を実行
      - go/save-cache #　Goモジュールをキャッシュに保存します
      - go/test: # Runs 'go test ./...' but includes extensive parameterization for finer tuning.
          covermode: atomic
          failfast: true
          race: true
      - persist_to_workspace:
          root: ~/project
          paths: .

  deploy: # こちらは、どんな名前でも構いません
    executor: heroku/default
    steps:
      - attach_workspace:
          at: ~/project
      - heroku/deploy-via-git:
          force: true # herokuリモートにプッシュする際の強制プッシュについては、このページで確認する https://devcenter.heroku.com/articles/git

workflows:
  test_my_app:
    jobs:
      - build_and_test
      - deploy:
          requires:
            - build_and_test # build_and_test ジョブが完了した場合のみデプロイする
          filters:
            branches:
              only: main # メインのみでデプロイ
```

## 関連記事
{: #see-also-new }

- [Goのテスト分割と失敗したテストの再実行](/docs/rerun-failed-tests/#configure-a-job-running-go-tests)
- チュートリアル [パイプラインを高速化するテスト分割](/docs/test-splitting-tutorial)