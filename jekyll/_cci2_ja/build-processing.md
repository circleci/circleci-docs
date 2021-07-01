---
layout: classic-docs
title: "パイプラインの有効化"
short-title: "パイプラインの有効化"
description: "パイプラインを有効にする方法"
categories:
  - settings
order: 1
version:
  - Cloud
---

CircleCI API または自動キャンセルのワークフローからワークフローをトリガーする必要がある場合に、パイプライン エンジンを有効化する方法を説明します。 パイプラインは、現在オンプレミス版の CircleCI Server ではサポートされていません。

* 目次
{:toc}

## はじめに
{: #what-are-pipelines }

CircleCI Pipelines encompass the full set of workflows you run when triggering work on your projects in CircleCI. Workflows coordinate the jobs defined within your project configuration.

## パイプラインのメリット
パイプライン機能を使用すると、[ワークフローを含むビルドをトリガーする新しい API エンドポイント](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview)を使用して、以下のユース ケースに対応できるようになります。

Pipelines offer the following benefits:

{% include snippets/pipelines-benefits.adoc %}

## トラブルシューティング
{: #implications-of-pipelines }

When using pipelines, please note the following:

- アンカーは、アプリケーションの設定ファイルに表示されることなく、処理されて解決されます。

## 制限事項
このセクションでは、パイプラインへの移行プロセスについて概説します。

The following sections outline the process of transitioning to pipelines.

### 2.0 構成でのパイプライン
{: #pipelines-with-20-configuration }
{:.no_toc}

2.0 構成でパイプラインを使用する場合、CircleCI では `CIRCLE_COMPARE_URL` 環境変数がすべてのジョブに挿入され、下位互換性が確保されます。 この環境変数は、従来のジョブで使用可能な環境変数とは異なる方法で生成され、いつでも使用できるわけではありません。 たとえば、空のリポジトリへのコミットを初めてプッシュした場合や、追加のコミットなしに新しいブランチが作成/プッシュされた場合など、以前のリビジョンが存在しない場合は挿入されません。

## パイプラインへの移行
バージョン `2.1` 構成を使用すると、パイプラインが自動的に有効になり、[パイプライン値](https://circleci.com/ja/docs/2.0/pipeline-variables/#パイプライン値)など、`2.1` 専用の機能を利用できるようになります。
{:.no_toc}

If you have feedback, suggestions, or comments:

- CircleCI の Twitter アカウント (@CircleCIJapan) 宛てにツイートする
- [アイデア ボード](https://ideas.circleci.com/)で既存の投稿に投票する、または投稿を追加する

## ブランチでのパイプラインのオプトイン
{: #see-also }
{:.no_toc}

詳細については、「[ビルドのスキップとキャンセル]({{ site.baseurl }}/ja/2.0/skip-build/#冗長ビルドの自動キャンセル)」を参照してください。
