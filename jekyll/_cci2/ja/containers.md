---
layout: classic-docs
title: コンテナを使用する
categories:
  - how-to
description: CircleCI コンテナの使用方法
version:
  - Cloud
---

このページでは、コンテナの基本について説明します。また、お使いのプランで提供されるコンテナを活用してジョブやワークフローの実行を高速化する方法についても解説します。 なお、CircleCI には新たに[従量課金制プラン](https://circleci.com/ja/pricing/usage/)が導入されており、コンテナベースのプランはまもなく廃止となりますのでご注意ください。 現在、コンテナベースのプランを利用してビルドの待機時間が発生している場合は、CircleCI の従量課金制プランへの移行を検討してください。待機時間を短縮できる以外にも、さまざまなメリットが期待できます。

新しい従量課金制プランの詳細については、[こちらのドキュメント]({{ site.baseurl }}/2.0/credits/)を参照してください。

## 概要

バージョン管理システムに変更がコミットされると、CircleCI はコードをチェック アウトし、独立した新しいコンテナをオンデマンドに用意して、その中でワークフローのジョブを実行します。このとき、該当するプランでは以下の処理が可能です。

- **Concurrency** - Utilizing multiple containers to run multiple builds at the same time. To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{ site.baseurl }}/2.0/workflows/) and run your jobs in parallel as shown in the [Sample Config Files document]({{ site.baseurl }}/2.0/sample-config/#concurrent-workflow).

- **Parallelism** - Splitting tests across multiple containers, allowing you to dramatically speed up your test suite. テストを並列で実行するには、[CircleCI の構成に関するドキュメント]({{ site.baseurl }}/2.0/configuration-reference/#parallelism)で説明されているように `.circleci/config.yml` ファイルを変更します。 設定ファイルを変更してテストの分割と並列処理を行い、ビルド時間を短縮する方法については、[テストの並列実行に関するドキュメント]({{ site.baseurl }}/2.0/parallelism-faster-jobs/)をご覧ください。

## Getting started

Linux plans start with the ability to run one workflow, without concurrency, at no charge. 追加のコンテナが必要な場合は、有料の Linux プランを購入してください。 ユーザー登録時に無料プランと有料プランを選択できます。登録後、必要に応じて CircleCI アプリケーションの [Settings (設定)] ページでプランの変更が可能です。

CircleCI のお客様の大半が、フルタイムの開発者 1 人あたり 2 〜 3 個のコンテナをお使いになっています。 チームの規模が拡大したときやワークフローが複雑化したときには、必要な並列処理や同時処理を行えるよう、コンテナを追加してください。

Open source projects include three additional free containers to run jobs concurrently.

## アップグレード

プランのアップグレード手順については、[アップグレードに関するよくあるご質問]({{ site.baseurl }}/2.0/faq/#コンテナ数を増やしビルドの待機時間を解消するにはどのようにコンテナ-プランをアップグレードしたらよいですか)をご覧ください。
