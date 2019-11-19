---
layout: classic-docs
title: "ステータス"
short-title: "ステータス"
description: "ステータスダッシュボード"
categories:
  - getting-started
order: 1
---

<hr />

| バッジ                                                                                       | デバッグ                                                                                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| インテグレーションを利用して、[他の Web ページにステータスバッジを追加]({{ site.baseurl }}/ja/2.0/status-badges/)ことができます。 | If you need to troubleshoot a job, you can [debug failed builds using SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/). |

<hr />

| キューイング                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| If your jobs are queuing, you can switch to either a [performance or custom plan](https://circleci.com/pricing/). For further infomration see our guide to [using credits]({{ site.baseurl }}/2.0/credits/). |

<hr />

![ワークフローの図]({{ site.baseurl }}/assets/img/docs/job_status.png)

CircleCI provides an integrated dashboard showing job status:

- SUCCESS: All jobs passed successfully
- FAILED：1つ以上のジョブが失敗

[ワークフロー]({{ site.baseurl}}/ja/2.0/workflows/#概要)を使用している場合は、上記に加えて[ワークフロー固有のステータス]({{ site.baseurl}}/ja/2.0/workflows/#ステータス値)が表示されます。