---
layout: classic-docs
title: "JIRA と CircleCI の接続"
categories:
  - how-to
description: "JIRA と CircleCI の接続"
---

ここでは、JIRA を CircleCI ビルドに接続する方法について説明します。 With the CircleCI JIRA plugin, you can create JIRA tickets directly from your Jobs page, allowing you to assign tasks and fixes based on the status of your job, as well as display your build statuses in Jira.

**メモ：**CircleCI JIRA プラグインは JIRA 管理者のみがインストールできます。

# インストール手順

1. Navigate to project settings (from the project's jobs page, click the gear icon in the upper right). Under `Permissions`, click on `JIRA integration` ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Atlassian Marketplace にアクセスし、[CircleCI JIRA プラグイン](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)を入手します。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. プラグインをインストールし、プロンプトに従って設定します。![]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png) ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. CircleCI の [JIRA Integration (JIRA インテグレーション)] 設定ページに戻り、生成されたトークンを追加します。

* * *

# ジョブページでの JIRA チケットの作成

インテグレーションを追加し、ジョブの詳細ページに移動すると、JIRA アイコンが有効になっています。

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_5.png)

JIRA アイコンをクリックし、以下を指定します。

- プロジェクト名
- 課題のタイプ
- 課題の概要
- 説明

![]({{ site.baseurl }}/assets/img/docs/jira_plugin_6.png)

メモ：現在、JIRA プラグインはデフォルトのフィールドのみをサポートしています。

これで、ジョブ出力ページからすばやくチケットを作成できるようになります。

# Viewing Build and Deploy Statuses in Jira

With CircleCI orbs it is also possible to display your build and deploy status in Jira. To do this, you will need to:

1. Make sure you followed the steps above to connect Jira with CircleCI.
2. Make sure that you are using version `2.1` at the top of your `.circleci/config.yml` file.
3. If you do not already have pipelines enabled, go to **Project Settings -> Build Settings -> Advanced Settings** and enable them.
4. To get an API token for build information retrieval, go to **Project Settings -> Permissions -> API Permissions** and create a token with **Scope: all**. Copy the token.
5. To allow the integration to then use that key, go to **Project Settings -> Build Settings -> Environment Variables** and add a variable named *CIRCLE_TOKEN* with the value being the token you just made.
6. Add the orb stanza, invoking the Jira orb.
7. Use the Jira orb in a step.

The example config below provides a bare `config.yml` illustrating the use of the Jira Orb.

```yaml
jobs:
  build:
    docker:
      - image: 'circleci/node:10'
    steps:
      - run: echo "hello"
orbs:
  jira: circleci/jira@1.0.5
version: 2.1
workflows:
  build:
    jobs:
      - build:
          post-steps:
            - jira/notify
```