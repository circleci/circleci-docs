---
layout: classic-docs
title: "Cloud から Server への移行"
short-title: "Cloud から Server への移行"
description: "Cloud からの 2.0 Server へのプロジェクト移行"
categories:
  - はじめよう
order: 1
---

CircleCI Cloud (SaaS) から CircleCI Server セットアップに移行するための正式なプロセスやツールセットはありません。 そのため、AWS と Terraform を使用して CircleCI Server を新規にインストールします。 詳細については、[こちらのインストール手順]({{ site.baseurl }}/ja/2.0/aws)を参照してください。

インストールが完了したら、コンテキスト、環境変数、API トークンなどのすべてのプロジェクト設定を手動でコピーする必要があります。

**メモ:** プロジェクトのビルド履歴を SaaS から取り出すことはできません。 Server にすべてのプロジェクトを再度追加する必要があります。

SaaS で動作している 2.0 `config.yml` ファイルであれば、Server でもそのまま問題なく動作します。 ただし、1.0 の実行環境にはわずかな違いがあるため、一部の 1.0 設定ファイルは SaaS から Server に 100% 変換できない可能性があります。

カスタムの `machine` Executor AMI および構成可能なインスタンスの種類は、特定の方法で定義されます。 そのため、Server ビルド クラスタを定義するときには、チームが[構成可能なリソース](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class) (`resource_class`) を SaaS でどのように使用しているかを考慮してください。

## 制限事項
{: #limitations }

- 現在、`macos` Executor は Server でサポートされていません。
- Bitbucket は Server でサポートされていません。 Server でサポートされている VCS は、GitHub および GitHub Enterprise のみです。
