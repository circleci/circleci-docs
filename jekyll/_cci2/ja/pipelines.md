---
layout: classic-docs
title: "パイプラインの表示"
short-title: "パイプラインの表示"
description: "パイプラインの概要"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

CircleCI アプリケーションの [Pipelines (パイプライン)] ページについて概説すると共に、CircleCI ユーザー インターフェイスの変更について説明します。

## 概要

最近 CircleCI の Web インターフェイスの一部が変更されたことにお気付きかと思います。 ビルドをグループ化する方法と、その情報を表示するユーザー インターフェイスに関して、いくつかの変更を行いました。

まず、**パイプライン**についてご説明しましょう。

パイプラインとは、CircleCI を使用するプロジェクトで作業をトリガーするときに実行される構成全体を指す言葉です。 `.circleci/config.yml` ファイルの全体が 1 つのパイプラインによって実行されます。

これまでサイドバーの [`JOBS` (ジョブ)] が表示されていた場所に、[`Pipelines (パイプライン)`] が表示されるようになりました。

![]({{ site.baseurl }}/assets/img/docs/pipelines-jobs-to-pipelines.png)


## ジョブ、テスト、アーティファクト

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be openened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
