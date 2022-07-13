---
layout: classic-docs
title: "ステータス"
short-title: "ステータス"
description: "ステータス ダッシュボード"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

<hr />

| バッジ                                                                                                      | デバッグ                                                                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Integrations enable you to [include status badges in other web pages]({{ site.baseurl }}/status-badges/) | If you need to troubleshoot a job, you can [debug failed builds using SSH]({{ site.baseurl }}/ssh-access-jobs/). |

<hr />

| キューイング                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ジョブの待機時間が発生している場合は、[Performance プランまたは Custom プラン](https://circleci.com/ja/pricing/)への切り替えによって解消できる可能性があります。 For further information see our guide to [using credits]({{ site.baseurl }}/credits/). |

<hr />

![ワークフローの図]( {{ site.baseurl }}/assets/img/docs/job_status.png)

CircleCI の統合ダッシュボードでは、最後に完了したジョブ実行について以下のステータスが表示されます。

- SUCCESS: すべてのジョブが成功
- FAILED: 1 つ以上のジョブが失敗

If you are using [workflows]({{ site.baseurl}}/workflows/#overview) you may see other [workflow-specific statuses]({{ site.baseurl}}/workflows/#states).
