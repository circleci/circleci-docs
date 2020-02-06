---
layout: classic-docs
title: コンテナを使用する
categories: [how-to]
description: CircleCI コンテナの使用方法
---

このページでは、コンテナの基本について説明します。また、お使いのプランで提供されるコンテナを活用してジョブや Workflows の実行を高速化する方法についても解説します。

## 概要

VCS システムに変更がコミットされると、CircleCI はコードをチェックアウトし、独立した新しいコンテナをオンデマンドに用意して、その中で Workflows のジョブを実行します。このとき、該当するプランでは以下の処理が可能です。

- **同時処理** - 複数のコンテナを使用して、複数のビルドを同時に実行できます。同時処理を行うには、[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/2.0/workflows/)のページを参考に開発 Workflows を設定し、[2.0 コンフィグファイルのサンプル]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-concurrent-jobs)のページに示す方法でジョブを並列実行してください。

- **並列処理** - テストを複数のコンテナに分割することで、テスト全体のスピードを大幅に向上できます。テストを並列で実行するには、[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/#parallelism)のページで説明されているように `.circleci/config.yml` ファイルを変更します。コンフィグファイルを変更してテストの分割と並列処理を行い、ビルド時間を短縮する方法については、[テストを並列実行する]({{ site.baseurl }}/2.0/parallelism-faster-jobs/)のページをご覧ください。

## はじめよう

無料の Linux プランでは、同時に実行できる Workflows は 1 つのみで、並列処理は行えません。オープンソースプロジェクトにはさらに 3 つの無料コンテナが提供されるため、ジョブを並列で実行できます。追加のコンテナが必要な場合は、有料の Linux プランを購入してください。ユーザー登録時に無料プランか有料プランを選択できます。登録後に必要になったときには CircleCI アプリの [Settings] ページでプランの変更が可能です。CircleCI のお客様の大半が、フルタイムの開発者 1 人あたり 2 〜 3 個のコンテナをお使いになっています。チームの規模が拡大したときや Workflows が複雑化したときには、必要な並列処理や同時処理を行えるよう、コンテナを追加してください。

## アップグレード

プランのアップグレード手順については、[アップグレードに関するよくあるご質問]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing)のページに詳しく記載しています。
