---
layout: このスクリプトは、上記のコマンドを使用してインスタンスをドレインモードに設定し、インスタンス上で実行中のジョブをモニタリングし、ジョブが完了するのを待ってからインスタンスを終了します。
title: "Cloud から Server への移行"
short-title: "Cloud から Server への移行"
description: "Cloud からの 2.0 Server へのプロジェクト移行"
categories:
  - はじめよう
order: 1
---

CircleCI Cloud (SaaS) から CircleCI Server セットアップに移行するための正式なプロセスやツールセットはありません。 The process is to perform a fresh install of CircleCI server, using AWS and Terraform—see [Installation]({{ site.baseurl }}/2.0/aws) for instructions.

インストールが完了したら、コンテキスト、環境変数、API トークンなどのすべてのプロジェクト設定を手動でコピーする必要があります。

**メモ:** プロジェクトのビルド履歴を SaaS から取り出すことはできません。 Server にすべてのプロジェクトを再度追加する必要があります。

SaaS で動作している 2.0 `config.yml` ファイルであれば、Server でもそのまま問題なく動作します。 There are small differences between the 1.0 execution environments that may result in some 1.0 configs not translating 100% from SaaS to Server.

カスタムの `machine` Executor AMI および構成可能なインスタンスの種類は、特定の方法で定義されます。 そのため、Server ビルド クラスタを定義するときには、チームが[構成可能なリソース](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class) (`resource_class`) を SaaS でどのように使用しているかを考慮してください。

## 制限事項
{: #limitations }

- 現在、`macos` Executor は Server でサポートされていません。
- Bitbucket は Server でサポートされていません。 Server でサポートされている VCS は、GitHub および GitHub Enterprise のみです。
