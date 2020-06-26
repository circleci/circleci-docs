---
layout: classic-docs
title: "Orb のオーサリング – CircleCI CLI のセットアップ"
short-title: "CLI のセットアップ"
description: "Orb のオーサリング用に CircleCI CLI をセットアップする方法"
categories:
  - getting-started
order: 1
---

* 目次
{:toc}

## CircleCI CLI の概要

CircleCI CLI には、Orb パブリッシュ パイプラインを管理するコマンドがいくつかあります。 CLI について学習するなら、CLI をインストールして circleci help を実行してみるのが一番の早道です。 詳細については「CircleCI ローカル CLI の使用」を参照してください。 以下に、Orb の作成、バリデーション、パブリッシュに特に関連するコマンドをいくつか示します。

- `circleci namespace create <name> <vcs-type> <org-name> [flags]`
- `circleci orb create <namespace>/<orb> [flags]`
- `circleci orb validate <path> [flags]`
- `circleci orb publish <path> <namespace>/<orb>@<version> [flags]`
- `circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]`
- `circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]`

CircleCI CLI のすべてのヘルプ コマンドは、[CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)で参照できます。

## Orb のオーサリング – CircleCI CLI

Orb 作成者として新しい Orb を作成するには、まず CircleCI CLI をインストールする必要があります。 CircleCI CLI で関連するコマンドを使用すると、Orb のオーサリング作業を簡素化できるため、すばやく簡単に新しい Orb を作成できます。 Orb を作成できるよう CircleCI CLI をセットアップするには、以下の手順を実行します。

- CLI の初回インストールを行う
- CLI を更新する
- CLI を構成する

### CLI の初回インストールを行う

初めて Circleci CLI を新規にインストールする場合は、以下のコマンドを実行します。

`curl -fLSs https://circle.ci/cli | bash`

CircleCI アプリケーションは、デフォルトで `/usr/local/bin` ディレクトリにインストールされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、sudo コマンドを使用してください。 または、bash の実行時に `DESTDIR` 環境変数を定義して、CLI を別の場所にインストールすることも可能です。

`curl -fLSs https://circle.ci/cli | DESTDIR=/opt/bin/bash`

#### Homebrew

Homebrew を使用する場合は、以下のコマンドを実行します。

`brew install circleci`

#### Snapcraft

Snapcraft を使用して CLI をインストールする場合は、以下のコマンドを実行します。

`sudo snap install circleci`

### CLI を更新する

以前のバージョンの CircleCI を使用しており、現在 `0.1.6` よりも古いバージョンを実行している場合は、以下のコマンドを実行して CLI を最新のバージョンに更新します。

`circleci update` `circleci switch`

**メモ:** 書き込みアクセス権を持っていない場合は、`sudo` コマンドを使用してください。 これで、CLI が `/usr/local/bin` ディレクトリにインストールされます。

CircleCI には、バージョン管理システムが組み込まれています。 CLI をインストールした後に、CLI にインストールする必要があるアップデートの有無を確認するには、以下のコマンドを実行します。

`circleci update check` `circleci update install`

### CLI を構成する

CircleCI CLI のインストールが完了したら、CLI を使用するための構成を行います。 CLI を構成するプロセスは単純で、必要な手順はわずかです。

CLI を構成する前に、必要に応じて、まず [Personal API Token (パーソナル API トークン)] タブから CircleCI API トークンを生成します。

`$ circleci setup`

circleci.com 上で CLI ツールを使用している場合は、提供されたデフォルトの CircleCI Host を受け入れます。

プライベート環境にインストールされた CircleCI を使用している場合は、デフォルト値を circleci.your-org.com などのカスタム アドレスに変更します。

**メモ:** プライベート クラウドまたはデータセンターにインストールされる CircleCI は、構成処理と Orbs をサポートしていません。したがって、`circleci local execute` (以前の `circleci build`) しか使用できません。

## 次のステップ
{:.no_toc}

- 次に行うべき手順については、「[Orb のオーサリング プロセス]({{site.baseurl}}/2.0/orb-author/)」を参照してください。
