---
layout: classic-docs
title: "JIRA と CircleCI の接続"
categories:
  - how-to
description: "JIRA と CircleCI の接続"
---

ここでは、JIRA を CircleCI ビルドに接続する方法について説明します。 CircleCI JIRA プラグインを使用すると、[Jobs (ジョブ)] ページから直接 JIRA チケットを作成でき、ジョブのステータスに基づいてタスクや修正を割り当てることができます。

**メモ：**CircleCI JIRA プラグインは JIRA 管理者のみがインストールできます。

# インストール手順

1. [`integrations (インテグレーション)`] > [`JIRA integration (JIRA インテグレーション)`] で、プロジェクト設定に移動します。 ![]({{ site.baseurl }}/assets/img/docs/jira_plugin_1.png)
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