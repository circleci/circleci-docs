---
layout: classic-docs
title: "パイプラインの有効化"
short-title: "パイプラインの有効化"
description: "パイプラインを有効にする方法"
categories:
  - settings
order: 1
version:
  - クラウド
  - Server v3.x
---

CircleCI API または自動キャンセルのワークフローからワークフローをトリガーする必要がある場合に、パイプライン エンジンを有効化する方法を説明します。 Pipelines are available on CircleCI cloud and self hosted installations of CircleCI server v3.x.

* 目次
{:toc}

## はじめに
{: #what-are-pipelines }

CircleCI Pipelines encompass the full set of workflows you run when triggering work on your projects in CircleCI. Workflows coordinate the jobs defined within your project configuration.

## パイプラインのメリット
{: #benefits-of-using-pipelines }

Pipelines offer the following benefits:

{% include snippets/pipelines-benefits.adoc %}

## トラブルシューティング
{: #implications-of-pipelines }

When using pipelines, please note the following:

- アンカーは、アプリケーションの設定ファイルに表示されることなく、処理されて解決されます。

## トラブルシューティング
{: #transitioning-to-pipelines }

The following sections outline the process of transitioning to pipelines.

### 2.0 構成でのパイプライン
{: #pipelines-with-20-configuration }
{:.no_toc}

2.0 構成でパイプラインを使用する場合、CircleCI では `CIRCLE_COMPARE_URL` 環境変数がすべてのジョブに挿入され、下位互換性が確保されます。 この環境変数は、従来のジョブで使用可能な環境変数とは異なる方法で生成され、いつでも使用できるわけではありません。 たとえば、空のリポジトリへのコミットを初めてプッシュした場合や、追加のコミットなしに新しいブランチが作成/プッシュされた場合など、以前のリビジョンが存在しない場合は挿入されません。

## パイプラインへの移行
{: #giving-feedback }
{:.no_toc}

If you have feedback, suggestions, or comments:

- CircleCI の Twitter アカウント (@CircleCIJapan) 宛てにツイートする
- [アイデア ボード](https://ideas.circleci.com/)で既存の投稿に投票する、または投稿を追加する

## ブランチでのパイプラインのオプトイン
{: #see-also }
{:.no_toc}

詳細については、「[ビルドのスキップとキャンセル]({{ site.baseurl }}/ja/2.0/skip-build/#冗長ビルドの自動キャンセル)」を参照してください。
