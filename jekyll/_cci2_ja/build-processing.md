---
layout: classic-docs
title: "パイプラインの処理"
description: "ここでは CircleCI パイプラインの詳細およびパイプラインで使用できる機能を紹介します。"
categories:
  - 設定
order: 1
version:
  - クラウド
  - Server v3.x
---

ここでは、CircleCI のパイプラインエンジンを使ってプロジェクトを処理する方法と、パイプラインで使用できる機能の一部について説明します。 パイプラインは、クラウド版 および オンプレミス版 CircleCI Server でご利用いただけます。

* 目次
{:toc}

## はじめに
{: #what-are-pipelines }

CircleCI パイプラインは、プロジェクトのすべての `.circleci/config.yml` ファイルを含む最高レベルの作業単位です。 パイプラインには、ジョブを管理するワークフローが含まれます。 固定の直線的なライフサイクルがあり、特定のユーザーに関連付けられています。 パイプラインは、変更が CircleCI 設定ファイルを含むプロジェクトにプッシュされた際にトリガーされますが、 CircleCI アプリケーションから又は API を使用して手動でスケジュールを設定したりトリガーすることもできます。

ハイプラインは CircleCI Server v2.x では使用できません。

パイプラインでは以下の機能を利用できます。

{% include snippets/ja/pipelines-benefits.adoc %}

## トラブルシューティング
{: #transitioning-to-pipelines }

Server v2.x からv3 に移行する場合、パイプラインを導入する前にプロジェクトの設定を行います。 Server v3.x では、パイプラインが自動的に有効化されるため、プロジェクトの設定 (` .circleci/_config.yml`) を` version: 2.1` に変更するだけで、上記で述べたすべての機能にアクセスすることができます。

### 2.0 設定でのパイプライン
{: #pipelines-with-20-configuration }
{:.no_toc}

クラウド版や Server v3.x をご使用の場合は、CircleCI パイプラインエンジンは自動的に有効化されます。 何らかの理由により、2.0 設定を継続する場合、`CIRCLE_COMPARE_URL` 環境変数がすべてのジョブに挿入され、下位互換性が確保されます。

この環境変数は、従来のジョブで使用可能な環境変数とは異なる方法で生成され、いつでも使用できるわけではありません。たとえば、空のリポジトリへのコミットを初めてプッシュした場合や、追加のコミットなしに新しいブランチが作成/プッシュされた場合など、以前のリビジョンが存在しない場合は挿入されません。

## 関連項目
{: #see-also }
{:.no_toc}

詳細については、[ビルドのスキップとキャンセル]({{ site.baseurl }}/ja/skip-build/#auto-cancelling-a-redundant-build)のページを参照してください。
