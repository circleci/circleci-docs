---
layout: classic-docs
title: "ワークフローが起動しない"
short-title: "ワークフローが起動しない"
description: "ワークフローのビルドまたは起動が行われていないように見える"
categories:
  - troubleshooting
order: 1
---

ワークフロー構成の作成時または修正時に、新しいジョブが表示されない場合は、`config.yml` に構成エラーが発生している可能性があります。

ワークフローがトリガーされないのは、主に構成エラーによってワークフローの起動が妨げられていることが原因です。 そのため、ワークフローがジョブを開始しない事態が発生します。

現在、ワークフローのセットアップ時に構成エラーを確認するには、CircleCI アプリケーションの (*ジョブ ページではなく*) ワークフロー ページをチェックする必要があります。

プロジェクトのジョブ ページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/:PROJECT`

ワークフロー ページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

「NEEDS SETUP (要セットアップ)」と記載された黄色のタグが付いたワークフローを探します。

![無効なワークフロー構成の例]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)