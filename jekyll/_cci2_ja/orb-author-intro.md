---
layout: classic-docs
title: "Orb の作成の概要"
short-title: "Orb の作成の概要"
description: "Orb の作成方法に関する入門ガイド"
categories:
  - はじめよう
order: 1
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

* 目次
{:toc}

## クイックスタート
{: #quick-start }

Orb とは、[再利用可能な設定]({{site.baseurl}}/ja/orb-concepts/#orb-configuration-elements)をパッケージとしてまとめたものです。 Orb は [Orb レジストリ](https://circleci.com/developer/orbs)にパブリッシュしたり、複数の設定ファイルにインポートすることができます。 類似した複数のプロジェクトを管理する場合に、Orb を使って設定を抽象化してみましょう。

Orb の作成を始める前に、まず [CircleCI の設定ファイル]({{site.baseurl}}/ja/config-intro/)に関するページと、[パラメーター化された再利用可能な設定要素]({{site.baseurl}}/ja/reusing-config/)の作成に関するページの説明をよく理解することをお勧めします。

Orb は、以下の 3 つの要素で構成されます。

* [コマンド]({{site.baseurl}}/ja/orb-concepts/#commands)
* [ジョブ]({{site.baseurl}}/ja/orb-concepts/#executors)
* [Executor]({{site.baseurl}}/ja/orb-concepts/#jobs)

[インライン Orb]({{site.baseurl}}/ja/reusing-config/#writing-inline-orbs) を使って練習してみましょう。 インライン Orb は 1 つの設定ファイル内で定義できるので、手早く簡単にテストできます。

Orb の作成者は、CircleCI [コード共有利用規約](https://circleci.com/legal/code-sharing-terms/)に同意したものと自動的に見なされます。 パブリッシュされたすべての Orb は、[MIT ライセンス契約](https://opensource.org/licenses/MIT)に基づき、Orb レジストリで公開されます。 詳細については、[Orb ライセンス](https://circleci.com/developer/orbs/licensing)に関するページをご覧ください。
{: class="alert alert-success"}

## はじめよう
{: #getting-started }

### Orb CLI
{: #orb-cli }

Orb の作成を始めるには、[パーソナルアクセストークン](https://app.circleci.com/settings/user/tokens)を使用して、ローカルマシンに [CircleCI CLI をセットアップ]({{site.baseurl}}/ja/local-cli/#installation)する必要があります。 CircleCI CLI のすべてのヘルプ コマンドは、[CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)で参照できます。

### 権限の一覧表
{: #permissions-matrix }

Orb CLI のコマンドは、VCS (バージョン管理システム) によって、ユーザーの権限レベルごとに異なる範囲が設定されています。 お客様は、お客様の組織のオーナーです。 別の組織がオーナーである名前空間向けに Orb を作成したり、パブリッシュするには、お客様の組織の管理者の支援が必要になる場合があります。

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

CircleCI に登録している組織は、一意の[名前空間]({{site.baseurl}}/ja/orb-concepts/#namespaces)を **1 つ**要求できます。 「組織」には、自分の個人用組織や自分がメンバーになっている組織が含まれます。 名前空間は各組織またはユーザーアカウントにつき 1 つに制限されているため、組織の名前空間を登録するには、自分が組織の_オーナー_になっている必要があります。

まだ名前空間を要求していない場合は、以下のコマンドを実行して要求できます。
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

**注:** 組織 ID の見つけ方については、[CircleCI Web アプリの概要]({{site.baseurl}}/ja/introduction-to-the-circleci-web-app)のページをご覧ください。

## 次のステップ
{: #next-steps }

* Orb の作成について解説した [Orb の作成プロセス]({{site.baseurl}}/ja/orb-author/) ガイドに進んでください。
* または、[ Orb のコンセプト]({{site.baseurl}}/ja/orb-concepts/)のページで詳細をご確認下さい。
