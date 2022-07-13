---
layout: classic-docs
title: "Orb オーサリングの概要"
short-title: "Orb オーサリングの概要"
description: "Orb のオーサリング方法に関する入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
---

* 目次
{:toc}

## クイックスタート
{: #quick-start }

Orbs take [reusable configuration]({{site.baseurl}}/orb-concepts/#orb-configuration-elements) and package it in a way that can be published to the [Orb Registry](https://circleci.com/developer/orbs) and imported into multiple configuration files. 類似した複数のプロジェクトを管理する場合に、Orb を使って設定を抽象化してみましょう。

Before authoring an orb, it is recommended that you become familiar with the [CircleCI config]({{site.baseurl}}/config-intro/) and authoring [parameterized reusable config elements]({{site.baseurl}}/reusing-config/) pages.

Orb は、以下の 3 つの要素で構成されます。

* [コマンド]({{site.baseurl}}/orb-concepts/#commands)
* [ジョブ]({{site.baseurl}}/orb-concepts/#executors)
* [Executor]({{site.baseurl}}/orb-concepts/#jobs)

Practice with [inline orbs]({{site.baseurl}}/reusing-config/#writing-inline-orbs). インライン Orb は 1 つの設定ファイル内で定義できるので、手早く簡単にテストできます。

Orb をオーサリングすると、CircleCI [コード共有利用規約](https://circleci.com/legal/code-sharing-terms/)に同意したものと自動的に見なされます。 パブリッシュされたすべての Orb は、[MIT ライセンス契約](https://opensource.org/licenses/MIT)に基づき、Orb レジストリで公開されます。 詳細については、[Orb ライセンス](https://circleci.com/developer/orbs/licensing)に関するページをご覧ください。
{: class="alert alert-success"}

## はじめよう
{: #getting-started }

### Orb CLI
{: #orb-cli }

To begin creating orbs, you will need to [set up the CircleCI CLI]({{site.baseurl}}/local-cli/#installation) on your local machine, with a [personal access token](https://app.circleci.com/settings/user/tokens). CircleCI CLI のすべてのヘルプ コマンドは、[CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)で参照できます。

### 権限の一覧表
{: #permissions-matrix }

Orb CLI のコマンドは、VCS (バージョン管理システム) によって、ユーザーの権限レベルごとに異なる範囲が設定されています。 組織のオーナーは、オーサリングを行うユーザー自身です。 別の組織の名前空間に対して Orb のオーサリングやパブリッシュを行うには、組織の管理者への支援要請が必要な場合があります。

| Orb コマンド                       | 権限の範囲 |
| ------------------------------ | ----- |
| `circleci namespace create`    | オーナー  |
| `circleci orb init`            | オーナー  |
| `circleci orb create`          | オーナー  |
| `circleci orb publish` 開発バージョン | メンバー  |
| `circleci orb publish` 本番バージョン | オーナー  |
{: class="table table-striped"}

### 名前空間の登録
{: #register-a-namespace }

Every organization registered on CircleCI is able to claim **one** unique [namespace]({{site.baseurl}}/orb-concepts/#namespaces). 「組織」には、自分の個人用組織や自分がメンバーになっている組織が含まれます。 名前空間は各組織またはユーザーアカウントにつき 1 つに制限されているため、組織の名前空間を登録するには、自分が組織の_オーナー_になっている必要があります。

まだ名前空間を要求していない場合は、以下のコマンドを実行して要求できます。
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

**Note:** If you need help finding your organization ID, visit the [Introducrtion to the Circleci Web App]({{site.baseurl}}/introduction-to-the-circleci-web-app) page.

## 次のステップ
{: #next-steps }

* Continue on to the  [Orb Authoring Process]({{site.baseurl}}/orb-author/) guide for information on developing your orb.
* Alternatively, to find out more about orbs read the [Orb Concepts]({{site.baseurl}}/orb-concepts/) page.
