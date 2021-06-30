---
layout: classic-docs
title: "Jira と CircleCI の接続"
categories:
  - how-to
description: "Jira と CircleCI の接続"
---

ここでは、Jira を CircleCI ビルドに接続する方法について説明します。 With the CircleCI JIRA plugin, you can display your build statuses in JIRA.

**Note:** You have to be an JIRA admin to install this plugin.

# Installation steps
{: #installation-steps }

1. Navigate to project settings and select `JIRA integration` ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
2. Atlassian Marketplace にアクセスし、[CircleCI Jira プラグイン](https://marketplace.atlassian.com/apps/1215946/circleci-for-jira?hosting=cloud&tab=overview)を入手します。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_2.png)
3. プラグインをインストールし、プロンプトに従ってセットアップします。![]({{ site.baseurl }}/assets/img/docs/jira_plugin_3.png) ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_4.png)
4. CircleCI の [Jira Integration (Jira インテグレーション)] 設定ページに戻り、生成されたトークンを追加します。

---

# Viewing build and deploy statuses in Jira
{: #viewing-build-and-deploy-statuses-in-jira }

With CircleCI orbs it is possible to display your build and deploy status in Jira Cloud. To do this, you will need to:

1. Make sure you followed the steps above to connect Jira Cloud with CircleCI.
1. `.circleci/config.yml` ファイルの上部で、バージョン `2.1` が使用されていることを確認します。
1. {% include snippets/enable-pipelines.md %}
1. To get an API token for build information retrieval, go to [User Settings > Tokens](https://app.circleci.com/settings/user/tokens) and create a token. そのトークンをコピーします。 (*Note*: older versions of the JIRA orb may require you to retrieve a _Project API Token_, which is accessible from **Project Settings > API Permissions**)
1. To give the integration access to the key, go to **Project Settings -> Environment Variables** and add a variable named _CIRCLE_TOKEN_ with the value being the token you just made.
1. Add the Jira orb to your configuration and invoke it (see example below).

The example config below provides a bare `config.yml` illustrating the use of the Jira Orb.


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
