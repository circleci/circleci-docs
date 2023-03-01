---
layout: classic-docs
title: "パイプラインの概要"
description: "このドキュメントでは、パイプラインのコンセプトとパイプラインをトリガーする方法およびパイプラインの内容を紹介します。"
redirect_from: /ja/api-job-trigger/
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

CircleCI パイプラインは、プロジェクトのすべての `.circleci/config.yml` ファイルを含む最高レベルの作業単位です。 パイプラインには、ジョブを管理するワークフローが含まれます。 固定の直線的なライフサイクルがあり、特定のユーザーに関連付けられています。 パイプラインは、変更が CircleCI 設定ファイルを含むプロジェクトにプッシュされた際にトリガーされますが、 CircleCI アプリケーションから又は API を使用して手動でスケジュールを設定したりトリガーすることもできます。

CircleCI ダッシュボードにアクセスすると、お客様の組織またはアカウントで最近トリガーされたパイプラインのリストが表示されます。

![CircleCI アプリのパイプラインダッシュボードのスクリーンショット](/docs/assets/img/docs/pipelines-dashboard.png)

## パイプラインのアーキテクチャ
{: #pipeline-architecture }

パイプラインはワークフローで構成され、ワークフローはジョブで構成されます。 By navigating from a pipeline to a specific job, you can access your job output, test results, and artifacts through several tabs.

![CircleCI Web アプリの ジョブタブオプション](/docs/assets/img/docs/pipelines-job-step-test-artifact.png)

The output of each job can be opened in a new tab (in either raw or formatted styling) with a unique link, making it shareable between team members.

![ジョブのステップのアウトプットをダウンロード、シェアするボタン](/docs/assets/img/docs/pipelines-job-output.png)

## 次のステップ
{: #next-steps}
Find out more about triggering pipelines in the [Triggers Overview](/docs/triggers-overview/).
