---
layout: classic-docs
title: "Orb オーサリングの概要"
short-title: "Orb オーサリングの概要"
description: "Orb のオーサリング方法に関する入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

* 目次
{:toc}

## クイックスタート

Orb とは、[再利用可能な構成]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-%E3%81%AE%E6%A7%8B%E9%80%A0)をパッケージとしてまとめたものです。Orb は [Orb レジストリ](https://circleci.com/developer/ja/orbs)にパブリッシュしたり、複数の設定ファイルにインポートしたりすることができます。 類似した複数のプロジェクトを管理する場合に、Orb を使って構成を抽象化することを検討してみてください。

Orb のオーサリングを始める前に、まず [CircleCI の設定ファイル]({{site.baseurl}}/ja/2.0/config-intro/)に関するページと、[パラメーター化された再利用可能な構成要素]({{site.baseurl}}/ja/2.0/reusing-config/)のオーサリングに関するページの説明をよく理解することをお勧めします。

Orb は、以下の 3 つの要素で構成されます。

* [コマンド]({{site.baseurl}}/ja/2.0/orb-concepts/#%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89)
* [ジョブ]({{site.baseurl}}/ja/2.0/orb-concepts/#%E3%82%B8%E3%83%A7%E3%83%96)
* [Executor]({{site.baseurl}}/ja/2.0/orb-concepts/#executor)

[インライン Orb]({{site.baseurl}}/ja/2.0/reusing-config/) を使って練習してみることができます。 インライン Orb は 1 つの設定ファイル内で定義できるので、手早く簡単にテストするのに適しています。

Orb をオーサリングすると、自動的に、CircleCI [コード共有利用規約](https://circleci.com/legal/code-sharing-terms/)に同意したものと見なされます。 パブリッシュされたすべての Orb は、[MIT ライセンス契約](https://opensource.org/licenses/MIT)に基づき、Orb レジストリで公開されます。 詳細については、[Orb ライセンス](https://circleci.com/developer/ja/orbs/licensing)に関するページをご覧ください。
{: class="alert alert-success"}

## はじめよう

### Orb CLI

Orb の作成を始めるには、[パーソナル アクセス トークン](https://app.circleci.com/settings/user/tokens)を使用して、ローカル マシンに [CircleCI CLI をセットアップ]({{site.baseurl}}/ja/2.0/local-cli/#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)する必要があります。 [CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)にアクセスすると、CircleCI CLI に含まれている Orb 関連のすべてのコマンドが記載されたリストを確認できます。

### 権限の一覧表

Orb CLI のコマンドは、VCS (バージョン管理システム) によって、ユーザーの権限レベルごとに異なる範囲が設定されています。 組織の「オーナー」は、オーサリングを行うユーザー自身です。 別の組織がオーナーである名前空間向けに Orb のオーサリングやパブリッシュを行う際は、組織の管理者への支援要請が必要になる場合があります。

| Orb コマンド | 権限の範囲 |
| ------------------------------ | ----- |
| `circleci namespace create`    | オーナー  |
| `circleci orb init`            | オーナー  |
| `circleci orb create`          | オーナー  |
| `circleci orb publish` 開発バージョン | メンバー  |
| `circleci orb publish` 本番バージョン | オーナー  |
{: class="table table-striped"}

### 名前空間の登録

CircleCI に登録している組織は、一意の[名前空間]({{site.baseurl}}/ja/2.0/orb-concepts/#%E5%90%8D%E5%89%8D%E7%A9%BA%E9%96%93)を **1 つ**要求できます。 「組織」には、自分の個人用組織や自分がメンバーになっている組織が含まれます。 名前空間は各組織に 1 つに制限されているため、組織の名前空間を登録するには、自分が組織の _オーナー_ になっている必要があります。

まだ名前空間を要求していない場合は、以下のコマンドを実行して要求できます。
```sh
circleci namespace create <name> <vcs-type> <org-name> [flags]
```

### 次のステップ

Orb の作成について解説した [Orb オーサリング プロセス]({{site.baseurl}}/ja/2.0/orb-author/) ガイドに進んでください。


## 関連項目
{:.no_toc}

- [Orb のオーサリング]({{site.baseurl}}/ja/2.0/orb-author/)
- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/orb-concepts/)
- [Orb オーサリングに関するよくあるご質問]({{site.baseurl}}/ja/2.0/orb-author-faq/)
