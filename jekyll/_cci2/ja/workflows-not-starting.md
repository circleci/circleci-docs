---
layout: classic-docs
title: "ワークフローが起動しない"
short-title: "ワークフローが起動しない"
description: "ワークフローのビルドまたは起動が行われていないように見える"
categories:
  - troubleshooting
order: 1
---

ワークフロー設定の作成時または修正時に、新しいジョブが表示されない場合は、`config.yml` に設定エラーが発生している可能性があります。

ワークフローがトリガーされないのは、主に設定エラーによってワークフローの起動が妨げられていることが原因です。 そのため、ワークフローがジョブを開始しない事態が発生します。

現在、ワークフローの設定時に設定エラーを確認するには、CircleCI アプリケーションの *ジョブページではなく*、ワークフローページをチェックする必要があります。

プロジェクトのジョブページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/:PROJECT`

ワークフローページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

「Needs Setup (要セットアップ)」と記載された黄色のタグが付いたワークフローを探します。

![無効なワークフロー設定の例]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)