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
  - Server v3.x
---

CircleCI API または自動キャンセルのワークフローからワークフローをトリガーする必要がある場合に、パイプライン エンジンを有効化する方法を説明します。 パイプラインは クラウド版 および オンプレミス版 CircleCI Server でご利用いただけます。

* 目次
{:toc}

## はじめに
{: #what-are-pipelines }

CircleCI のパイプラインには、 CircleCI のプロジェクトで作業をトリガーするときに実行する一連のワークフローがすべて含まれます。 ワークフローはプロジェクトの設定で定義したジョブを調整します。

## パイプラインのメリット
{: #benefits-of-using-pipelines }

パイプラインには以下のメリットがあります。

{% include snippets/pipelines-benefits.adoc %}

## トラブルシューティング
{: #implications-of-pipelines }

パイプラインを使用する際は、次の点に注意してください。

- ビルドまたはワークフローが定義されていない場合は、エラーとなります。

## トラブルシューティング
{: #transitioning-to-pipelines }

以下のセクションでは、パイプラインへの移行プロセスについて概説します。

### 2.0 構成でのパイプライン
{: #pipelines-with-20-configuration }
{:.no_toc}

2.0 構成でパイプラインを使用する場合、CircleCI では `CIRCLE_COMPARE_URL` 環境変数がすべてのジョブに挿入され、下位互換性が確保されます。 この環境変数は、従来のジョブで使用可能な環境変数とは異なる方法で生成され、いつでも使用できるわけではありません。 たとえば、空のリポジトリへのコミットを初めてプッシュした場合や、追加のコミットなしに新しいブランチが作成/プッシュされた場合など、以前のリビジョンが存在しない場合は挿入されません。

## パイプラインへの移行
{: #giving-feedback }
{:.no_toc}

フィードバック、ご提案、コメントは、以下の方法でお寄せください。

- CircleCI の Twitter アカウント (@CircleCIJapan) 宛てにツイートする
- [アイデア ボード](https://ideas.circleci.com/)で既存の投稿に投票する、または投稿を追加する

## ブランチでのパイプラインのオプトイン
{: #see-also }
{:.no_toc}

詳細については、[ビルドのスキップとキャンセル]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build)を参照してください。
