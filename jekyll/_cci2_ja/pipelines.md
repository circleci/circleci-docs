---
layout: classic-docs
title: "パイプラインの概要"
description: "このドキュメントでは、パイプラインのコンセプトとパイプラインをトリガーする方法およびパイプラインの内容を紹介します。"
redirect_from: /ja/api-job-trigger/
version:
  - クラウド
  - Server v3.x
---

CircleCI パイプラインは、プロジェクトのすべての `.circleci/config.yml` ファイルを含む最高レベルの作業単位です。 パイプラインには、ジョブを管理するワークフローが含まれます。 固定の直線的なライフサイクルがあり、特定のユーザーに関連付けられています。 パイプラインは、変更が CircleCI 設定ファイルを含むプロジェクトにプッシュされた際にトリガーされますが、 CircleCI アプリケーションから又は API を使用して手動でスケジュールを設定したりトリガーすることもできます。

CircleCI ダッシュボードにアクセスすると、お客様の組織またはアカウントで最近トリガーされたパイプラインのリストが表示されます。

![CircleCI アプリのパイプラインダッシュボードのスクリーンショット]({{ site.baseurl }}/assets/img/docs/pipelines-dashboard.png)

## パイプラインのアーキテクチャ
{: #pipeline-architecture }

パイプラインはワークフローで構成され、ワークフローはジョブで構成されます。 パイプラインのいずれかのジョブに移動すると、各タブからジョブ出力、テスト結果、アーティファクトにアクセスできます。

![CircleCI Web アプリの ジョブタブオプション]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

さらに、それぞれのジョブからの出力は、一意のリンクを持つ新しいタブ (未加工またはフォーマット済みの形式) で開くことができ、チーム メンバー間で共有できます。

![ジョブのステップのアウトプットをダウンロード、シェアするボタン]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)

## 次のステップ
{: #next-steps}
パイプラインのトリガーの詳細については、[トリガーの概要]({{site.baseurl}}/ja/triggers-overview)を参照してください。
