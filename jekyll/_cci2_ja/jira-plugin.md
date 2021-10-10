---
layout: classic-docs
title: "Jira と CircleCI の接続"
categories:
  - how-to
description: "Jira と CircleCI の接続"
---

ここでは、Jira を CircleCI ビルドに接続する方法について説明します。 CircleCI Jira プラグインを使用すると、ジョブ ページから直接 Jira チケットを作成して、ジョブのステータスを基にタスクや修正を割り当てたり、ビルドのステータスを Jira に表示したりといったことが可能です。

**メモ:** CircleCI Jira プラグインは Jira 管理者のみがインストールできます。

# インストール手順
{: #installation-steps }

1. Navigate to project settings and select `JIRA integration` ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Atlassian Marketplace にアクセスし、[CircleCI Jira プラグイン](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)を入手します。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. プラグインをインストールし、プロンプトに従ってセットアップします。![]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png) ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. CircleCI の [Jira Integration (Jira インテグレーション)] 設定ページに戻り、生成されたトークンを追加します。

---

# Jiraでビルドとデプロイのステータスを確認する
{: #viewing-build-and-deploy-statuses-in-jira }

CircleCI Orb を使用すると、Jira でビルドとデプロイのステータスを確認できるようになります。 そのプロセスは以下のとおりです。

1. 前述の手順に従って Jira と CircleCI を接続します。
1. `.circleci/config.yml` ファイルの上部で、バージョン `2.1` が使用されていることを確認します。
1. {% include snippets/enable-pipelines.md %}
1. To get an API token for build information retrieval, go to [User Settings > Tokens](https://app.circleci.com/settings/user/tokens) and create a token. Copy the token. (*Note*: older versions of the JIRA orb may require you to retrieve a _Project API Token_, which is accessible from **Project Settings > API Permissions**)
1. To give the integration access to the key, go to **Project Settings -> Environment Variables** and add a variable named _CIRCLE_TOKEN_ with the value being the token you just made.
1. Add the Jira orb to your configuration and invoke it (see example below).

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
