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

The following sections provide information about the usage statistics CircleCI will gather when this setting is enabled.

### Weekly account usage
{: #weekly-account-usage }

| **Name**              | **Type** | **Purpose**                                                   |
| --------------------- | -------- | ------------------------------------------------------------- |
| account_id            | UUID     | _Uniquely identifies each vcs account_                        |
| usage_current_macos | minutes  | _For each account, track weekly builds performed in minutes._ |
| usage_legacy_macos  | minutes  |                                                               |
| usage_current_linux | minutes  |                                                               |
| usage_legacy_linux  | minutes  |                                                               |
{: class="table table-striped"}

### Weekly job activity
{: #weekly-job-activity }

| **Name**                               | **Type** | **Purpose**                                                                                              |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| utc_week                               | date     | _Identifies which week the data below applies to_                                                        |
| usage_oss_macos_legacy               | minutes  | _Track builds performed by week_                                                                         |
| usage_oss_macos_current              | minutes  |                                                                                                          |
| usage_oss_linux_legacy               | minutes  |                                                                                                          |
| usage_oss_linux_current              | minutes  |                                                                                                          |
| usage_private_macos_legacy           | minutes  |                                                                                                          |
| usage_private_macos_current          | minutes  |                                                                                                          |
| usage_private_linux_legacy           | minutes  |                                                                                                          |
| usage_private_linux_current          | minutes  |                                                                                                          |
| new_projects_oss_macos_legacy      | sum      | _Captures new Builds performed on 1.0. Observe if users are starting new projects on 1.0._               |
| new_projects_oss_macos_current     | sum      |                                                                                                          |
| new_projects_oss_linux_legacy      | sum      |                                                                                                          |
| new_projects_oss_linux_current     | sum      |                                                                                                          |
| new_projects_private_macos_legacy  | sum      |                                                                                                          |
| new_projects_private_macos_current | sum      |                                                                                                          |
| new_projects_private_linux_legacy  | sum      |                                                                                                          |
| new_projects_private_linux_current | sum      |                                                                                                          |
| projects_oss_macos_legacy            | sum      | _Captures Builds performed on 1.0 and 2.0. Observe if users are moving towards 2.0 or staying with 1.0._ |
| projects_oss_macos_current           | sum      |                                                                                                          |
| projects_oss_linux_legacy            | sum      |                                                                                                          |
| projects_oss_linux_current           | sum      |                                                                                                          |
| projects_private_macos_legacy        | sum      |                                                                                                          |
| projects_private_macos_current       | sum      |                                                                                                          |
| projects_private_linux_legacy        | sum      |                                                                                                          |
| projects_private_linux_current       | sum      |                                                                                                          |
{: class="table table-striped"}

## Accessing usage data
{: #accessing-usage-data }
If you would like programatic access to this data in order to better understand your users you may run this command from the Services VM.

`docker exec usage-stats /src/builds/extract`

### Security and privacy
{: #security-and-privacy }

Please reference exhibit C within your terms of contract and our [standard license agreement](https://circleci.com/legal/enterprise-license-agreement/) for our complete security and privacy disclosures.
