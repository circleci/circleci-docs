---
layout: classic-docs
title: "Jira と CircleCI の接続"
categories:
  - how-to
description: "Jira と CircleCI の接続"
---

ここでは、Jira を CircleCI ビルドに接続する方法について説明します。 CircleCI Jira プラグインを使用すると、ジョブページから直接 Jira チケットを作成して、ジョブのステータスを基にタスクや修正を割り当てたり、ビルドのステータスを Jira に表示したりといったことが可能です。

**注:** CircleCI Jira プラグインは Jira 管理者のみがインストールできます。

## インストール手順
{: #installation-steps }

1. [Project settings] > [`JIRA integration`] に移動します。 ![CircleCI Web アプリの Jira インテグレーション オプション]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Atlassian Marketplace にアクセスし、[CircleCI Jira プラグイン](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)を入手します。 ![Atlassian マーケットプレイスの CircleCI Jira プラグイン]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. プラグインをインストールし、プロンプトに従ってセットアップします。![プラグインの設定 1]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png) ![プラグインの設定 2]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. CircleCI の [Jira Integration] 設定ページに戻り、生成されたトークンを追加します。

---

## Jiraでビルドとデプロイのステータスを確認する
{: #viewing-build-and-deploy-statuses-in-jira }

CircleCI Orb を使用すると、Jira Cloud でビルドとデプロイのステータスを確認できるようになります。 そのためには以下を実行する必要があります。

1. 前述の手順に従って Jira と CircleCI を接続します。
1. `.circleci/config.yml` ファイルの上部で、バージョン `2.1` が使用されていることを確認します。
1. ビルド情報を取得する API トークンを入手するには、**[Project Settings] -> [Permissions] -> [API Permissions]** の順に移動します。 そのトークンをコピーします。 (*注*: 古いバージョンの JIRA Orb の場合、 _プロジェクト API トークン_ の取得が必要な場合があります。このトークンには、**Project Settings > API Permissions** からアクセスできます。)
1. キーに連携を許可するには、**[Project Settings] -> [Build Settings] -> [Environment Variables]** の順に移動し、*CIRCLE_TOKEN* という変数と作成したトークンの値を追加します。
1. Orb スタンザを追加し、Jira Orb を呼び出します。

Jira Orb を使用したシンプルな `config.yml` の例を以下に示します。


```yaml
version: 2.1
orbs: # adds orbs to your configuration
  jira: circleci/jira@1.0.5 # invokes the Jira orb, making its commands accessible
workflows:
  build:
    jobs:
      - build:
          post-steps:
            - jira/notify # Runs the Jira's "notify" commands after a build has finished its steps.
jobs:
  build:
    docker:
      - image: 'cimg/base:stable'
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: echo "hello"
```
