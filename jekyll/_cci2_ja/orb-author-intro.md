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
---

* 目次
{:toc}

## クイックスタート
{: #quick-start }

Orb とは、[再利用可能な構成]({{site.baseurl}}/2.0/orb-concepts/#orb-configuration-elements)をパッケージとしてまとめたものです。 Orb は [Orb レジストリ](https://circleci.com/developer/orbs)にパブリッシュしたり、複数の設定ファイルにインポートしたりすることができます。 類似した複数のプロジェクトを管理する場合に、Orb を使って構成を抽象化してみましょう。

Orb のオーサリングを始める前に、まず [CircleCI の設定ファイル]({{site.baseurl}}/2.0/config-intro/)に関するページと、[パラメーター化された再利用可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)のオーサリングに関するページの説明をよく理解することをお勧めします。

Orb は、以下の 3 つの要素で構成されます。

* [コマンド]({{site.baseurl}}/ja/2.0/orb-concepts/#commands)
* [ジョブ]({{site.baseurl}}/ja/2.0/orb-concepts/#executors)
* [Executor]({{site.baseurl}}/ja/2.0/orb-concepts/#jobs)

[インライン Orb]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs) を使って練習してみましょう。 インライン Orb は 1 つの設定ファイル内で定義できるので、手早く簡単にテストできます。

Orb をオーサリングすると、CircleCI [コード共有利用規約](https://circleci.com/legal/code-sharing-terms/)に同意したものと自動的に見なされます。 パブリッシュされたすべての Orb は、[MIT ライセンス契約](https://opensource.org/licenses/MIT)に基づき、Orb レジストリで公開されます。 詳細については、[Orb ライセンス](https://circleci.com/developer/orbs/licensing)に関するページをご覧ください。
{: class="alert alert-success"}

## はじめよう
{: #getting-started }

### Orb CLI
{: #orb-cli }

Orb の作成を始めるには、[パーソナル アクセス トークン](https://app.circleci.com/settings/user/tokens)を使用して、ローカル マシンに [CircleCI CLI をセットアップ]({{site.baseurl}}/2.0/local-cli/#installation)する必要があります。 CircleCI CLI のすべてのヘルプ コマンドは、[CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)で参照できます。

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

CircleCI に登録している組織は、一意の[名前空間]({{site.baseurl}}/2.0/orb-concepts/#namespaces)を **1 つ**要求できます。 「組織」には、自分の個人用組織や自分がメンバーになっている組織が含まれます。 As each organization or user account is limited to a single namespace, in order to register the namespace for an organization you must be the _owner_ of the organization.

_note: Within CircleCI, we sometimes refer to individual users as "organizations" or "personal organizations", since from our perspective there aren't notable differences. Hence some commands refer to an `org-name`. This can simply be your GitHub username._

Enter the following command to claim your namespace, if you have not yet claimed one:
```shell
circleci namespace create <name> <vcs-type> <org-name> [flags]
```

where `name` is the namespace you wish to claim, `vcs-type` is the type of your version control system (i.e. `github` or `bitbucket`), and `org-name` is the name of your organization.

### 次のステップ
{: #next-steps }

Continue on to the  [Orb Authoring Process]({{site.baseurl}}/2.0/orb-author/) guide for information on developing your orb.


## 関連項目
{: #see-also }
{:.no_toc}

- [Orb のオーサリング]({{site.baseurl}}/ja/2.0/orb-author/)
- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/orb-concepts/)
- [Orb オーサリングに関するよくあるご質問]({{site.baseurl}}/ja/2.0/orb-author-faq/)
