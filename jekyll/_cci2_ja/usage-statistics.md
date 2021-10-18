---
layout: classic-docs
title: "使用状況統計の利用"
category:
  - administration
order: 1
description: "CircleCI 2.0 の静的インストール スクリプトの使用"
hide: true
---

システム管理者を対象に、使用状況統計の集計結果を CircleCI に自動送信する方法について、以下のセクションに沿って説明します。

* TOC
{:toc}

使用状況統計データを活用すれば、CircleCI Server の可視性が向上するだけでなく、サポートが強化され、CircleCI 1.0 から CircleCI 2.0 への移行がスムーズに行えます。

Opt-In to this feature by going to Settings > Usage Statistics on the management console in Replicated. 次に、以下のスクリーンショットに示すように、[Automatically send some usage statistics to CircleCI (使用状況統計を自動的に CircleCI に送信)] チェックボックスをオンにします。

![](  {{ site.baseurl }}/assets/img/docs/usage-statistics-setting.png)

## Detailed usage statistics
{: #detailed-usage-statistics }

以下のセクションでは、この設定を有効にした場合に CircleCI が収集する使用状況統計に関する情報を提供します。

### Weekly account usage
{: #weekly-account-usage }

| **名前**                | **種類** | **用途**                                |
| --------------------- | ------ | ------------------------------------- |
| account_id            | UUID   | _各 vcs アカウントを一意に識別します。_               |
| usage_current_macos | 分      | _各アカウントについて、1 週間で実行されたビルドを分単位で記録します。_ |
| usage_legacy_macos  | 分      |                                       |
| usage_current_linux | 分      |                                       |
| usage_legacy_linux  | 分      |                                       |
{: class="table table-striped"}

### Weekly job activity
{: #weekly-job-activity }

| **名前**                                 | **種類** | **用途**                                                                                                   |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| utc_week                               | 日付     | _以下のデータが適用される週を識別します。_                                                                                   |
| usage_oss_macos_legacy               | 分      | _1 週間で実行されたビルドを記録します。_                                                                                   |
| usage_oss_macos_current              | 分      |                                                                                                          |
| usage_oss_linux_legacy               | 分      |                                                                                                          |
| usage_oss_linux_current              | 分      |                                                                                                          |
| usage_private_macos_legacy           | 分      |                                                                                                          |
| usage_private_macos_current          | 分      |                                                                                                          |
| usage_private_linux_legacy           | 分      |                                                                                                          |
| usage_private_linux_current          | 分      |                                                                                                          |
| new_projects_oss_macos_legacy      | 合計     | _Captures new Builds performed on 1.0. Observe if users are starting new projects on 1.0._               |
| new_projects_oss_macos_current     | 合計     |                                                                                                          |
| new_projects_oss_linux_legacy      | 合計     |                                                                                                          |
| new_projects_oss_linux_current     | 合計     |                                                                                                          |
| new_projects_private_macos_legacy  | 合計     |                                                                                                          |
| new_projects_private_macos_current | 合計     |                                                                                                          |
| new_projects_private_linux_legacy  | 合計     |                                                                                                          |
| new_projects_private_linux_current | 合計     |                                                                                                          |
| projects_oss_macos_legacy            | 合計     | _Captures Builds performed on 1.0 and 2.0. Observe if users are moving towards 2.0 or staying with 1.0._ |
| projects_oss_macos_current           | 合計     |                                                                                                          |
| projects_oss_linux_legacy            | 合計     |                                                                                                          |
| projects_oss_linux_current           | 合計     |                                                                                                          |
| projects_private_macos_legacy        | 合計     |                                                                                                          |
| projects_private_macos_current       | 合計     |                                                                                                          |
| projects_private_linux_legacy        | 合計     |                                                                                                          |
| projects_private_linux_current       | 合計     |                                                                                                          |
{: class="table table-striped"}

## Accessing usage data
{: #accessing-usage-data }
このデータにプログラムでアクセスして、組織内の使用状況をさらに詳しく把握したいときには、Services VM からこのコマンドを実行します。

`docker exec usage-stats /src/builds/extract`

### Security and privacy
{: #security-and-privacy }

セキュリティとプライバシーに関する CircleCI の開示情報は、契約条件の別紙 C および CircleCI の[標準ライセンス契約](https://circleci.com/legal/enterprise-license-agreement/)にてご覧いただけます。
