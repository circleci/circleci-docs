---
layout: classic-docs
title: "パイプラインの概要"
description: "このドキュメントでは、パイプラインのコンセプトとパイプラインをトリガーする方法およびパイプラインの内容を紹介します。"
redirect_from: /ja/2.0/api-job-trigger/
version:
  - クラウド
  - Server v3.x
---

ここでは、パイプラインをトリガーする方法やパイプラインの内容を紹介します。 パイプラインの処理やパイプラインで使用できる機能の詳細は、[パイプラインの処理]({{site.baseurl}}/2.0/build-processing)を参照して下さい。

## 概要
{: #overview }

CircleCI パイプラインは、プロジェクトの `.circleci/config.yml` ファイルすべてにおける最高レベルの作業単位です。 パイプラインには、ジョブを管理するワークフローが含まれます。 固定の直線的なライフサイクルがあり、特定のユーザーに関連付けられています。 パイプラインは、変更が CircleCI 設定ファイルを含むプロジェクトにプッシュされた際にトリガーされますが、 CircleCI アプリケーションから又は API を使用して手動でスケジュールを設定したりトリガーすることもできます。

ハイプラインは CircleCI Server v2.x では使用できません。

CircleCI ダッシュボードにアクセスすると、お客様の組織またはアカウントで最近トリガーされたパイプラインのリストが表示されます。

![CircleCI アプリのパイプラインダッシュボードのスクリーンショット]({{ site.baseurl }}/assets/img/docs/pipelines-dashboard.png)

## パイプラインのトリガー
{: #running-a-pipeline }

パイプラインをトリガーする方法は複数あります。 それぞれの方法を下記でご紹介します。

### コードリポジトリへのプッシュ時にパイプラインをトリガーする
{: #run-a-pipeline-on-commit-to-your-code-repository }

プロジェクトのcode>.circleci/config.yml</code> ファイルが含まれるブランチにコミットがプッシュされる度にパイプラインがトリガーされます。

### CircleCI アプリからパイプラインをトリガーする
{: #run-a-pipeline-from-the-circleci-app }

CircleCI アプリで特定のブランチを選択すると、**Trigger Pipeline** ボタンが有効になります。 **Trigger Pipeline** をクリックし、パイプラインのパラメーターを指定するかどうかを選択し、**Trigger Pipeline** を再度クリックします。

### API を使ってパイプラインをトリガーする
{: #run-a-pipeline-using-the-api }

[新しいパイプラインをトリガーする]({{site.baseurl}}/api/v2/#operation/triggerPipeline)ためのエンドポイントを使って、特定のプロジェクト用のパイプラインをトリガーすることができます。


<!---
### Scheduling a pipeline
{: #scheduling-a-pipeline }

TBC
--->

## パイプラインのアーキテクチャ
{: #pipeline-architecture }

パイプラインはワークフローで構成され、ワークフローはジョブで構成されます。 パイプラインのいずれかのジョブに移動すると、各タブからジョブ出力、テスト結果、アーティファクトにアクセスできます。

![CircleCI Web アプリの ジョブタブオプション]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

さらに、それぞれのジョブからの出力は、一意のリンクを持つ新しいタブ (未加工またはフォーマット済みの形式) で開くことができ、チーム メンバー間で共有できます。

![ジョブのステップのアウトプットをダウンロード、シェアするボタン]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
