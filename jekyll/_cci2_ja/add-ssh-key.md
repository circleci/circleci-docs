---
layout: classic-docs
title: "CircleCI に SSH 鍵を登録する"
short-title: "CircleCI に SSH 鍵を登録する"
description: "CircleCI に SSH 鍵を追加する方法"
order: 20
---

サーバーへのデプロイに SSH アクセスが必要な場合は、CircleCI に SSH 鍵を登録する必要があります。

## 概要

CircleCI に SSH 鍵を登録する必要があるケースは、以下の 2 パターンです。

1. バージョン管理システムからコードをチェックアウトする
2. 実行中のプロセスが他のサービスにアクセスできるようにする

1 つ目の目的で SSH 鍵を登録する場合は、[GitHub と Bitbucket のインテグレーションに関するドキュメント]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#プロジェクトで追加のプライベート-リポジトリのチェックアウトの有効化)を参照してください。 2 つ目が目的のときは、以下の手順でプロジェクトに SSH 鍵を登録します。

## 手順

FIXME: BELOW TEXT NEEDS UPDATING WITH THE SAME CHANGES AS OTHER PLACES:

1. ターミナルから、`ssh-keygen -t ed25519 -C "your_email@example.com"` コマンドを入力して鍵を生成します。 詳細については、[Secure Shell (SSH) のドキュメント](https://www.ssh.com/ssh/keygen/)を参照してください。

2. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。

3. **[Permissions (権限)]** セクションで、**[SSH Permissions (SSH の権限)]** をクリックします。

4. **[Add SSH Key (SSH 鍵を追加する)]** ボタンをクリックします。

5. **[Hostname (ホスト名)]** フィールドに鍵に関連付けるホスト名を入力します (例: git.heroku.com)。 ホスト名を指定しない場合は、どのホストに対しても同じ鍵が使われます。

6. **[Private Key (非公開鍵)]** フィールドに登録する SSH 鍵を貼り付けます。

7. **[Add SSH Key (SSH 鍵を追加する)]** ボタンをクリックします。

FIXME: BELOW TEXT NEEDS UPDATING WITH THE SAME CHANGES AS OTHER PLACES:

**メモ:** CircleCI が SSH 鍵を復号化できるよう、鍵には常に空のパスフレーズを設定してください。 また、CircleCI は OpenSSH のデフォルトのファイル形式をサポートしていません。OpenSSH を使用して鍵を生成する場合は、`ssh-keygen -m pem` コマンドを使用します。

**メモ:** 最近 `ssh-keygen` は、デフォルトで PEM 形式の鍵を生成しないように更新されました。 非公開鍵が `-----BEGIN RSA PRIVATE KEY-----` で始まらない場合、`ssh-keygen -m PEM -t rsa -C "your_email@example.com"` コマンドで鍵を生成すると、強制的に PEM 形式で生成できます。

## ジョブに SSH 鍵を登録する

すべての CircleCI ジョブは、`ssh-agent` を使用して登録済みのすべての SSH 鍵に自動的に署名します。ただし、コンテナに実際に鍵を登録するには、`add_ssh_keys` キーを使用する**必要があります**。

複数の SSH 鍵をまとめてコンテナに登録するには、設定ファイル内の適切な[ジョブ]({{ site.baseurl }}/ja/2.0/jobs-steps/)を選択して、[`add_ssh_keys`]({{ site.baseurl }}/ja/2.0/configuration-reference/#add_ssh_keys) という特別なステップを実行します。

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**メモ:** `fingerprints` リスト内のすべてのフィンガープリントが、CircleCI アプリケーションを通じて登録された鍵と一致している必要があります。

## ホスト名を指定せずに複数の鍵を登録する

ホスト名を指定せずに複数の SSH 鍵をプロジェクトに登録するには、CircleCI のデフォルトの SSH 設定に変更を加える必要があります。 たとえば、同じホストに別々の目的でアクセスする複数の SSH 鍵がある場合、デフォルトの `IdentitiesOnly no` が設定され、接続では ssh-agent が使用されます。 このとき、その鍵が正しい鍵がどうかにかかわらず、常に最初の鍵が使用されます。 コンテナに SSH 鍵を登録している場合は、適切なブロックに `IdentitiesOnly no` を設定するか、`ssh-add -D` コマンドを実行し、`ssh-add /path/to/key` コマンドで登録された鍵を読み取って、このジョブで使用する ssh-agent からすべての鍵を削除します。

## 関連項目

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/ja/2.0/gh-bb-integration/)
